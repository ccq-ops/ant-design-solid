import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const packageDirectories = readdirSync('packages', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join('packages', entry.name))

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1
    return false
  }

  return true
}

for (const packageDirectory of packageDirectories) {
  console.log(`\n## ${packageDirectory}`)

  if (!run('pnpm', ['exec', 'publint', '--strict', packageDirectory])) {
    break
  }

  if (
    !run('pnpm', [
      'exec',
      'attw',
      '--pack',
      packageDirectory,
      '--format',
      'table',
      '--no-emoji',
      '--no-color',
    ])
  ) {
    break
  }
}
