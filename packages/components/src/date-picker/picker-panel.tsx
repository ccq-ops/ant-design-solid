import { Show } from 'solid-js'
import type { JSX } from 'solid-js'
import type {
  DatePickerLocale,
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
  prevIcon?: JSX.Element
  nextIcon?: JSX.Element
  superPreviousIcon?: JSX.Element
  superNextIcon?: JSX.Element
  components?: PickerComponents
  presets?: Array<import('./interface').PresetValue<import('./presets-panel').AnyPresetValue>>
  panelRender?: (panel: JSX.Element) => JSX.Element
  renderExtraFooter?: (mode: PickerMode) => JSX.Element
  locale?: DatePickerLocale
  mode?: PickerMode
  needConfirm?: boolean
  showTime?: boolean
  showNow?: boolean
  showToday?: boolean
  todayDisabled?: boolean
  onToday?: () => void
  onNow?: () => void
  onPrevious?: () => void
  onSuperPrevious?: () => void
  onNext?: () => void
  onSuperNext?: () => void
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

function previousLabel(locale: DatePickerLocale | undefined, mode: PickerMode = 'date'): string {
  switch (mode) {
    case 'year':
      return locale?.lang?.previousYears ?? 'Previous years'
    case 'month':
    case 'quarter':
      return locale?.lang?.previousYear ?? 'Previous year'
    case 'decade':
      return locale?.lang?.previousDecade ?? 'Previous decade'
    case 'week':
    case 'date':
    default:
      return locale?.lang?.previousMonth ?? 'Previous month'
  }
}

function nextLabel(locale: DatePickerLocale | undefined, mode: PickerMode = 'date'): string {
  switch (mode) {
    case 'year':
      return locale?.lang?.nextYears ?? 'Next years'
    case 'month':
    case 'quarter':
      return locale?.lang?.nextYear ?? 'Next year'
    case 'decade':
      return locale?.lang?.nextDecade ?? 'Next decade'
    case 'week':
    case 'date':
    default:
      return locale?.lang?.nextMonth ?? 'Next month'
  }
}

function superPreviousLabel(
  locale: DatePickerLocale | undefined,
  mode: PickerMode = 'date',
): string {
  switch (mode) {
    case 'year':
      return locale?.lang?.previousDecades ?? 'Previous decades'
    case 'month':
    case 'quarter':
      return locale?.lang?.previousYears ?? 'Previous years'
    case 'decade':
      return locale?.lang?.previousCenturies ?? 'Previous centuries'
    case 'week':
    case 'date':
    default:
      return locale?.lang?.previousYear ?? 'Previous year'
  }
}

function superNextLabel(locale: DatePickerLocale | undefined, mode: PickerMode = 'date'): string {
  switch (mode) {
    case 'year':
      return locale?.lang?.nextDecades ?? 'Next decades'
    case 'month':
    case 'quarter':
      return locale?.lang?.nextYears ?? 'Next years'
    case 'decade':
      return locale?.lang?.nextCenturies ?? 'Next centuries'
    case 'week':
    case 'date':
    default:
      return locale?.lang?.nextYear ?? 'Next year'
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
      onMouseDown={(event) => event.preventDefault()}
    >
      <div class={`${props.prefixCls}-header`}>
        <button
          type="button"
          aria-label={superPreviousLabel(props.locale, props.mode)}
          class={`${props.prefixCls}-super-month-button`}
          onClick={props.onSuperPrevious}
        >
          {props.superPreviousIcon ?? '«'}
        </button>
        <button
          type="button"
          aria-label={previousLabel(props.locale, props.mode)}
          class={`${props.prefixCls}-month-button`}
          onClick={props.onPrevious}
        >
          {props.prevIcon ?? '‹'}
        </button>
        <div class={`${props.prefixCls}-month-label`}>{panelLabel(props.viewDate, props.mode)}</div>
        <button
          type="button"
          aria-label={nextLabel(props.locale, props.mode)}
          class={`${props.prefixCls}-month-button`}
          onClick={props.onNext}
        >
          {props.nextIcon ?? '›'}
        </button>
        <button
          type="button"
          aria-label={superNextLabel(props.locale, props.mode)}
          class={`${props.prefixCls}-super-month-button`}
          onClick={props.onSuperNext}
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
      <Show
        when={props.renderExtraFooter || props.needConfirm || props.showTime || props.showToday}
      >
        <div
          class={semanticClass('footer', props.classNames, `${props.prefixCls}-footer`)}
          style={semanticStyle('footer', props.styles)}
        >
          <div class={`${props.prefixCls}-footer-extra`}>
            {props.renderExtraFooter?.(props.mode ?? 'date')}
            <Show when={props.showToday}>
              <button
                type="button"
                class={`${props.prefixCls}-today`}
                disabled={props.todayDisabled}
                onClick={props.onToday}
              >
                {props.locale?.lang?.today ?? 'Today'}
              </button>
            </Show>
            <Show when={props.showTime && props.showNow}>
              <button type="button" class={`${props.prefixCls}-now`} onClick={props.onNow}>
                {props.locale?.lang?.now ?? 'Now'}
              </button>
            </Show>
          </div>
          <Show when={props.needConfirm || props.showTime}>
            <button type="button" class={`${props.prefixCls}-ok`} onClick={props.onOk}>
              {props.locale?.lang?.ok ?? 'OK'}
            </button>
          </Show>
        </div>
      </Show>
    </div>
  )

  return <>{props.panelRender?.(panel()) ?? panel()}</>
}
