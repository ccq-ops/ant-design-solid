import { For, onCleanup } from 'solid-js'
import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { ParsedGradientColorStop } from './color'
import { Color, clamp } from './color'

export interface GradientSliderProps {
  prefixCls: string
  colors: ParsedGradientColorStop[]
  activeIndex: number
  disabled?: boolean
  onActive: (index: number) => void
  onChange: (colors: ParsedGradientColorStop[], dragging?: boolean) => void
  onChangeComplete: (colors: ParsedGradientColorStop[]) => void
}

function interpolateColor(colors: ParsedGradientColorStop[], percent: number): Color {
  const sorted = [...colors].sort((a, b) => a.percent - b.percent)
  const lower = [...sorted].reverse().find((item) => item.percent <= percent) ?? sorted[0]
  const upper = sorted.find((item) => item.percent >= percent) ?? sorted.at(-1) ?? lower

  if (lower.percent === upper.percent) return lower.color

  const ratio = (percent - lower.percent) / (upper.percent - lower.percent)
  const low = lower.color.toRgb()
  const high = upper.color.toRgb()

  return Color.fromRgb({
    r: low.r + (high.r - low.r) * ratio,
    g: low.g + (high.g - low.g) * ratio,
    b: low.b + (high.b - low.b) * ratio,
    a: low.a + (high.a - low.a) * ratio,
  })
}

export function gradientCss(colors: ParsedGradientColorStop[]): string {
  return `linear-gradient(90deg, ${colors
    .map((item) => `${item.color.toRgbString()} ${item.percent}%`)
    .join(', ')})`
}

export function GradientSlider(props: GradientSliderProps): JSX.Element {
  let sliderRef: HTMLDivElement | undefined
  let cleanupDrag: (() => void) | undefined

  const percentFromEvent = (event: Pick<PointerEvent, 'clientX'>): number => {
    const rect = sliderRef?.getBoundingClientRect()
    const width = rect?.width || 1

    return Math.round(clamp(((event.clientX - (rect?.left ?? 0)) / width) * 100, 0, 100))
  }
  const sortedColors = () => [...props.colors].sort((a, b) => a.percent - b.percent)
  const commit = (colors: ParsedGradientColorStop[], dragging = false): void => {
    props.onChange(
      [...colors].sort((a, b) => a.percent - b.percent),
      dragging,
    )
  }

  const startStopDrag = (index: number, event: PointerEvent): void => {
    if (props.disabled) return

    event.preventDefault()
    props.onActive(index)

    const move = (moveEvent: PointerEvent) => {
      const next = sortedColors()

      next[index] = { ...next[index], percent: percentFromEvent(moveEvent) }
      commit(next, true)
    }
    const up = (upEvent: PointerEvent) => {
      move(upEvent)
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      cleanupDrag = undefined
      props.onChangeComplete(sortedColors())
    }

    cleanupDrag = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  const addStop = (event: PointerEvent & { currentTarget: HTMLDivElement }): void => {
    if (props.disabled || event.target !== event.currentTarget) return

    const percent = percentFromEvent(event)
    const next = sortedColors()

    next.push({ color: interpolateColor(next, percent), percent })
    next.sort((a, b) => a.percent - b.percent)

    const activeIndex = next.findIndex((item) => item.percent === percent)

    props.onActive(Math.max(activeIndex, 0))
    commit(next, false)
    props.onChangeComplete(next)
  }

  onCleanup(() => cleanupDrag?.())

  return (
    <div
      ref={(element) => {
        sliderRef = element
      }}
      role="slider"
      aria-label="Gradient stops"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={props.colors[props.activeIndex]?.percent ?? 0}
      class={`${props.prefixCls}-gradient-slider`}
      style={{ background: gradientCss(sortedColors()) }}
      onPointerDown={addStop}
    >
      <For each={sortedColors()}>
        {(item, index) => (
          <button
            type="button"
            class={classNames(
              `${props.prefixCls}-gradient-stop`,
              index() === props.activeIndex && `${props.prefixCls}-gradient-stop-active`,
            )}
            style={{ left: `${item.percent}%`, background: item.color.toRgbString() }}
            aria-label={`Gradient stop ${item.percent}`}
            onClick={(event) => {
              event.stopPropagation()
              props.onActive(index())
            }}
            onPointerDown={(event) => {
              event.stopPropagation()
              startStopDrag(index(), event)
            }}
            onKeyDown={(event) => {
              if (
                (event.key === 'Delete' || event.key === 'Backspace') &&
                sortedColors().length > 2
              ) {
                const next = sortedColors().filter((_, currentIndex) => currentIndex !== index())

                props.onActive(Math.max(0, index() - 1))
                commit(next, false)
                props.onChangeComplete(next)
              }
            }}
          />
        )}
      </For>
    </div>
  )
}
