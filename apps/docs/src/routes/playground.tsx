import { createEffect, createMemo, createSignal, onMount } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { Input } from '@solid-ant-design/core'
import { getDemoSource } from './playground-registry'
import { compilePlaygroundSource } from './playground-runtime'
import './playground.css'

const playgroundPanelClass =
  'min-w-0 rounded-lg border border-[color-mix(in_hsl,var(--sb-decoration-color)_18%,transparent)] bg-[color-mix(in_hsl,var(--sb-background-color)_94%,transparent)] p-4'
const playgroundErrorClass =
  'mt-2 mb-0 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md bg-[var(--sb-code-background-color)] p-4 text-[var(--sb-code-text-color)]'
const playgroundStageClass = 'mt-2 min-h-96 py-2'

export default function PlaygroundPage() {
  const location = useLocation()
  const sourceFromLocation = createMemo(() => getDemoSource(location.search))
  const [sourceCode, setSourceCode] = createSignal(sourceFromLocation().source)
  const [canRenderPreview, setCanRenderPreview] = createSignal(false)
  const result = createMemo(() => compilePlaygroundSource(sourceCode()))

  onMount(() => {
    setCanRenderPreview(true)
  })

  createEffect(() => {
    setSourceCode(sourceFromLocation().source)
  })

  const renderPreview = () => {
    const source = sourceFromLocation()

    if (source.sourceType === 'missing-demo') {
      return (
        <pre class={playgroundErrorClass} role="alert">
          <code>{source.error}</code>
        </pre>
      )
    }

    if (!canRenderPreview()) {
      return <div class={playgroundStageClass} />
    }

    const compiled = result()

    if (!compiled.ok) {
      return (
        <pre class={playgroundErrorClass} role="alert">
          <code>{compiled.error}</code>
        </pre>
      )
    }

    const Component = compiled.component

    return (
      <div class={playgroundStageClass}>
        <Component />
      </div>
    )
  }

  return (
    <main class="grid gap-5 p-[clamp(1rem,4vw,2rem)]">
      <header>
        <h1 class="m-0 font-[var(--sb-font-headings)] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] font-medium text-[var(--sb-heading-color)]">
          Playground
        </h1>
      </header>
      <section
        class="grid grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] gap-4 max-[56rem]:grid-cols-[minmax(0,1fr)]"
        aria-label="Playground workspace"
      >
        <div class={`${playgroundPanelClass} grid gap-2`}>
          <label
            class="text-sm font-medium text-[var(--sb-heading-color)]"
            for="docs-playground-source"
          >
            Source
          </label>
          <Input.TextArea
            id="docs-playground-source"
            aria-label="Playground source"
            class="min-h-[28rem] font-[var(--sb-font-mono)]"
            value={sourceCode()}
            rows={18}
            onInput={(event) => setSourceCode(event.currentTarget.value)}
          />
        </div>
        <div class={playgroundPanelClass} aria-label="Playground preview">
          <div class="text-sm font-medium text-[var(--sb-heading-color)]">Preview</div>
          {renderPreview()}
        </div>
      </section>
    </main>
  )
}
