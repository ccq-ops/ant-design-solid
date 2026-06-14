import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const docsSrc = join(process.cwd(), 'src')
const scannedExtensions = new Set(['.ts', '.tsx', '.css', '.mdx'])
const allowedFiles = new Set([
  'pages/components/color-picker.tsx',
  'pages/components/config-provider.tsx',
  'pages/components/date-picker.tsx',
  'pages/components/progress.tsx',
  'pages/components/qrcode.tsx',
  'pages/components/slider.tsx',
  'pages/components/statistic.tsx',
  'pages/components/tag.tsx',
  'pages/docs/theming.tsx',
])

function extensionOf(filePath: string) {
  const match = filePath.match(/\.[^.]+$/)
  return match?.[0] ?? ''
}

function collectFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      return collectFiles(fullPath)
    }

    return scannedExtensions.has(extensionOf(fullPath)) ? [fullPath] : []
  })
}

const forbiddenPatterns = [
  /background:\s*['"]#fff(?:fff)?['"]/g,
  /background:\s*['"]#fafafa['"]/g,
  /background:\s*['"]#f5f5f5['"]/g,
  /background:\s*['"]rgba\(0,\s*0,\s*0,\s*0\.02\)['"]/g,
  /border:\s*['"]1px solid #f0f0f0['"]/g,
  /border:\s*['"]1px solid #d9d9d9['"]/g,
  /border:\s*['"]1px dashed #d9d9d9['"]/g,
  /railColor=["']#f0f0f0["']/g,
  /color:\s*['"]#666['"]/g,
  /color:\s*['"]rgba\(0,\s*0,\s*0,\s*0\.(?:25|45|65|88)\)['"]/g,
  /\bbg-white\b/g,
  /bg-\[radial-gradient\([^"'`]*255,255,255/g,
]

describe('docs dark mode color guard', () => {
  it('does not use hardcoded light container colors in docs UI files', () => {
    const violations = collectFiles(docsSrc).flatMap((filePath) => {
      const relativePath = relative(docsSrc, filePath)

      if (allowedFiles.has(relativePath)) {
        return []
      }

      const source = readFileSync(filePath, 'utf8')

      return forbiddenPatterns.flatMap((pattern) => {
        pattern.lastIndex = 0
        return Array.from(source.matchAll(pattern), (match) => {
          const line = source.slice(0, match.index).split('\n').length
          return `${relativePath}:${line}: ${match[0]}`
        })
      })
    })

    expect(violations).toEqual([])
  })
})
