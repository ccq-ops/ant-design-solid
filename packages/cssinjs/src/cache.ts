import type { StyleCache } from './types'

export function createCache(): StyleCache {
  const styles = new Map<string, string>()
  return {
    register(key, css) { if (styles.has(key)) return false; styles.set(key, css); return true },
    has(key) { return styles.has(key) },
    get(key) { return styles.get(key) },
    entries() { return Array.from(styles.entries()) },
    size() { return styles.size },
  }
}
export function extractStyle(cache?: StyleCache): string { return cache ? cache.entries().map(([, css]) => css).join('\n') : '' }
