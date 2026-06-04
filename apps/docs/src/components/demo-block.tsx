import { createResource, createSignal, Show, type JSX } from 'solid-js'
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
  children: JSX.Element
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
    <section
      class="my-4 overflow-hidden rounded-lg border border-gray-200"
      aria-label={props.title}
    >
      <h3 class="m-0 border-b border-gray-200 px-4 py-2.5 text-base font-semibold">
        {props.title}
      </h3>
      <div data-demo-block-preview class="bg-white px-4 py-4">
        <div class="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
          Example
        </div>
        {props.children}
      </div>
      <div data-demo-block-code class="border-t border-gray-200 bg-slate-50">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">
          <span>Code</span>
          <button
            type="button"
            class="rounded px-2 py-1 text-[11px] font-medium normal-case tracking-normal text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
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
