import { createResource, createSignal, Show, type Component } from 'solid-js'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from 'shiki/langs/bash.mjs'
import javascript from 'shiki/langs/javascript.mjs'
import jsx from 'shiki/langs/jsx.mjs'
import tsx from 'shiki/langs/tsx.mjs'
import typescript from 'shiki/langs/typescript.mjs'
import githubLight from 'shiki/themes/github-light.mjs'

type DemoBlockProps = {
  title: string
  code: string
  language?: string
  component: Component
}

type HighlightedCodeProps = {
  code: string
  language: string
}

const loadedLanguages = new Set([
  'tsx',
  'jsx',
  'typescript',
  'javascript',
  'bash',
  'sh',
  'shell',
  'zsh',
])
let highlighter: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [githubLight],
    langs: [tsx, jsx, typescript, javascript, bash],
    engine: createJavaScriptRegexEngine(),
  })

  return highlighter
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function renderPlainCode(props: HighlightedCodeProps) {
  return `<pre data-language="${props.language}" class="m-0 overflow-auto bg-transparent px-4 py-3 text-xs leading-5"><code>${escapeHtml(props.code)}</code></pre>`
}

async function renderHighlightedCode(props: HighlightedCodeProps) {
  if (!loadedLanguages.has(props.language)) {
    return renderPlainCode(props)
  }

  const shiki = await getHighlighter()
  const html = shiki.codeToHtml(props.code, {
    lang: props.language,
    theme: 'github-light',
  })

  return html.replace(
    '<pre class="shiki',
    `<pre data-language="${props.language}" class="shiki m-0 overflow-auto px-5 py-4 text-sm`,
  )
}

function HighlightedCode(props: HighlightedCodeProps) {
  const [html] = createResource(
    () => ({ code: props.code, language: props.language }),
    renderHighlightedCode,
  )

  return (
    <Show
      when={html()}
      fallback={
        <pre
          data-language={props.language}
          class="m-0 overflow-auto bg-transparent px-4 py-3 text-xs leading-5"
        >
          <code>{props.code}</code>
        </pre>
      }
    >
      {(highlightedHtml) => <div innerHTML={highlightedHtml()} />}
    </Show>
  )
}

export function DemoBlock(props: DemoBlockProps) {
  const [codeVisible, setCodeVisible] = createSignal(false)
  const language = () => props.language ?? 'tsx'

  return (
    <section class="docs-border my-4 overflow-hidden rounded-lg border" aria-label={props.title}>
      <h3 class="docs-border docs-text m-0 border-b px-4 py-2.5 text-base font-semibold">
        {props.title}
      </h3>
      <div data-demo-block-preview class="docs-demo-preview px-4 py-4">
        <div class="docs-text-tertiary mb-2 text-[11px] font-medium uppercase tracking-wide">
          Example
        </div>
        <props.component />
      </div>
      <div data-demo-block-code class="docs-border docs-surface-subtle border-t">
        <div class="docs-border docs-text-tertiary flex items-center justify-between border-b px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide">
          <span>Code</span>
          <button
            type="button"
            class="docs-text-secondary rounded px-2 py-1 text-[11px] font-medium normal-case tracking-normal transition-colors hover:bg-gray-200 hover:text-blue-600"
            aria-expanded={codeVisible()}
            onClick={() => setCodeVisible((visible) => !visible)}
          >
            {codeVisible() ? 'Hide code' : 'Show code'}
          </button>
        </div>
        <div data-demo-block-code-body class={codeVisible() ? undefined : 'hidden'}>
          <HighlightedCode code={props.code} language={language()} />
        </div>
      </div>
    </section>
  )
}
