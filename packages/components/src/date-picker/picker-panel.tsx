import { Show } from 'solid-js'
import type { JSX } from 'solid-js'
import type { DatePickerPlacement, DatePickerSemanticSlot, PickerMode } from './interface'
import { semanticClass } from './semantic'
import type { dayjs } from './date-utils'

export function placementToClassName(placement: DatePickerPlacement = 'bottomLeft'): string {
  switch (placement) {
    case 'bottomRight':
      return 'bottom-right'
    case 'topLeft':
      return 'top-left'
    case 'topRight':
      return 'top-right'
    case 'bottomLeft':
    default:
      return 'bottom-left'
  }
}

export interface PickerPanelProps {
  prefixCls: string
  viewDate: dayjs.Dayjs
  placement?: DatePickerPlacement
  class?: string
  classNames?: Partial<Record<DatePickerSemanticSlot, string>>
  style?: JSX.CSSProperties
  previousIcon?: JSX.Element
  nextIcon?: JSX.Element
  panelRender?: (panel: JSX.Element) => JSX.Element
  renderExtraFooter?: (mode: PickerMode) => JSX.Element
  mode?: PickerMode
  needConfirm?: boolean
  onPrevious?: () => void
  onNext?: () => void
  onOk?: () => void
  ref?: (element: HTMLDivElement) => void
  children?: JSX.Element
}

export function PickerPanel(props: PickerPanelProps) {
  const panel = () => (
    <div
      ref={props.ref}
      class={semanticClass(
        'popup',
        props.classNames,
        `${props.prefixCls}-dropdown`,
        `${props.prefixCls}-dropdown-${placementToClassName(props.placement)}`,
        props.class,
      )}
      style={props.style}
    >
      <div class={`${props.prefixCls}-header`}>
        <button
          type="button"
          aria-label="Previous month"
          class={`${props.prefixCls}-month-button`}
          onClick={props.onPrevious}
        >
          {props.previousIcon ?? '‹'}
        </button>
        <div class={`${props.prefixCls}-month-label`}>{props.viewDate.format('YYYY-MM')}</div>
        <button
          type="button"
          aria-label="Next month"
          class={`${props.prefixCls}-month-button`}
          onClick={props.onNext}
        >
          {props.nextIcon ?? '›'}
        </button>
      </div>
      {props.children}
      <Show when={props.renderExtraFooter || props.needConfirm}>
        <div class={`${props.prefixCls}-footer`}>
          {props.renderExtraFooter?.(props.mode ?? 'date')}
          <Show when={props.needConfirm}>
            <button type="button" class={`${props.prefixCls}-ok`} onClick={props.onOk}>
              OK
            </button>
          </Show>
        </div>
      </Show>
    </div>
  )

  return <>{props.panelRender?.(panel()) ?? panel()}</>
}
