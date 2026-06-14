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
    <div class="docs-preview-panel" data-preview-panel data-collapsed={!expanded()}>
      <div class="docs-preview-panel-toolbar">
        <button
          type="button"
          class="docs-preview-panel-button"
          aria-expanded={expanded()}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded() ? 'Hide code' : 'Show code'}
        </button>
        <Show
          when={sourceCode()}
          fallback={<span class="docs-preview-panel-link-disabled">Playground unavailable</span>}
        >
          {(code) => (
            <a class="docs-preview-panel-link" href={playgroundHref(code())}>
              Open in playground
            </a>
          )}
        </Show>
      </div>
      <div
        ref={(element) => {
          sourceRef = element
        }}
        class="docs-preview-panel-source"
        hidden={!expanded()}
      >
        {props.children}
      </div>
    </div>
  )
}
