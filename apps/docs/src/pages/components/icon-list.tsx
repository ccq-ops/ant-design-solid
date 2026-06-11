import * as Icons from '@ant-design-solid/icons'
import { For, type Component, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import type { IconProps } from '@ant-design-solid/icons'

export type IconCategory = 'Outlined' | 'Filled' | 'TwoTone'

export type IconMeta = {
  name: string
  category: IconCategory
  component: Component<IconProps>
}

const categorySuffixes: IconCategory[] = ['Outlined', 'Filled', 'TwoTone']

function categoryFromName(name: string): IconCategory | undefined {
  return categorySuffixes.find((category) => name.endsWith(category))
}

export const allIcons: IconMeta[] = Object.entries(Icons)
  .map(([name, component]) => {
    const category = categoryFromName(name)

    if (!category) {
      return undefined
    }

    return {
      name,
      category,
      component: component as Component<IconProps>,
    }
  })
  .filter((icon): icon is IconMeta => icon !== undefined)
  .sort((first, second) => first.name.localeCompare(second.name))

export const outlinedIcons = allIcons.filter((icon) => icon.category === 'Outlined')
export const filledIcons = allIcons.filter((icon) => icon.category === 'Filled')
export const twoToneIcons = allIcons.filter((icon) => icon.category === 'TwoTone')

export function IconSample(props: { name: string; children: JSX.Element }) {
  return (
    <div class="docs-border flex min-h-24 flex-col items-center justify-center gap-2 rounded border px-2 py-3 text-center">
      <div class="text-2xl leading-none text-blue-600">{props.children}</div>
      <span class="docs-text-secondary max-w-full break-all text-xs leading-4">{props.name}</span>
    </div>
  )
}

export function IconGrid(props: { title: string; icons: IconMeta[] }) {
  return (
    <section class="my-8">
      <h3>{props.title}</h3>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <For each={props.icons}>
          {(icon) => (
            <IconSample name={icon.name}>
              <Dynamic component={icon.component} aria-label={icon.name} />
            </IconSample>
          )}
        </For>
      </div>
    </section>
  )
}
