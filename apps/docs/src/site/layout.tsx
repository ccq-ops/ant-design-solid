import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { navItems } from './routes'

const sidebarLinkClass =
  'rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 hover:text-blue-600'
const sidebarActiveLinkClass = 'bg-blue-50 text-blue-600 font-medium'

export function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="min-h-screen">
      <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-8 backdrop-blur">
        <A class="text-lg font-bold text-blue-600" href="/">
          Ant Design Solid
        </A>
        <nav class="flex gap-6 text-black/65">
          <A class="transition-colors hover:text-blue-600" href="/docs/getting-started">
            Docs
          </A>
          <A class="transition-colors hover:text-blue-600" href="/components/button">
            Components
          </A>
          <a
            class="transition-colors hover:text-blue-600"
            href="https://github.com/ant-design-solid/ant-design-solid"
          >
            GitHub
          </a>
        </nav>
      </header>
      <div class="grid min-h-[calc(100vh-4rem)] grid-cols-[260px_minmax(0,1fr)]">
        <aside class="flex flex-col gap-2 border-r border-gray-200 p-6">
          <For each={navItems}>
            {(item) => (
              <A href={item.path} class={sidebarLinkClass} activeClass={sidebarActiveLinkClass} end>
                {item.label}
              </A>
            )}
          </For>
        </aside>
        <main class="max-w-[1100px] px-14 py-10">{props.children}</main>
      </div>
    </div>
  )
}
