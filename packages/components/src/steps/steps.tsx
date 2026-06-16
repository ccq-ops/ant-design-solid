import { createEffect, createSignal, For, onCleanup, Show, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { CheckOutlined, CloseOutlined } from '@solid-ant-design/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useStepsStyle } from './steps.style'
import type {
  StepItem,
  StepsProps,
  StepsSemanticClassNames,
  StepsSemanticKey,
  StepsSemanticStyles,
  StepsStatus,
} from './interface'

const DEFAULT_CURRENT = 0
const DEFAULT_INITIAL = 0
const DEFAULT_STATUS: StepsStatus = 'process'
const RESPONSIVE_BREAKPOINT = 532

function normalizeCurrent(current: number | undefined, length: number): number {
  if (length <= 0) return -1
  const numeric = Number(current ?? DEFAULT_CURRENT)
  if (!Number.isFinite(numeric)) return DEFAULT_CURRENT
  return Math.min(length - 1, Math.max(0, Math.floor(numeric)))
}

function normalizeNumber(value: number | undefined, defaultValue: number): number {
  const numeric = Number(value ?? defaultValue)
  return Number.isFinite(numeric) ? Math.floor(numeric) : defaultValue
}

function clampPercent(percent: number | undefined): number | undefined {
  if (percent === undefined) return undefined
  const numeric = Number(percent)
  if (!Number.isFinite(numeric)) return undefined
  return Math.min(100, Math.max(0, numeric))
}

function getItemStatus(
  item: StepItem,
  index: number,
  current: number,
  currentStatus: StepsStatus,
): StepsStatus {
  if (item.status) return item.status
  if (index < current) return 'finish'
  if (index === current) return currentStatus
  return 'wait'
}

function defaultIcon(
  prefixCls: string,
  status: StepsStatus,
  index: number,
  initial: number,
  percent?: number,
) {
  if (status === 'finish') return <CheckOutlined />
  if (status === 'error') return <CloseOutlined />
  const numberNode = <span class={`${prefixCls}-item-icon-number`}>{index + initial + 1}</span>
  if (status !== 'process' || percent === undefined) return numberNode
  const degree = percent * 3.6
  return (
    <span
      class={`${prefixCls}-progress-icon`}
      role="img"
      aria-label={`${percent}%`}
      style={{
        'background-image': `conic-gradient(currentColor ${degree}deg, transparent ${degree}deg)`,
      }}
    >
      {numberNode}
    </span>
  )
}

function textContent(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function mergeSlotClass(
  key: StepsSemanticKey,
  propsClasses: StepsSemanticClassNames,
  itemClasses?: StepItem['classNames'],
): string | undefined {
  const itemSlotClasses = itemClasses as Partial<Record<StepsSemanticKey, string>> | undefined
  return classNames(propsClasses?.[key], itemSlotClasses?.[key])
}

function mergeSlotStyle(
  key: StepsSemanticKey,
  propsStyles: StepsSemanticStyles,
  itemStyles?: StepItem['styles'],
): JSX.CSSProperties | undefined {
  const itemSlotStyles = itemStyles as
    | Partial<Record<StepsSemanticKey, JSX.CSSProperties>>
    | undefined
  const merged = { ...propsStyles?.[key], ...itemSlotStyles?.[key] }
  return Object.keys(merged).length > 0 ? merged : undefined
}

export function Steps(props: StepsProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'current',
    'initial',
    'status',
    'direction',
    'orientation',
    'labelPlacement',
    'titlePlacement',
    'size',
    'type',
    'variant',
    'percent',
    'progressDot',
    'responsive',
    'ellipsis',
    'offset',
    'prefixCls',
    'className',
    'rootClassName',
    'onChange',
    'iconRender',
    'class',
    'classNames',
    'styles',
    'style',
    'rootComponent',
    'itemComponent',
    'ref',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-steps`
  const [, hashId] = useStepsStyle(prefixCls())

  const [responsiveVertical, setResponsiveVertical] = createSignal(false)

  createEffect(() => {
    const enabled = local.responsive ?? true
    if (!enabled || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setResponsiveVertical(false)
      return
    }

    const mediaQuery = window.matchMedia(`(max-width: ${RESPONSIVE_BREAKPOINT}px)`)
    const update = () => setResponsiveVertical(mediaQuery.matches)
    update()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update)
      onCleanup(() => mediaQuery.removeEventListener('change', update))
      return
    }

    mediaQuery.addListener?.(update)
    onCleanup(() => mediaQuery.removeListener?.(update))
  })

  const items = () => local.items ?? []
  const current = () => normalizeCurrent(local.current, items().length)
  const initial = () => normalizeNumber(local.initial, DEFAULT_INITIAL)
  const type = () => {
    if (local.type && local.type !== 'default') return local.type
    if (local.progressDot) return 'dot'
    return local.type ?? 'default'
  }
  const isDot = () => type() === 'dot' || type() === 'inline'
  const direction = () => {
    if (type() === 'panel') return 'horizontal'
    if ((local.responsive ?? true) && responsiveVertical()) return 'vertical'
    return local.orientation ?? local.direction ?? 'horizontal'
  }
  const titlePlacement = () => {
    if (isDot()) return direction() === 'vertical' ? 'horizontal' : 'vertical'
    if (type() === 'navigation') return 'horizontal'
    return local.titlePlacement ?? local.labelPlacement ?? 'horizontal'
  }
  const size = () => local.size ?? 'medium'
  const variant = () => local.variant ?? 'filled'
  const percent = () => (type() === 'inline' ? undefined : clampPercent(local.percent))
  const currentStatus = () => local.status ?? DEFAULT_STATUS
  const RootComponent = () => local.rootComponent ?? 'div'
  const listComponent = () => (RootComponent() === 'ol' ? 'div' : 'ol')
  const itemComponent = () => local.itemComponent ?? 'li'
  const semanticProps = (): StepsProps => ({
    ...props,
    type: type(),
    orientation: direction(),
    titlePlacement: titlePlacement(),
    size: size(),
    variant: variant(),
    percent: percent(),
  })
  const rootClassNames = () =>
    typeof local.classNames === 'function'
      ? local.classNames({ props: semanticProps() })
      : (local.classNames ?? {})
  const rootStyles = () =>
    typeof local.styles === 'function'
      ? local.styles({ props: semanticProps() })
      : (local.styles ?? {})
  const rootClass = () =>
    classNames(
      prefixCls(),
      `${prefixCls()}-${direction()}`,
      titlePlacement() === 'vertical' && `${prefixCls()}-title-placement-vertical`,
      size() === 'small' && `${prefixCls()}-small`,
      type() !== 'default' && `${prefixCls()}-${type()}`,
      isDot() && `${prefixCls()}-dot`,
      local.ellipsis && `${prefixCls()}-ellipsis`,
      percent() !== undefined && type() === 'default' && `${prefixCls()}-with-progress`,
      hashId(),
      local.class,
      local.className,
      local.rootClassName,
      rootClassNames().root,
    )
  const rootStyle = () => ({
    [`--${prefixCls()}-items-offset`]: `${normalizeNumber(local.offset, 0)}`,
    ...rootStyles().root,
    ...(local.style as JSX.CSSProperties | undefined),
  })
  const commonRootProps = () => ({
    id: rest.id,
    role: rest.role,
    tabIndex: rest.tabIndex,
    title: rest.title,
  })

  function handleChange(index: number, item: StepItem): void {
    if (!local.onChange || item.disabled) return
    local.onChange?.(index)
  }

  function handleItemClick(event: MouseEvent, item: StepItem): void {
    if (item.disabled) return
    item.onClick?.(event as MouseEvent & { currentTarget: HTMLElement; target: Element })
  }

  function itemLabel(index: number, item: StepItem): string {
    const title = textContent(item.title)
    return title ? `Go to step ${index + 1}: ${title}` : `Go to step ${index + 1}`
  }

  const renderItems = () => (
    <For each={items()}>
      {(item, index) => {
        const status = () => getItemStatus(item, index(), current(), currentStatus())
        const isCurrent = () => index() === current()
        const clickable = () => Boolean(local.onChange || item.onClick) && !item.disabled
        const itemContentValue = () => item.content ?? item.description
        const baseIconContent = () =>
          item.icon ??
          (isDot() ? (
            <span class={`${prefixCls()}-item-dot`} />
          ) : (
            defaultIcon(
              prefixCls(),
              status(),
              index(),
              initial(),
              type() === 'default' && isCurrent() ? percent() : undefined,
            )
          ))
        const iconContent = () => {
          const origin = baseIconContent()
          if (isDot() && typeof local.progressDot === 'function') {
            return local.progressDot(origin, {
              index: index(),
              status: status(),
              title: item.title,
              description: item.description,
              content: itemContentValue(),
            })
          }
          return local.iconRender?.(origin, { index: index(), active: isCurrent(), item }) ?? origin
        }
        const renderItemContent = () => (
          <Show when={itemContentValue()}>
            <span
              class={classNames(
                `${prefixCls()}-item-content`,
                mergeSlotClass('itemContent', rootClassNames(), item.classNames),
              )}
              style={mergeSlotStyle('itemContent', rootStyles(), item.styles)}
            >
              {itemContentValue()}
            </span>
          </Show>
        )
        const content = (showContent = true) => (
          <span
            class={classNames(
              `${prefixCls()}-item-wrapper`,
              mergeSlotClass('itemWrapper', rootClassNames(), item.classNames),
            )}
            style={mergeSlotStyle('itemWrapper', rootStyles(), item.styles)}
          >
            <span
              class={classNames(
                `${prefixCls()}-item-section`,
                mergeSlotClass('itemSection', rootClassNames(), item.classNames),
              )}
              style={mergeSlotStyle('itemSection', rootStyles(), item.styles)}
            >
              <span
                class={classNames(
                  `${prefixCls()}-item-header`,
                  mergeSlotClass('itemHeader', rootClassNames(), item.classNames),
                )}
                style={mergeSlotStyle('itemHeader', rootStyles(), item.styles)}
              >
                <span
                  class={classNames(
                    `${prefixCls()}-item-icon`,
                    `${prefixCls()}-item-icon-${variant()}`,
                    mergeSlotClass('itemIcon', rootClassNames(), item.classNames),
                  )}
                  style={mergeSlotStyle('itemIcon', rootStyles(), item.styles)}
                  aria-hidden="true"
                >
                  {iconContent()}
                </span>
                <span
                  class={classNames(
                    `${prefixCls()}-item-title`,
                    mergeSlotClass('itemTitle', rootClassNames(), item.classNames),
                  )}
                  style={mergeSlotStyle('itemTitle', rootStyles(), item.styles)}
                >
                  {item.title}
                </span>
                <Show when={item.subTitle}>
                  <span
                    class={classNames(
                      `${prefixCls()}-item-subtitle`,
                      mergeSlotClass('itemSubtitle', rootClassNames(), item.classNames),
                    )}
                    style={mergeSlotStyle('itemSubtitle', rootStyles(), item.styles)}
                  >
                    {item.subTitle}
                  </span>
                </Show>
              </span>
              <Show when={showContent}>{renderItemContent()}</Show>
            </span>
          </span>
        )

        return (
          <Dynamic
            component={itemComponent()}
            class={classNames(
              `${prefixCls()}-item`,
              `${prefixCls()}-item-${status()}`,
              item.disabled && `${prefixCls()}-item-disabled`,
              mergeSlotClass('item', rootClassNames(), item.classNames),
              item.class,
              item.className,
            )}
            style={item.style}
            aria-current={isCurrent() ? 'step' : undefined}
            aria-disabled={item.disabled || undefined}
            onClick={(event: MouseEvent) => handleItemClick(event, item)}
          >
            <Show when={direction() === 'vertical'}>
              <span
                class={classNames(
                  `${prefixCls()}-item-rail`,
                  `${prefixCls()}-item-tail`,
                  mergeSlotClass('itemRail', rootClassNames(), item.classNames),
                )}
                style={mergeSlotStyle('itemRail', rootStyles(), item.styles)}
                aria-hidden="true"
              />
            </Show>
            <Show
              when={clickable()}
              fallback={
                <span class={`${prefixCls()}-item-container`}>
                  {content(direction() === 'vertical')}
                </span>
              }
            >
              <button
                type="button"
                class={`${prefixCls()}-item-container`}
                aria-label={itemLabel(index(), item)}
                aria-current={isCurrent() ? 'step' : undefined}
                onClick={() => handleChange(index(), item)}
              >
                {content(direction() === 'vertical')}
              </button>
            </Show>
            <Show when={direction() === 'horizontal'}>
              <span
                class={classNames(
                  `${prefixCls()}-item-rail`,
                  `${prefixCls()}-item-tail`,
                  mergeSlotClass('itemRail', rootClassNames(), item.classNames),
                )}
                style={mergeSlotStyle('itemRail', rootStyles(), item.styles)}
                aria-hidden="true"
              />
              {renderItemContent()}
            </Show>
            <Show when={type() === 'panel'}>
              <span class={`${prefixCls()}-panel-arrow`} aria-hidden="true" />
            </Show>
          </Dynamic>
        )
      }}
    </For>
  )

  const wrappedItems = () => (
    <Dynamic
      component={listComponent()}
      class={classNames(`${prefixCls()}-list`, rootClassNames().list)}
      style={rootStyles().list}
    >
      {renderItems()}
    </Dynamic>
  )

  return (
    <Show
      when={RootComponent() === 'ol'}
      fallback={
        <div {...rest} class={rootClass()} style={rootStyle()}>
          {wrappedItems()}
        </div>
      }
    >
      <ol {...commonRootProps()} class={rootClass()} style={rootStyle()}>
        {renderItems()}
      </ol>
    </Show>
  )
}
