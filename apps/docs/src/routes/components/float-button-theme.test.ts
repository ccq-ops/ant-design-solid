import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(join(process.cwd(), 'src/routes/components/float-button.mdx'), 'utf8')

const forbiddenLightThemeColors = [
  /border:\s*['"]1px dashed #d9d9d9['"]/g,
  /background:\s*['"]#fafafa['"]/g,
  /styles=\{\{ content: \{ color: '#1677ff' \} \}\}/g,
]

describe('float button docs theme colors', () => {
  it('does not use hardcoded light colors in examples', () => {
    const violations = forbiddenLightThemeColors.flatMap((pattern) => {
      pattern.lastIndex = 0
      return Array.from(source.matchAll(pattern), (match) => {
        const line = source.slice(0, match.index).split('\n').length
        return `${line}: ${match[0]}`
      })
    })

    expect(violations).toEqual([])
  })
})
