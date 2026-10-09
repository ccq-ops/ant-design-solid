import assert from 'node:assert/strict'
import test from 'node:test'

import { readFile } from 'node:fs/promises'

test('pins the reviewed Ant Design API baseline', async () => {
  const config = JSON.parse(
    await readFile(new URL('./antd-api-audit.config.json', import.meta.url), 'utf8'),
  )

  assert.equal(config.version, '6.6.5')
})

test('keeps the generated baseline machine readable', async () => {
  const baseline = JSON.parse(
    await readFile(new URL('./antd-api-baseline.json', import.meta.url), 'utf8'),
  )

  assert.equal(baseline.version, '6.6.5')
  assert.ok(baseline.upstreamExports.includes('Listy'))
  assert.ok(baseline.localExports.includes('Listy'))
  assert.ok(!baseline.missingFromLocal.includes('Listy'))
  assert.deepEqual(baseline.unclassifiedMissing, [])
  assert.equal(baseline.classifiedMissing.List.status, 'deprecated-compat')
  assert.ok(Array.isArray(baseline.solidSpecificExports))
})
