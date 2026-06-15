import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Timeline docs', () => {
  const source = readFileSync(join(process.cwd(), 'src/routes/components/timeline.mdx'), 'utf8')

  it('uses Ant Design v6 aligned examples', () => {
    expect(source).toContain('Create a services site 2015-09-01')
    expect(source).toContain('Solve initial network problems 2015-09-01')
    expect(source).toContain('Technical testing 2015-09-01')
    expect(source).toContain('Network problems being solved 2015-09-01')
    expect(source).toContain('<Timeline {...sharedProps} mode="start" />')
    expect(source).toContain('<Timeline {...sharedProps} mode="end" />')
    expect(source).toContain('<Timeline {...sharedProps} mode="alternate" />')
  })
})
