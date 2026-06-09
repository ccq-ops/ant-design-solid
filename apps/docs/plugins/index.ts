import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import tailwindcss from '@tailwindcss/vite'
import solid from 'vite-plugin-solid'
import { demoBlockMdxPlugin } from './mdx-demo-block-vite-plugin'

export function createDocsVitePlugins() {
  return [
    demoBlockMdxPlugin(),
    mdx({
      jsxImportSource: 'solid-js/h',
      providerImportSource: '/src/components/demo-block',
      remarkPlugins: [remarkGfm],
    }),
    solid({ include: [/\.[mc]?[tj]sx$/, /virtual:demo-block/] }),
    tailwindcss(),
  ]
}
