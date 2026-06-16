import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createGitTagName,
  getPackageAccess,
  isPackageVersionPublished,
  parsePackOutput,
  parsePublishArgs,
  sortPackagesForPublish,
} from './publish-packages.mjs'

test('treats exact npm view success as already published', () => {
  assert.equal(
    isPackageVersionPublished({
      code: 0,
      stdout: JSON.stringify({ version: '0.1.0' }),
      stderr: '',
    }),
    true,
  )
})

test('treats npm E404 as unpublished', () => {
  assert.equal(
    isPackageVersionPublished({
      code: 1,
      stdout: '',
      stderr: 'npm error code E404\nnpm error 404 "@scope/pkg@0.1.0" is not in this registry',
    }),
    false,
  )
})

test('throws on npm view failures that are not missing packages', () => {
  assert.throws(
    () =>
      isPackageVersionPublished({
        code: 1,
        stdout: '',
        stderr: 'npm error code E401\nnpm error Incorrect or missing password.',
      }),
    /npm view failed/,
  )
})

test('uses package publishConfig access over the fallback access', () => {
  assert.equal(getPackageAccess({ publishConfig: { access: 'public' } }, 'restricted'), 'public')
})

test('parses pnpm pack JSON output', () => {
  assert.equal(
    parsePackOutput(
      JSON.stringify({
        filename: '/tmp/pkg-0.1.0.tgz',
      }),
    ),
    '/tmp/pkg-0.1.0.tgz',
  )
})

test('creates changesets-compatible package tags', () => {
  assert.equal(createGitTagName('@solid-ant-design/core', '0.1.0'), '@solid-ant-design/core@0.1.0')
})

test('parses changesets action tag arguments', () => {
  assert.equal(parsePublishArgs(['--tag', 'next']), 'next')
})

test('sorts internal dependencies before dependents', () => {
  const sorted = sortPackagesForPublish([
    {
      packageJson: {
        name: '@solid-ant-design/core',
        dependencies: {
          '@solid-ant-design/cssinjs': '0.1.0',
          '@solid-ant-design/theme': '0.1.0',
        },
      },
    },
    { packageJson: { name: '@solid-ant-design/theme' } },
    { packageJson: { name: '@solid-ant-design/cssinjs' } },
  ])

  assert.deepEqual(
    sorted.map((pkg) => pkg.packageJson.name),
    ['@solid-ant-design/cssinjs', '@solid-ant-design/theme', '@solid-ant-design/core'],
  )
})
