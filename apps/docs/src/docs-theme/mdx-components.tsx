import { Show, createMemo, createSignal, onMount, type ParentProps } from 'solid-js'
import {
  Preview,
  PreviewStage,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  a,
  blockquote,
  code,
  hr,
  li,
  ol,
  p,
  table,
  ul,
  DirectiveContainer,
  Step,
  Steps,
} from '@kobalte/solidbase/default-theme/mdx-components.jsx'
import { playgroundHref, sourceCodeFromChildren, sourceCodeFromElement } from './preview-utils'
import './preview-panel.css'

const previewPanelActionBaseClass =
  'inline-flex min-h-8 items-center justify-center rounded-md border border-[color-mix(in_hsl,var(--sb-decoration-color)_24%,transparent)] bg-[color-mix(in_hsl,var(--sb-background-color)_84%,transparent)] px-2.5 py-1 text-sm leading-5 text-[var(--sb-text-color)] no-underline [font:inherit] [cursor:var(--sb-button-cursor)] max-[40rem]:flex-1'
const previewPanelActionClass = `${previewPanelActionBaseClass} hover:border-[color-mix(in_hsl,var(--sb-active-link-color)_48%,transparent)] hover:text-[var(--sb-heading-color)]`

export {
  Preview,
  PreviewStage,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  a,
  blockquote,
  code,
  hr,
  li,
  ol,
  p,
  table,
  ul,
  DirectiveContainer,
  Step,
  Steps,
}

export function PreviewPanel(props: ParentProps) {
  const [expanded, setExpanded] = createSignal(false)
  const [renderedSourceCode, setRenderedSourceCode] = createSignal('')
  const sourceCode = createMemo(
    () => renderedSourceCode() || sourceCodeFromChildren(props.children),
  )
  let sourceRef: HTMLDivElement | undefined

  onMount(() => {
    setRenderedSourceCode(sourceCodeFromElement(sourceRef))
  })

  return (
    <div
      class="border-t border-t-[color-mix(in_hsl,var(--sb-decoration-color)_14%,transparent)] bg-[var(--sb-code-background-color)]"
      data-preview-panel
      data-collapsed={!expanded()}
    >
      <div class="flex min-h-11 items-center justify-end gap-2 px-3 py-2 max-[40rem]:justify-stretch max-[40rem]:px-2">
        <button
          type="button"
          class={previewPanelActionClass}
          aria-expanded={expanded()}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded() ? 'Hide code' : 'Show code'}
        </button>
        <Show
          when={sourceCode()}
          fallback={
            <span class={`${previewPanelActionBaseClass} cursor-default opacity-[0.66]`}>
              Playground unavailable
            </span>
          }
        >
          {(code) => (
            <a class={previewPanelActionClass} href={playgroundHref(code())}>
              Open in playground
            </a>
          )}
        </Show>
      </div>
      <div
        ref={(element) => {
          sourceRef = element
        }}
        class="docs-preview-panel-source px-4 pb-4 max-[40rem]:px-3.5 max-[40rem]:pb-3.5"
        hidden={!expanded()}
      >
        {props.children}
      </div>
    </div>
  )
}
