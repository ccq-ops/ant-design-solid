import { createEffect, createMemo, createSignal } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { Input } from '@ant-design-solid/core'
import { sourceCodeFromLocationSearch } from '../docs-theme/preview-utils'
import { compilePlaygroundSource } from './playground-runtime'
import './playground.css'

export default function PlaygroundPage() {
  const location = useLocation()
  const sourceCodeFromQuery = createMemo(() => sourceCodeFromLocationSearch(location.search))
  const [sourceCode, setSourceCode] = createSignal(sourceCodeFromQuery())
  const result = createMemo(() => compilePlaygroundSource(sourceCode()))

  createEffect(() => {
    setSourceCode(sourceCodeFromQuery())
  })

  const renderPreview = () => {
    const compiled = result()

    if (!compiled.ok) {
      return (
        <pre class="docs-playground-error" role="alert">
          <code>{compiled.error}</code>
        </pre>
      )
    }

    const Component = compiled.component

    return (
      <div class="docs-playground-stage">
        <Component />
      </div>
    )
  }

  return (
    <main class="docs-playground">
      <header class="docs-playground-header">
        <h1>Playground</h1>
      </header>
      <section class="docs-playground-workspace" aria-label="Playground workspace">
        <div class="docs-playground-editor">
          <label for="docs-playground-source">Source</label>
          <Input.TextArea
            id="docs-playground-source"
            aria-label="Playground source"
            value={sourceCode()}
            rows={18}
            onInput={(event) => setSourceCode(event.currentTarget.value)}
          />
        </div>
        <div class="docs-playground-preview" aria-label="Playground preview">
          <div class="docs-playground-preview-title">Preview</div>
          {renderPreview()}
        </div>
      </section>
    </main>
  )
}
