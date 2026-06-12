import { For, Show, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { CheckOutlined, CloseOutlined } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useStepsStyle } from './steps.style'
import type { StepItem, StepsProps, StepsSemanticKey, StepsStatus } from './interface'

const DEFAULT_CURRENT = 0
const DEFAULT_STATUS: StepsStatus = 'process'

function normalizeCurrent(current: number | undefined, length: number): number {
  if (length <= 0) return -1
  const numeric = Number(current ?? DEFAULT_CURRENT)
  if (!Number.isFinite(numeric)) return DEFAULT_CURRENT
  return Math.min(length - 1, Math.max(0, Math.floor(numeric)))
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

function defaultIcon(status: StepsStatus, index: number) {
  if (status === 'finish') return <CheckOutlined />
  if (status === 'error') return <CloseOutlined />
  return index + 1
}

function textContent(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function mergeSlotClass(
  key: StepsSemanticKey,
  propsClasses: StepsProps['classNames'],
  itemClasses?: StepItem['classNames'],
): string | undefined {
  const itemSlotClasses = itemClasses as Partial<Record<StepsSemanticKey, string>> | undefined
  return classNames(propsClasses?.[key], itemSlotClasses?.[key])
}

function mergeSlotStyle(
  key: StepsSemanticKey,
  propsStyles: StepsProps['styles'],
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
    'status',
    'direction',
    'orientation',
    'size',
    'type',
    'variant',
    'prefixCls',
    'className',
    'onChange',
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

  const items = () => local.items ?? []
  const current = () => normalizeCurrent(local.current, items().length)
  const direction = () => local.orientation ?? local.direction ?? 'horizontal'
  const size = () => local.size ?? 'default'
  const type = () => local.type ?? 'default'
  const variant = () => local.variant ?? 'outlined'
  const currentStatus = () => local.status ?? DEFAULT_STATUS
  const RootComponent = () => local.rootComponent ?? 'div'
  const listComponent = () => (RootComponent() === 'ol' ? 'div' : 'ol')
  const itemComponent = () => local.itemComponent ?? 'li'
  const rootClass = () =>
    classNames(
      prefixCls(),
      `${prefixCls()}-${direction()}`,
      size() === 'small' && `${prefixCls()}-small`,
      type() === 'navigation' && `${prefixCls()}-navigation`,
      type() === 'dot' && `${prefixCls()}-dot`,
      `${prefixCls()}-variant-${variant()}`,
      hashId(),
      local.class,
      local.className,
      local.classNames?.root,
    )
  const rootStyle = () => ({
    ...local.styles?.root,
    ...(local.style as JSX.CSSProperties | undefined),
  })
  const commonRootProps = () => ({
    id: rest.id,
    role: rest.role,
    tabIndex: rest.tabIndex,
    title: rest.title,
  })

  function handleChange(index: number, item: StepItem): void {
    if (type() !== 'navigation' || item.disabled) return
    local.onChange?.(index)
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
        const clickable = () => type() === 'navigation' && !item.disabled
        const iconContent = () =>
          item.icon ??
          (type() === 'dot' ? (
            <span class={`${prefixCls()}-item-dot`} />
          ) : (
            defaultIcon(status(), index())
          ))
        const content = () => (
          <span
            class={classNames(
              `${prefixCls()}-item-wrapper`,
              mergeSlotClass('itemWrapper', local.classNames, item.classNames),
            )}
            style={mergeSlotStyle('itemWrapper', local.styles, item.styles)}
          >
            <span
              class={classNames(
                `${prefixCls()}-item-section`,
                mergeSlotClass('itemSection', local.classNames, item.classNames),
              )}
              style={mergeSlotStyle('itemSection', local.styles, item.styles)}
            >
              <span
                class={classNames(
                  `${prefixCls()}-item-header`,
                  mergeSlotClass('itemHeader', local.classNames, item.classNames),
                )}
                style={mergeSlotStyle('itemHeader', local.styles, item.styles)}
              >
                <span
                  class={classNames(
                    `${prefixCls()}-item-icon`,
                    mergeSlotClass('itemIcon', local.classNames, item.classNames),
                  )}
                  style={mergeSlotStyle('itemIcon', local.styles, item.styles)}
                  aria-hidden="true"
                >
                  {iconContent()}
                </span>
                <span
                  class={classNames(
                    `${prefixCls()}-item-title`,
                    mergeSlotClass('itemTitle', local.classNames, item.classNames),
                  )}
                  style={mergeSlotStyle('itemTitle', local.styles, item.styles)}
                >
                  {item.title}
                </span>
              </span>
              <Show when={item.description}>
                <span
                  class={classNames(
                    `${prefixCls()}-item-content`,
                    mergeSlotClass('itemContent', local.classNames, item.classNames),
                  )}
                  style={mergeSlotStyle('itemContent', local.styles, item.styles)}
                >
                  {item.description}
                </span>
              </Show>
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
              mergeSlotClass('item', local.classNames, item.classNames),
              item.class,
              item.className,
            )}
            style={item.style}
            aria-current={isCurrent() ? 'step' : undefined}
            aria-disabled={item.disabled || undefined}
          >
            <span
              class={classNames(
                `${prefixCls()}-item-rail`,
                `${prefixCls()}-item-tail`,
                mergeSlotClass('itemRail', local.classNames, item.classNames),
              )}
              style={mergeSlotStyle('itemRail', local.styles, item.styles)}
              aria-hidden="true"
            />
            <Show
              when={clickable()}
              fallback={<span class={`${prefixCls()}-item-container`}>{content()}</span>}
            >
              <button
                type="button"
                class={`${prefixCls()}-item-container`}
                aria-label={itemLabel(index(), item)}
                aria-current={isCurrent() ? 'step' : undefined}
                onClick={() => handleChange(index(), item)}
              >
                {content()}
              </button>
            </Show>
          </Dynamic>
        )
      }}
    </For>
  )

  const wrappedItems = () => (
    <Dynamic
      component={listComponent()}
      class={classNames(`${prefixCls()}-list`, local.classNames?.list)}
      style={local.styles?.list}
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
