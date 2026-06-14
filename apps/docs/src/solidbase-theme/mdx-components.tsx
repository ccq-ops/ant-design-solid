import type { ComponentProps, JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { Preview, PreviewPanel, PreviewStage } from './components/preview'

type TableProps = JSX.HTMLAttributes<HTMLTableElement>

export function table(props: TableProps) {
  const [local, others] = splitProps(props, ['class'])

  return (
    <div class="docs-table-scroll" data-mdx-table-scroll>
      <table
        {...others}
        class={['docs-markdown-table', local.class].filter(Boolean).join(' ')}
      />
    </div>
  )
}

export function a(props: ComponentProps<'a'> & { 'data-auto-heading'?: '' }) {
  const outbound = () => (props.href ?? '').includes('//')

  return (
    <a
      target={outbound() ? '_blank' : undefined}
      rel={outbound() ? 'noopener noreferrer' : undefined}
      {...props}
    />
  )
}

export { Preview, PreviewPanel, PreviewStage }
