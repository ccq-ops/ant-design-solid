import type { JSX } from 'solid-js'
export function DemoBlock(props: { title: string; code: string; children: JSX.Element }) { return <section class="demo-block"><h3>{props.title}</h3><div class="demo-preview">{props.children}</div><pre><code>{props.code}</code></pre></section> }
