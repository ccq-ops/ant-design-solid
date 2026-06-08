import { MoonOutlined, SunOutlined } from '@ant-design-solid/icons'
import { A, useLocation } from '@solidjs/router'
import { For, Show, createEffect, createMemo, type JSX } from 'solid-js'
import { sideNavGroups, topNavItems } from '../routes'
import { useDocsTheme } from './theme-context'

const sidebarLinkClass =
  'flex justify-center rounded-lg px-3 py-2 text-center transition-colors hover:bg-blue-50 hover:text-blue-600'
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
  let sidebarRef: HTMLElement | undefined

  createEffect(() => {
    if (location.pathname === '/') return

    const activeSidebarLink = sidebarRef?.querySelector<HTMLElement>('[aria-current="page"]')

    if (typeof activeSidebarLink?.scrollIntoView === 'function') {
      activeSidebarLink.scrollIntoView({ block: 'nearest' })
    }
  })

  return (
    <div class="min-h-screen">
      <header class="docs-border docs-surface sticky top-0 z-10 flex h-16 items-center justify-between border-b px-8 backdrop-blur">
        <A class="text-lg font-bold text-blue-600" href="/">
          Ant Design Solid
        </A>
        <nav class="docs-text-secondary flex items-center gap-6">
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
            class="docs-border inline-flex h-8 w-8 items-center justify-center rounded-full border text-base leading-none transition-colors hover:border-blue-600 hover:text-blue-600"
            aria-label={
              docsTheme.mode() === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
            }
            onClick={docsTheme.toggleTheme}
          >
            {docsTheme.mode() === 'light' ? (
              <MoonOutlined class="block" />
            ) : (
              <SunOutlined class="block" />
            )}
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
          <aside
            ref={(element) => {
              sidebarRef = element
            }}
            class="docs-border sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-2 overflow-y-auto border-r p-6"
          >
            <Show when={sidebarItems().length > 0}>
              <For each={sidebarItems()}>
                {(item) => (
                  <A
                    href={item.path}
                    class={sidebarLinkClass}
                    activeClass={sidebarActiveLinkClass}
                    end
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
