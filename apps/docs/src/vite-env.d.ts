/// <reference types="vite/client" />

declare module '*.css'

declare module '*.mdx' {
  import type { Component } from 'solid-js'

  export const frontmatter: Record<string, unknown>

  const MDXComponent: Component<Record<string, unknown>>
  export default MDXComponent
}

declare module '*.md' {
  import type { Component } from 'solid-js'

  export const frontmatter: Record<string, unknown>

  const MDXComponent: Component<Record<string, unknown>>
  export default MDXComponent
}

declare module 'virtual:components-changelog.mdx' {
  import type { Component } from 'solid-js'

  const MDXComponent: Component<Record<string, unknown>>
  export default MDXComponent
}

declare module 'virtual:docs-playground-registry' {
  export const demoSources: Array<{ id: string; source: string }>
}
