import type { ParentProps } from 'solid-js'

export function Preview(props: ParentProps) {
  return (
    <section class="docs-border my-4 overflow-hidden rounded-lg border" data-preview-root>
      {props.children}
    </section>
  )
}

export function PreviewStage(props: ParentProps) {
  return (
    <div class="docs-demo-preview px-4 py-4" data-preview-stage>
      <div class="docs-text-tertiary mb-2 text-[11px] font-medium uppercase tracking-wide">
        Example
      </div>
      <div class="min-h-0 overflow-x-auto">{props.children}</div>
    </div>
  )
}

export function PreviewPanel(props: ParentProps) {
  return (
    <div class="docs-border docs-surface-subtle border-t" data-preview-panel>
      {props.children}
    </div>
  )
}
