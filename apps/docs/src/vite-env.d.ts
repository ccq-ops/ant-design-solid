/// <reference types="vite/client" />

declare module '*.css'

declare module '*.mdx' {
  import type { Component } from 'solid-js'

  export const frontmatter: Record<string, unknown>

  const MDXComponent: Component<Record<string, unknown>>
  export default MDXComponent
}
