import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { navItems } from './routes'

export function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="site-shell">
      <header class="site-header">
        <A class="site-logo" href="/">
          Ant Design Solid
        </A>
        <nav class="site-topnav">
          <A href="/docs/getting-started">Docs</A>
          <A href="/components/button">Components</A>
          <a href="https://github.com/ant-design-solid/ant-design-solid">GitHub</a>
        </nav>
      </header>
      <div class="site-body">
        <aside class="site-sidebar">
          <For each={navItems}>{(item) => <A href={item.path}>{item.label}</A>}</For>
        </aside>
        <main class="site-main">{props.children}</main>
      </div>
    </div>
  )
}
