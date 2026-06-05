import { For, Show, splitProps } from 'solid-js'
import { CheckOutlined, CloseOutlined } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useStepsStyle } from './steps.style'
import type { StepItem, StepsProps, StepsStatus } from './interface'

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

export function Steps(props: StepsProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'current',
    'status',
    'direction',
    'size',
    'type',
    'onChange',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-steps`
  const [, hashId] = useStepsStyle(prefixCls())

  const items = () => local.items ?? []
  const current = () => normalizeCurrent(local.current, items().length)
  const direction = () => local.direction ?? 'horizontal'
  const size = () => local.size ?? 'default'
  const type = () => local.type ?? 'default'
  const currentStatus = () => local.status ?? DEFAULT_STATUS

  function handleChange(index: number, item: StepItem): void {
    if (type() !== 'navigation' || item.disabled) return
    local.onChange?.(index)
  }

  function itemLabel(index: number, item: StepItem): string {
    const title = textContent(item.title)
    return title ? `Go to step ${index + 1}: ${title}` : `Go to step ${index + 1}`
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${direction()}`,
        size() === 'small' && `${prefixCls()}-small`,
        type() === 'navigation' && `${prefixCls()}-navigation`,
        hashId(),
        local.class,
      )}
    >
      <ol class={`${prefixCls()}-list`}>
        <For each={items()}>
          {(item, index) => {
            const status = () => getItemStatus(item, index(), current(), currentStatus())
            const isCurrent = () => index() === current()
            const clickable = () => type() === 'navigation' && !item.disabled
            const content = () => (
              <>
                <span class={`${prefixCls()}-item-icon`} aria-hidden="true">
                  {item.icon ?? defaultIcon(status(), index())}
                </span>
                <span class={`${prefixCls()}-item-content`}>
                  <span class={`${prefixCls()}-item-title`}>{item.title}</span>
                  <Show when={item.description}>
                    <span class={`${prefixCls()}-item-description`}>{item.description}</span>
                  </Show>
                </span>
              </>
            )

            return (
              <li
                class={classNames(
                  `${prefixCls()}-item`,
                  `${prefixCls()}-item-${status()}`,
                  item.disabled && `${prefixCls()}-item-disabled`,
                )}
                aria-current={isCurrent() ? 'step' : undefined}
                aria-disabled={item.disabled || undefined}
              >
                <span class={`${prefixCls()}-item-tail`} aria-hidden="true" />
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
              </li>
            )
          }}
        </For>
      </ol>
    </div>
  )
}
