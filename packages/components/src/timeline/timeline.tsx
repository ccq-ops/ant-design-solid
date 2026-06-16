import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { LoadingOutlined } from '@ant-design-solid/solid-icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { Steps } from '../steps'
import type { StepItem } from '../steps'
import type {
  TimelineItem,
  TimelineMode,
  TimelinePlacement,
  TimelineProps,
  TimelineSemanticClassNames,
} from './interface'
import { useTimelineStyle } from './timeline.style'

const presetColors = new Set(['blue', 'red', 'green', 'gray'])

function getPlacement(item: TimelineItem, index: number, mode: TimelineMode): TimelinePlacement {
  if (item.placement) return item.placement
  if (mode === 'alternate') return index % 2 === 0 ? 'start' : 'end'
  return mode
}

function formatTitleSpan(titleSpan: number | string | undefined): string | undefined {
  if (titleSpan === undefined) return undefined
  return typeof titleSpan === 'number' ? `${titleSpan}px` : titleSpan
}

function mapSemanticClasses(
  classNames: TimelineSemanticClassNames | undefined,
): TimelineSemanticClassNames {
  return {
    root: classNames?.root,
    list: classNames?.list,
    item: classNames?.item,
    itemTitle: classNames?.itemTitle,
    itemIcon: classNames?.itemIcon,
    itemContent: classNames?.itemContent,
    itemRail: classNames?.itemRail,
    itemWrapper: classNames?.itemWrapper,
    itemSection: classNames?.itemSection,
    itemHeader: classNames?.itemHeader,
  }
}

function toStepItem(
  item: TimelineItem,
  index: number,
  mode: TimelineMode,
  prefixCls: string,
): StepItem {
  const color = item.color ?? 'blue'
  const isPresetColor = presetColors.has(color)
  const placement = getPlacement(item, index, mode)
  const customColorStyle = isPresetColor
    ? undefined
    : ({ [`--${prefixCls}-item-icon-color`]: color } as Record<string, string>)

  return {
    title: item.title,
    description: item.content,
    icon: item.icon ?? (item.loading ? <LoadingOutlined /> : undefined),
    status: item.loading ? 'process' : 'finish',
    class: classNames(
      `${prefixCls}-item-placement-${placement}`,
      isPresetColor && `${prefixCls}-item-color-${color}`,
      item.loading && `${prefixCls}-item-loading`,
      item.class,
      item.className,
    ),
    style: { ...customColorStyle, ...item.style },
    classNames: item.classNames,
    styles: item.styles,
  }
}

export function Timeline(props: TimelineProps) {
  const [local] = splitProps(props, [
    'items',
    'mode',
    'orientation',
    'variant',
    'titleSpan',
    'reverse',
    'prefixCls',
    'rootClassName',
    'className',
    'class',
    'classList',
    'style',
    'classNames',
    'styles',
    'id',
    'role',
    'tabIndex',
    'title',
    'ref',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-timeline`
  const [, hashId] = useTimelineStyle(prefixCls())
  const mode = () => local.mode ?? 'start'
  const orientation = () => local.orientation ?? 'vertical'
  const variant = () => local.variant ?? 'outlined'
  const stepsItems = () => {
    const normalized = (local.items ?? []).map((item, index) =>
      toStepItem(item, index, mode(), prefixCls()),
    )
    return local.reverse ? normalized.reverse() : normalized
  }
  const rootStyle = () => {
    const titleSpan = formatTitleSpan(local.titleSpan)
    return {
      ...(titleSpan ? { [`--${prefixCls()}-title-span`]: titleSpan } : undefined),
      ...local.styles?.root,
      ...(local.style as JSX.CSSProperties | undefined),
    }
  }

  return (
    <Steps
      id={local.id}
      role={local.role}
      tabIndex={local.tabIndex}
      title={local.title}
      rootComponent="ol"
      itemComponent="li"
      prefixCls={prefixCls()}
      type="dot"
      orientation={orientation()}
      variant={variant()}
      current={(local.items?.length ?? 1) - 1}
      items={stepsItems()}
      class={classNames(
        hashId(),
        `${prefixCls()}-${orientation()}`,
        `${prefixCls()}-variant-${variant()}`,
        mode() === 'alternate' && `${prefixCls()}-layout-alternate`,
        local.rootClassName,
        local.className,
        local.class,
      )}
      classList={local.classList}
      classNames={mapSemanticClasses(local.classNames)}
      styles={{ ...local.styles, root: rootStyle() }}
    />
  )
}
