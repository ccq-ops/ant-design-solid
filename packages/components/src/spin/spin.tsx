import {
  For,
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
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  SpinComponent,
  SpinProps,
  SpinSemanticClassNames,
  SpinSemanticSlot,
  SpinSemanticStyles,
} from './interface'
import { useSpinStyle } from './spin.style'

const AUTO_INTERVAL = 200
const STEP_BUCKETS: [limit: number, stepPercent: number][] = [
  [30, 0.05],
  [70, 0.03],
  [96, 0.01],
]
const progressViewSize = 100
const progressBorderWidth = progressViewSize / 5
const progressRadius = progressViewSize / 2 - progressBorderWidth / 2
const progressCircumference = progressRadius * 2 * Math.PI
const progressPosition = 50

let defaultIndicator: JSX.Element | undefined

function isDelayValid(delay: SpinProps['delay']) {
  return typeof delay === 'number' && delay > 0
}

function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0
  return Math.max(0, Math.min(100, percent))
}

function resolveSemanticClassNames(
  value: SpinProps['classNames'],
  props: SpinProps,
): SpinSemanticClassNames {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(value: SpinProps['styles'], props: SpinProps): SpinSemanticStyles {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeStyles(...values: Array<JSX.CSSProperties | string | undefined>) {
  return Object.assign({}, ...values.filter((value) => value && typeof value !== 'string'))
}

function renderProgress(prefixCls: string, percent: number) {
  const dotClassName = `${prefixCls}-dot`
  const safePercent = clampPercent(percent)
  const circleStyle = {
    'stroke-dashoffset': `${progressCircumference / 4}`,
    'stroke-dasharray': `${(progressCircumference * safePercent) / 100} ${
      (progressCircumference * (100 - safePercent)) / 100
    }`,
  } satisfies JSX.CSSProperties

  return (
    <span class={classNames(`${dotClassName}-holder`, `${dotClassName}-progress`)}>
      <svg
        viewBox={`0 0 ${progressViewSize} ${progressViewSize}`}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={safePercent}
      >
        <circle
          class={`${dotClassName}-circle ${dotClassName}-circle-bg`}
          r={progressRadius}
          cx={progressPosition}
          cy={progressPosition}
          stroke-width={progressBorderWidth}
        />
        <circle
          class={`${dotClassName}-circle`}
          r={progressRadius}
          cx={progressPosition}
          cy={progressPosition}
          stroke-width={progressBorderWidth}
          style={circleStyle}
        />
      </svg>
    </span>
  )
}

const SpinRoot = (props: SpinProps) => {
  const [local, rest] = splitProps(props, [
    'spinning',
    'size',
    'tip',
    'description',
    'delay',
    'fullscreen',
    'wrapperClass',
    'indicator',
    'percent',
    'classNames',
    'styles',
    'children',
    'class',
    'classList',
    'style',
  ])
  const initialDefaultIndicator = defaultIndicator
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-spin`
  const [, hashId] = useSpinStyle(prefixCls())
  const child = resolveChildren(() => local.children)
  const hasSpinningProp = Object.prototype.hasOwnProperty.call(props, 'spinning')
  const spinning = createMemo(() => (hasSpinningProp ? local.spinning !== false : true))
  const size = () => local.size ?? 'medium'
  const semanticClassNames = createMemo(() => resolveSemanticClassNames(local.classNames, props))
  const semanticStyles = createMemo(() => resolveSemanticStyles(local.styles, props))
  const slotClass = (slot: SpinSemanticSlot) => semanticClassNames()[slot]
  const slotStyle = (slot: SpinSemanticSlot): JSX.CSSProperties => semanticStyles()[slot] ?? {}
  const description = () => local.description ?? local.tip
  const [delayedSpinning, setDelayedSpinning] = createSignal(
    !isDelayValid(local.delay) && spinning(),
  )
  const shouldSpin = createMemo(() => delayedSpinning())
  const [autoPercent, setAutoPercent] = createSignal(0)
  const mergedPercent = createMemo(() => (local.percent === 'auto' ? autoPercent() : local.percent))
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

  createEffect(() => {
    if (local.percent !== 'auto' || !shouldSpin()) {
      setAutoPercent(0)
      return
    }

    setAutoPercent(0)
    const timer = window.setInterval(() => {
      setAutoPercent((previous) => {
        const restPercent = 100 - previous

        for (const [limit, stepPercent] of STEP_BUCKETS) {
          if (previous <= limit) return previous + restPercent * stepPercent
        }

        return previous
      })
    }, AUTO_INTERVAL)

    onCleanup(() => window.clearInterval(timer))
  })

  const indicator = () => {
    const customIndicator = local.indicator ?? initialDefaultIndicator
    if (customIndicator) return customIndicator

    return (
      <>
        <span
          class={classNames(
            `${prefixCls()}-dot-holder`,
            mergedPercent() !== undefined && `${prefixCls()}-dot-holder-hidden`,
          )}
        >
          <span class={classNames(`${prefixCls()}-dot`, `${prefixCls()}-dot-spin`)}>
            <For each={[1, 2, 3, 4]}>
              {(item) => (
                <i
                  class={classNames(`${prefixCls()}-dot-item`, `${prefixCls()}-dot-item-${item}`)}
                  aria-hidden="true"
                />
              )}
            </For>
          </span>
        </span>
        <Show when={mergedPercent() !== undefined}>
          {renderProgress(prefixCls(), mergedPercent() ?? 0)}
        </Show>
      </>
    )
  }

  const spinElement = (options?: {
    rootClass?: string
    rootStyle?: JSX.CSSProperties
    applyRootSlot?: boolean
  }) => (
    <div
      {...rest}
      role="status"
      aria-live="polite"
      aria-busy={shouldSpin() ? 'true' : 'false'}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-spinning`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        hashId(),
        options?.applyRootSlot !== false && slotClass('root'),
        options?.rootClass,
        local.class,
      )}
      classList={local.classList}
      style={mergeStyles(
        options?.applyRootSlot !== false ? slotStyle('root') : undefined,
        options?.rootStyle,
        local.style,
      )}
    >
      <div
        class={classNames(`${prefixCls()}-section`, slotClass('section'))}
        style={slotStyle('section')}
      >
        <span
          class={classNames(`${prefixCls()}-indicator`, slotClass('indicator'))}
          style={slotStyle('indicator')}
        >
          {indicator()}
        </span>
        <Show when={description()}>
          <div
            class={classNames(
              `${prefixCls()}-description`,
              `${prefixCls()}-text`,
              slotClass('tip'),
              slotClass('description'),
            )}
            style={{ ...slotStyle('tip'), ...slotStyle('description') }}
          >
            {description()}
          </div>
        </Show>
      </div>
    </div>
  )

  const nestedSpinElement = () => (
    <Show when={shouldSpin()}>
      <div
        class={classNames(`${prefixCls()}-overlay`, slotClass('mask'))}
        style={slotStyle('mask')}
      >
        {spinElement({ applyRootSlot: false })}
      </div>
    </Show>
  )

  return (
    <Switch>
      <Match when={local.fullscreen}>
        <Show when={shouldSpin()}>
          {spinElement({
            rootClass: classNames(`${prefixCls()}-fullscreen`, slotClass('mask')),
            rootStyle: slotStyle('mask'),
          })}
        </Show>
      </Match>
      <Match when={hasChildren()}>
        <div
          class={classNames(
            `${prefixCls()}-nested-loading`,
            hashId(),
            slotClass('root'),
            local.wrapperClass,
          )}
          style={slotStyle('root')}
        >
          {nestedSpinElement()}
          <div
            class={classNames(`${prefixCls()}-container`, slotClass('container'))}
            style={slotStyle('container')}
            aria-busy={shouldSpin() ? 'true' : undefined}
          >
            {child()}
          </div>
        </div>
      </Match>
      <Match when={shouldSpin()}>{spinElement()}</Match>
    </Switch>
  )
}

export const Spin = Object.assign(SpinRoot, {
  setDefaultIndicator: (indicator: JSX.Element | undefined) => {
    defaultIndicator = indicator
  },
}) satisfies SpinComponent
