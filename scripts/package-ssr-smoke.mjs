import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const repositoryRoot = path.resolve(import.meta.dirname, '..')
const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'ant-design-solid-ssr-'))
const scopeDirectory = path.join(fixtureRoot, 'node_modules', '@solid-ant-design')
const runnerPath = path.join(fixtureRoot, 'runner.mjs')

try {
  await mkdir(scopeDirectory, { recursive: true })
  await Promise.all(
    [
      ['core', 'components'],
      ['cssinjs', 'cssinjs'],
      ['icons', 'icons'],
      ['theme', 'theme'],
    ].map(([packageName, directory]) =>
      symlink(
        path.join(repositoryRoot, 'packages', directory),
        path.join(scopeDirectory, packageName),
        'dir',
      ),
    ),
  )

  await writeFile(
    runnerPath,
    `
import assert from 'node:assert/strict'
import { createComponent } from ${JSON.stringify(import.meta.resolve('solid-js'))}
import { renderToString } from ${JSON.stringify(import.meta.resolve('solid-js/web'))}
import { Button } from '@solid-ant-design/core/button'
import { StyleProvider, createCache, extractStyle } from '@solid-ant-design/cssinjs'
import { SearchOutlined } from '@solid-ant-design/icons/icons/search-outlined'

const cache = createCache()
const html = renderToString(() =>
  createComponent(StyleProvider, {
    cache,
    get children() {
      return createComponent(Button, {
        icon: createComponent(SearchOutlined, {}),
        type: 'primary',
        children: 'SSR button',
      })
    },
  }),
)
const styles = extractStyle(cache, {
  format: 'style-tag',
  nonce: 'package-smoke-nonce',
})

assert.match(html, /SSR button/)
assert.match(html, /<svg/)
assert.match(html, /ads-btn/)
assert.ok(cache.size() > 0)
assert.match(styles, /data-ant-design-solid=/)
assert.match(styles, /nonce="package-smoke-nonce"/)
`,
  )

  const result = await execFileAsync(process.execPath, [runnerPath], {
    cwd: fixtureRoot,
    env: { ...process.env, NODE_OPTIONS: '' },
  })
  assert.equal(result.stderr, '')
  console.log('Core component and icon Node exports render and extract styles successfully.')
} finally {
  await rm(fixtureRoot, { recursive: true, force: true })
}
