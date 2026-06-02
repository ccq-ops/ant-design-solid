import {
  Match,
  Show,
  Switch,
  children as resolveChildren,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { SpinProps } from './interface'
import { useSpinStyle } from './spin.style'

function isDelayValid(delay: SpinProps['delay']) {
  return typeof delay === 'number' && delay > 0
}

export function Spin(props: SpinProps) {
  const [local, rest] = splitProps(props, [
    'spinning',
    'size',
    'tip',
    'delay',
    'fullscreen',
    'indicator',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-spin`
  const [, hashId] = useSpinStyle(prefixCls())
  const child = resolveChildren(() => local.children)
  const spinning = () => local.spinning ?? true
  const size = () => local.size ?? 'default'
  const [delayedSpinning, setDelayedSpinning] = createSignal(
    !isDelayValid(local.delay) && spinning(),
  )
  const shouldSpin = createMemo(() => delayedSpinning())
  const hasChildren = createMemo(() => {
    const value = child()
    return value !== undefined && value !== null && value !== false
  })

  createEffect(() => {
    const active = spinning()
    const delay = local.delay

    if (!active) {
      setDelayedSpinning(false)
      return
    }

    if (!isDelayValid(delay)) {
      setDelayedSpinning(true)
      return
    }

    setDelayedSpinning(false)
    const timer = window.setTimeout(() => {
      setDelayedSpinning(true)
    }, delay)

    onCleanup(() => window.clearTimeout(timer))
  })

  const indicator = () =>
    local.indicator ?? <span class={`${prefixCls()}-dot`} aria-hidden="true" />

  const spinElement = () => (
    <div
      {...rest}
      role="status"
      aria-live="polite"
      class={classNames(
        prefixCls(),
        `${prefixCls()}-spinning`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        hashId(),
        local.class,
      )}
      classList={local.classList}
      style={local.style}
    >
      {indicator()}
      <Show when={local.tip}>
        <div class={`${prefixCls()}-text`}>{local.tip}</div>
      </Show>
    </div>
  )

  return (
    <Switch>
      <Match when={local.fullscreen}>
        <Show when={shouldSpin()}>
          <div class={classNames(`${prefixCls()}-fullscreen`, hashId())}>{spinElement()}</div>
        </Show>
      </Match>
      <Match when={hasChildren()}>
        <div class={classNames(`${prefixCls()}-nested-loading`, hashId())}>
          <Show when={shouldSpin()}>
            <div class={`${prefixCls()}-overlay`}>{spinElement()}</div>
          </Show>
          <div class={`${prefixCls()}-container`} aria-busy={shouldSpin() ? 'true' : undefined}>
            {child()}
          </div>
        </div>
      </Match>
      <Match when={shouldSpin()}>{spinElement()}</Match>
    </Switch>
  )
}
