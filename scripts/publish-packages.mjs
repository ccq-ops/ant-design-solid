import { execFile } from 'node:child_process'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export function createGitTagName(packageName, version) {
  return `${packageName}@${version}`
}

export function getPackageAccess(packageJson, fallbackAccess = 'restricted') {
  return packageJson.publishConfig?.access ?? fallbackAccess
}

export function isPackageVersionPublished(result) {
  if (result.code === 0) {
    return true
  }

  const output = `${result.stdout}\n${result.stderr}`
  if (output.includes('E404') || output.includes('code E404')) {
    return false
  }

  throw new Error(`npm view failed:\n${output.trim()}`)
}

export function parsePackOutput(stdout) {
  const trimmed = stdout.trim()

  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed)
    if (typeof parsed.filename === 'string' && parsed.filename.length > 0) {
      return parsed.filename
    }
  }

  const match = stdout.match(/Tarball Details\s*\n([^\n]+\.tgz)/m) ?? stdout.match(/([^\s]+\.tgz)/)
  if (match?.[1]) {
    return match[1].trim()
  }

  throw new Error(`Could not find packed tarball path in pnpm pack output:\n${stdout}`)
}

export function parsePublishArgs(args) {
  const tagIndex = args.indexOf('--tag')
  if (tagIndex !== -1) {
    return args[tagIndex + 1] ?? 'latest'
  }

  return args[0] ?? 'latest'
}

export function sortPackagesForPublish(packages) {
  const packageNames = new Set(packages.map((pkg) => pkg.packageJson.name))
  const sorted = []
  const visiting = new Set()
  const visited = new Set()
  const byName = new Map(packages.map((pkg) => [pkg.packageJson.name, pkg]))

  function visit(pkg) {
    const name = pkg.packageJson.name
    if (visited.has(name)) {
      return
    }

    if (visiting.has(name)) {
      throw new Error(`Circular workspace dependency detected at ${name}`)
    }

    visiting.add(name)
    const dependencyNames = Object.keys(pkg.packageJson.dependencies ?? {})
      .filter((dependencyName) => packageNames.has(dependencyName))
      .sort()

    for (const dependencyName of dependencyNames) {
      visit(byName.get(dependencyName))
    }

    visiting.delete(name)
    visited.add(name)
    sorted.push(pkg)
  }

  for (const pkg of packages) {
    visit(pkg)
  }

  return sorted
}

async function run(command, args, options = {}) {
  try {
    const result = await execFileAsync(command, args, {
      ...options,
      maxBuffer: 1024 * 1024 * 20,
    })

    return {
      code: 0,
      stdout: result.stdout,
      stderr: result.stderr,
    }
  } catch (error) {
    return {
      code: error.code ?? 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? error.message,
    }
  }
}

async function runChecked(command, args, options = {}) {
  const result = await run(command, args, options)
  if (result.code !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed with exit code ${result.code}:\n${result.stderr || result.stdout}`,
    )
  }
  return result
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function readWorkspacePackageDirs(cwd) {
  const workspace = await readFile(path.join(cwd, 'pnpm-workspace.yaml'), 'utf8')
  const packageDirs = []

  for (const line of workspace.split('\n')) {
    const match = line.match(/^\s*-\s*['"]?(packages\/\*)['"]?\s*$/)
    if (!match) {
      continue
    }

    const packagesDir = path.join(cwd, 'packages')
    const entries = await readdir(packagesDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        packageDirs.push(path.join(packagesDir, entry.name))
      }
    }
  }

  return packageDirs.sort()
}

async function getPublicWorkspacePackages(cwd) {
  const packageDirs = await readWorkspacePackageDirs(cwd)
  const packages = []

  for (const dir of packageDirs) {
    const packageJson = await readJson(path.join(dir, 'package.json'))
    if (packageJson.private || !packageJson.name || !packageJson.version) {
      continue
    }

    packages.push({
      dir,
      packageJson,
    })
  }

  return sortPackagesForPublish(packages)
}

async function isAlreadyPublished(packageJson) {
  const result = await run('npm', [
    'view',
    `${packageJson.name}@${packageJson.version}`,
    'version',
    '--json',
  ])
  return isPackageVersionPublished(result)
}

async function packPackage(pkg, cwd, destination) {
  const result = await runChecked(
    'corepack',
    ['pnpm', '--filter', pkg.packageJson.name, 'pack', '--pack-destination', destination, '--json'],
    { cwd },
  )

  return parsePackOutput(result.stdout)
}

async function publishTarball(tarball, packageJson, tag, access) {
  await runChecked('npm', ['publish', tarball, '--tag', tag, '--access', access])
  console.log(`Published ${packageJson.name}@${packageJson.version}`)
}

async function tagPublishedPackage(packageJson) {
  const tag = createGitTagName(packageJson.name, packageJson.version)
  const exists = await run('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`])
  if (exists.code === 0) {
    console.log(`Git tag ${tag} already exists`)
    return
  }

  await runChecked('git', ['tag', tag])
  await runChecked('git', ['push', 'origin', tag])
  console.log(`Created git tag ${tag}`)
}

async function main() {
  const cwd = process.cwd()
  const tag = parsePublishArgs(process.argv.slice(2))
  const changesetConfig = await readJson(path.join(cwd, '.changeset', 'config.json'))
  const fallbackAccess = changesetConfig.access ?? 'restricted'
  const packages = await getPublicWorkspacePackages(cwd)
  const packDir = await mkdtemp(path.join(tmpdir(), 'ant-design-solid-publish-'))
  const published = []

  try {
    for (const pkg of packages) {
      const { name, version } = pkg.packageJson
      if (await isAlreadyPublished(pkg.packageJson)) {
        console.log(`${name}@${version} is already published`)
        continue
      }

      console.log(`Publishing ${name}@${version}`)
      const tarball = await packPackage(pkg, cwd, packDir)
      await publishTarball(
        tarball,
        pkg.packageJson,
        tag,
        getPackageAccess(pkg.packageJson, fallbackAccess),
      )
      published.push(pkg.packageJson)
    }

    for (const packageJson of published) {
      await tagPublishedPackage(packageJson)
    }
  } finally {
    await rm(packDir, { recursive: true, force: true })
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
