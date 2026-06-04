import type { JSX } from 'solid-js'

export function DemoBlock(props: { title: string; code: string; children: JSX.Element }) {
  return (
    <section
      class="my-6 overflow-hidden rounded-xl border border-gray-200"
      aria-label={props.title}
    >
      <h3 class="m-0 border-b border-gray-200 px-5 py-4 text-lg font-semibold">{props.title}</h3>
      <div class="p-6">{props.children}</div>
      <pre class="m-0 overflow-auto bg-gray-50 px-5 py-4 text-sm">
        <code>{props.code}</code>
      </pre>
    </section>
  )
}
