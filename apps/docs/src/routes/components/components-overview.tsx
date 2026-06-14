import { For, Show, createMemo, createSignal } from 'solid-js'

const componentGroups = [
  'General',
  'Layout',
  'Navigation',
  'Data Entry',
  'Data Display',
  'Feedback',
  'Other',
] as const

type ComponentGroup = (typeof componentGroups)[number]

interface ComponentDocModule {
  frontmatter?: {
    title?: string
    group?: ComponentGroup
  }
}

interface ComponentCard {
  title: string
  group: ComponentGroup
  href: string
}

const componentModules = import.meta.glob<ComponentDocModule>('./*.mdx', { eager: true })

function isComponentGroup(value: unknown): value is ComponentGroup {
  return typeof value === 'string' && componentGroups.includes(value as ComponentGroup)
}

function titleFromSlug(slug: string) {
  if (slug === 'qrcode') {
    return 'QRCode'
  }

  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function componentsFromModules(modules: Record<string, ComponentDocModule>): ComponentCard[] {
  return Object.entries(modules)
    .filter(([path]) => path !== './index.mdx')
    .map(([path, module]) => {
      const slug = path.replace(/^\.\//, '').replace(/\.mdx$/, '')
      const group = module.frontmatter?.group

      if (!isComponentGroup(group)) {
        return undefined
      }

      return {
        title: module.frontmatter?.title || titleFromSlug(slug),
        group,
        href: `/components/${slug}`,
      }
    })
    .filter((component): component is ComponentCard => Boolean(component))
    .sort((a, b) => {
      const groupOrder = componentGroups.indexOf(a.group) - componentGroups.indexOf(b.group)

      if (groupOrder !== 0) {
        return groupOrder
      }

      return a.title.localeCompare(b.title)
    })
}

const componentCards = componentsFromModules(componentModules)

export function ComponentOverview() {
  const [query, setQuery] = createSignal('')
  const normalizedQuery = createMemo(() => query().trim().toLowerCase())
  const filteredComponents = createMemo(() => {
    const value = normalizedQuery()

    if (!value) {
      return componentCards
    }

    return componentCards.filter((component) => component.title.toLowerCase().includes(value))
  })
  const groupedComponents = createMemo(() =>
    componentGroups
      .map((group) => ({
        group,
        components: filteredComponents().filter((component) => component.group === group),
      }))
      .filter((section) => section.components.length > 0),
  )

  return (
    <section class="not-prose mt-10 space-y-12" aria-label="Component catalogue">
      <div
        class="rounded-lg border border-[color-mix(in_hsl,var(--sb-decoration-color)_22%,transparent)] bg-[color-mix(in_hsl,var(--sb-background-color)_88%,transparent)] p-4 sm:p-5"
        aria-label="Component search"
      >
        <label class="block max-w-2xl">
          <span class="sr-only">Search components</span>
          <input
            role="searchbox"
            type="search"
            value={query()}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search components"
            aria-label="Search components"
            class="h-12 w-full rounded-md border border-[color-mix(in_hsl,var(--sb-decoration-color)_42%,transparent)] bg-[var(--sb-background-color)] px-4 text-base leading-6 text-[var(--sb-text-color)] outline-none transition-colors placeholder:text-[var(--sb-text-color)] placeholder:opacity-50 focus:border-[color-mix(in_hsl,var(--sb-active-link-color)_70%,transparent)] focus:ring-3 focus:ring-[color-mix(in_hsl,var(--sb-active-link-color)_16%,transparent)]"
          />
        </label>
      </div>

      <Show
        when={groupedComponents().length > 0}
        fallback={
          <p class="rounded-lg border border-[color-mix(in_hsl,var(--sb-decoration-color)_22%,transparent)] bg-[color-mix(in_hsl,var(--sb-background-color)_88%,transparent)] px-5 py-8 text-sm text-[var(--sb-text-color)] opacity-75">
            No components found.
          </p>
        }
      >
        <div class="space-y-14">
          <For each={groupedComponents()}>
            {(section) => (
              <section class="space-y-5" aria-labelledby={`components-${section.group}`}>
                <div>
                  <h2
                    id={`components-${section.group}`}
                    class="text-[1.375rem] leading-8 font-semibold tracking-normal text-[var(--sb-heading-color)]"
                  >
                    {section.group}
                  </h2>
                  <p class="mt-1 text-sm text-[var(--sb-text-color)] opacity-65">
                    {section.components.length} component
                    {section.components.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div class="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4">
                  <For each={section.components}>
                    {(component) => (
                      <a
                        href={component.href}
                        class="flex min-h-16 items-center rounded-lg border border-[color-mix(in_hsl,var(--sb-decoration-color)_22%,transparent)] bg-[color-mix(in_hsl,var(--sb-background-color)_88%,transparent)] px-4 py-3 text-sm leading-5 font-medium text-[var(--sb-heading-color)] no-underline transition-colors hover:border-[color-mix(in_hsl,var(--sb-active-link-color)_50%,transparent)] hover:bg-[color-mix(in_hsl,var(--sb-active-link-color)_5%,var(--sb-background-color))] hover:text-[var(--sb-active-link-color)]"
                      >
                        {component.title}
                      </a>
                    )}
                  </For>
                </div>
              </section>
            )}
          </For>
        </div>
      </Show>
    </section>
  )
}
