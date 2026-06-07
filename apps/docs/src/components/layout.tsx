import { MoonOutlined, SunOutlined } from '@ant-design-solid/icons'
import { A, useLocation } from '@solidjs/router'
import { For, Show, createMemo, type JSX } from 'solid-js'
import { sideNavGroups, topNavItems } from '../routes'
import { useDocsTheme } from './theme-context'

const sidebarLinkClass =
  'rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 hover:text-blue-600'
const sidebarActiveLinkClass = 'bg-blue-50 text-blue-600 font-medium'

function groupFromPath(pathname: string) {
  return pathname.split('/').filter(Boolean).at(0)
}

export function Layout(props: { children?: JSX.Element }) {
  const location = useLocation()
  const docsTheme = useDocsTheme()
  const sidebarItems = createMemo(() => {
    const group = groupFromPath(location.pathname)

    return group ? (sideNavGroups[group] ?? []) : []
  })
  const showSidebar = createMemo(() => location.pathname !== '/')

  return (
    <div class="min-h-screen">
      <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-8 backdrop-blur">
        <A class="text-lg font-bold text-blue-600" href="/">
          Ant Design Solid
        </A>
        <nav class="flex gap-6 text-black/65">
          <For each={topNavItems}>
            {(item) => (
              <A class="transition-colors hover:text-blue-600" href={item.path}>
                {item.label}
              </A>
            )}
          </For>
          <a
            class="transition-colors hover:text-blue-600"
            href="https://github.com/ant-design-solid/ant-design-solid"
          >
            GitHub
          </a>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-base transition-colors hover:border-blue-600 hover:text-blue-600"
            aria-label={
              docsTheme.mode() === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
            }
            onClick={docsTheme.toggleTheme}
          >
            {docsTheme.mode() === 'light' ? <MoonOutlined /> : <SunOutlined />}
          </button>
        </nav>
      </header>
      <div
        class={
          showSidebar()
            ? 'grid min-h-[calc(100vh-4rem)] grid-cols-[260px_minmax(0,1fr)]'
            : 'min-h-[calc(100vh-4rem)]'
        }
      >
        <Show when={showSidebar()}>
          <aside class="sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-2 overflow-y-auto border-r border-gray-200 p-6">
            <Show when={sidebarItems().length > 0}>
              <For each={sidebarItems()}>
                {(item) => (
                  <A
                    href={item.path}
                    class={sidebarLinkClass}
                    activeClass={sidebarActiveLinkClass}
                    end
                    noScroll
                  >
                    {item.label}
                  </A>
                )}
              </For>
            </Show>
          </aside>
        </Show>
        <main class="mx-auto w-full max-w-[1100px] px-14 py-10">{props.children}</main>
      </div>
    </div>
  )
}
