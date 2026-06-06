import { Show } from 'solid-js'
import type { JSX } from 'solid-js'
import type {
  DatePickerPlacement,
  DatePickerSemanticSlot,
  PickerComponents,
  PickerMode,
} from './interface'
import { PresetsPanel, type ResolvedPresetValue } from './presets-panel'
import { semanticClass, semanticStyle } from './semantic'
import type { dayjs } from './date-utils'
import { yearGridStart } from './year-panel'
import { decadeRange } from './decade-panel'

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
  styles?: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>
  style?: JSX.CSSProperties
  previousIcon?: JSX.Element
  nextIcon?: JSX.Element
  superPreviousIcon?: JSX.Element
  superNextIcon?: JSX.Element
  components?: PickerComponents
  presets?: Array<import('./interface').PresetValue<import('./presets-panel').AnyPresetValue>>
  panelRender?: (panel: JSX.Element) => JSX.Element
  renderExtraFooter?: (mode: PickerMode) => JSX.Element
  mode?: PickerMode
  needConfirm?: boolean
  showTime?: boolean
  showNow?: boolean
  onNow?: () => void
  onPrevious?: () => void
  onNext?: () => void
  onOk?: () => void
  onPresetSelect?: (value: ResolvedPresetValue) => void
  ref?: (element: HTMLDivElement) => void
  children?: JSX.Element
}

function panelLabel(viewDate: dayjs.Dayjs, mode: PickerMode = 'date'): string {
  switch (mode) {
    case 'year': {
      const start = yearGridStart(viewDate)
      return `${start}-${start + 11}`
    }
    case 'month':
    case 'quarter':
      return viewDate.format('YYYY')
    case 'decade': {
      const range = decadeRange(viewDate)
      return `${range.start}-${range.end}`
    }
    case 'week':
    case 'date':
    default:
      return viewDate.format('YYYY-MM')
  }
}

function previousLabel(mode: PickerMode = 'date'): string {
  switch (mode) {
    case 'year':
      return 'Previous years'
    case 'month':
    case 'quarter':
      return 'Previous year'
    case 'decade':
      return 'Previous decade'
    case 'week':
    case 'date':
    default:
      return 'Previous month'
  }
}

function nextLabel(mode: PickerMode = 'date'): string {
  switch (mode) {
    case 'year':
      return 'Next years'
    case 'month':
    case 'quarter':
      return 'Next year'
    case 'decade':
      return 'Next decade'
    case 'week':
    case 'date':
    default:
      return 'Next month'
  }
}

function superPreviousLabel(mode: PickerMode = 'date'): string {
  switch (mode) {
    case 'year':
      return 'Previous decades'
    case 'month':
    case 'quarter':
      return 'Previous years'
    case 'decade':
      return 'Previous centuries'
    case 'week':
    case 'date':
    default:
      return 'Previous year'
  }
}

function superNextLabel(mode: PickerMode = 'date'): string {
  switch (mode) {
    case 'year':
      return 'Next decades'
    case 'month':
    case 'quarter':
      return 'Next years'
    case 'decade':
      return 'Next centuries'
    case 'week':
    case 'date':
    default:
      return 'Next year'
  }
}

export function PickerPanel(props: PickerPanelProps) {
  const panelContent = () => {
    const Component = props.components?.[props.mode ?? 'date'] ?? props.components?.panel
    return Component ? (
      <Component prefixCls={props.prefixCls} mode={props.mode ?? 'date'}>
        {props.children}
      </Component>
    ) : (
      props.children
    )
  }

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
          aria-label={superPreviousLabel(props.mode)}
          class={`${props.prefixCls}-super-month-button`}
          onClick={props.onPrevious}
        >
          {props.superPreviousIcon ?? '«'}
        </button>
        <button
          type="button"
          aria-label={previousLabel(props.mode)}
          class={`${props.prefixCls}-month-button`}
          onClick={props.onPrevious}
        >
          {props.previousIcon ?? '‹'}
        </button>
        <div class={`${props.prefixCls}-month-label`}>{panelLabel(props.viewDate, props.mode)}</div>
        <button
          type="button"
          aria-label={nextLabel(props.mode)}
          class={`${props.prefixCls}-month-button`}
          onClick={props.onNext}
        >
          {props.nextIcon ?? '›'}
        </button>
        <button
          type="button"
          aria-label={superNextLabel(props.mode)}
          class={`${props.prefixCls}-super-month-button`}
          onClick={props.onNext}
        >
          {props.superNextIcon ?? '»'}
        </button>
      </div>
      <PresetsPanel
        prefixCls={props.prefixCls}
        presets={props.presets}
        classNames={props.classNames}
        styles={props.styles}
        onSelect={props.onPresetSelect}
      />
      {panelContent()}
      <Show when={props.renderExtraFooter || props.needConfirm || props.showTime}>
        <div
          class={semanticClass('footer', props.classNames, `${props.prefixCls}-footer`)}
          style={semanticStyle('footer', props.styles)}
        >
          <div class={`${props.prefixCls}-footer-extra`}>
            {props.renderExtraFooter?.(props.mode ?? 'date')}
            <Show when={props.showTime && props.showNow}>
              <button type="button" class={`${props.prefixCls}-now`} onClick={props.onNow}>
                Now
              </button>
            </Show>
          </div>
          <Show when={props.needConfirm || props.showTime}>
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
