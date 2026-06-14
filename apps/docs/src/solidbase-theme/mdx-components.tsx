import type { ComponentProps, JSX, ParentProps } from 'solid-js'
import { Show, splitProps } from 'solid-js'
import { Preview, PreviewPanel, PreviewStage } from './components/preview'

type TableProps = JSX.HTMLAttributes<HTMLTableElement>

export function table(props: TableProps) {
  const [local, others] = splitProps(props, ['class'])

  return (
    <div class="docs-table-scroll" data-mdx-table-scroll>
      <table {...others} class={['docs-markdown-table', local.class].filter(Boolean).join(' ')} />
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

export function DirectiveContainer(props: ParentProps<{ title?: string; type?: string }>) {
  if (props.type === 'tab') return <>{props.children}</>

  if (props.type === 'details') {
    return (
      <details class="docs-border docs-surface-subtle my-4 rounded-lg border p-4">
        <summary>{props.title ?? props.type}</summary>
        {props.children}
      </details>
    )
  }

  return (
    <div
      class="docs-border docs-surface-subtle my-4 rounded-lg border p-4"
      data-custom-container={props.type}
    >
      <Show when={props.title !== ' '}>
        <span class="docs-text-strong mb-2 block text-sm font-semibold">
          {props.title ?? props.type}
        </span>
      </Show>
      {props.children}
    </div>
  )
}

export { Preview, PreviewPanel, PreviewStage }
