import { For, Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { TimelineItem, TimelinePosition, TimelineProps } from './interface'
import { useTimelineStyle } from './timeline.style'

const semanticColors = new Set(['blue', 'red', 'green', 'gray'])

function getPosition(
  item: TimelineItem,
  index: number,
  mode: TimelineProps['mode'],
): TimelinePosition {
  if (item.position) return item.position
  if (mode === 'right') return 'right'
  if (mode === 'alternate') return index % 2 === 0 ? 'left' : 'right'
  return 'left'
}

function getDotStyle(color: string | undefined) {
  if (!color || semanticColors.has(color)) return undefined
  return { 'border-color': color, background: color }
}

export function Timeline(props: TimelineProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'mode',
    'pending',
    'pendingDot',
    'reverse',
    'prefixCls',
    'class',
    'classList',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-timeline`
  const [, hashId] = useTimelineStyle(prefixCls())
  const entries = () => {
    const base = [...(local.items ?? [])]
    if (local.reverse) base.reverse()
    if (local.pending) {
      base.push({
        children: local.pending === true ? 'Loading...' : local.pending,
        dot: local.pendingDot,
      })
    }
    return base
  }

  return (
    <ol
      {...rest}
      class={classNames(prefixCls(), hashId(), local.class)}
      classList={local.classList}
    >
      <For each={entries()}>
        {(item, index) => {
          const position = () => getPosition(item, index(), local.mode ?? 'left')
          const color = () => item.color ?? 'blue'
          const isSemantic = () => semanticColors.has(color())
          const isPending = () => Boolean(local.pending) && index() === entries().length - 1
          return (
            <li
              class={classNames(
                `${prefixCls()}-item`,
                `${prefixCls()}-item-${position()}`,
                isPending() && `${prefixCls()}-item-pending`,
              )}
            >
              <div class={`${prefixCls()}-item-tail`} />
              <div class={`${prefixCls()}-item-label`}>{item.label}</div>
              <div class={`${prefixCls()}-item-head`}>
                <Show
                  when={item.dot !== undefined && item.dot !== null}
                  fallback={
                    <span
                      class={classNames(
                        `${prefixCls()}-item-dot`,
                        isSemantic() && `${prefixCls()}-item-dot-${color()}`,
                      )}
                      style={getDotStyle(color())}
                    />
                  }
                >
                  <span class={`${prefixCls()}-item-dot-custom`}>{item.dot}</span>
                </Show>
              </div>
              <div class={`${prefixCls()}-item-content`}>{item.children}</div>
            </li>
          )
        }}
      </For>
    </ol>
  )
}
