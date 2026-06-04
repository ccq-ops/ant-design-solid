import { createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { MasonryItem, MasonryProps } from './interface'
import { formatMasonryGap, resolveResponsiveValue } from './responsive'

const DEFAULT_COLUMNS = 4
const DEFAULT_GUTTER = 16

function getWindowWidth() {
  return typeof window === 'undefined' ? 1024 : window.innerWidth
}

export function Masonry<T extends MasonryItem = MasonryItem>(props: MasonryProps<T>) {
  const [local] = splitProps(props, [
    'prefixCls',
    'class',
    'classList',
    'style',
    'columns',
    'gutter',
    'items',
    'itemRender',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-masonry`
  const [viewportWidth, setViewportWidth] = createSignal(getWindowWidth())

  const handleResize = () => setViewportWidth(getWindowWidth())
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
    onCleanup(() => window.removeEventListener('resize', handleResize))
  }

  const columnCount = () => Math.max(1, Math.floor(resolveResponsiveValue(local.columns, DEFAULT_COLUMNS, viewportWidth())))
  const gutter = () => formatMasonryGap(resolveResponsiveValue(local.gutter, DEFAULT_GUTTER, viewportWidth()))

  return (
    <div
      class={classNames(prefixCls(), local.class)}
      classList={local.classList}
      style={{ '--ads-masonry-gutter': gutter(), ...(typeof local.style === 'object' ? local.style : {}) }}
    >
      {Array.from({ length: columnCount() }, (_, columnIndex) => (
        <div class={`${prefixCls()}-column`}>
          {(local.items ?? [])
            .filter((_, itemIndex) => itemIndex % columnCount() === columnIndex)
            .map((item, itemIndex) => local.itemRender?.(item, itemIndex))}
        </div>
      ))}
    </div>
  )
}
