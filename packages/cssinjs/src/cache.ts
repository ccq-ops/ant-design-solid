import { hashString } from './hash'
import type { ExtractStyleOptions, StyleCache } from './types'

export function createCache(): StyleCache {
  const styles = new Map<string, string>()
  return {
    register(key, css) {
      const existingCss = styles.get(key)
      if (existingCss === css) return false
      styles.set(key, css)
      return true
    },
    has(key) {
      return styles.has(key)
    },
    get(key) {
      return styles.get(key)
    },
    entries() {
      return Array.from(styles.entries())
    },
    size() {
      return styles.size
    },
  }
}
function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeStyleContent(css: string): string {
  return css.replace(/<\/style/giu, '<\\/style')
}

export function extractStyle(cache?: StyleCache, options: ExtractStyleOptions = {}): string {
  if (!cache) return ''
  const entries = cache.entries()
  if (options.format !== 'style-tag') {
    return entries.map(([, css]) => css).join('\n')
  }

  const nonce = options.nonce ? ` nonce="${escapeAttribute(options.nonce)}"` : ''
  return entries
    .map(
      ([key, css]) =>
        `<style data-ant-design-solid="${hashString(key)}"${nonce}>${escapeStyleContent(css)}</style>`,
    )
    .join('')
}
