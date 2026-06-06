import { For, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import type { dayjs } from './date-utils'
import type {
  DatePickerSemanticSlot,
  PresetValue,
  RangePickerValue,
  RangePresetValue,
  SinglePresetValue,
} from './interface'
import { semanticClass, semanticStyle } from './semantic'

export type ResolvedPresetValue = dayjs.Dayjs | RangePickerValue
export type AnyPresetValue = SinglePresetValue | RangePresetValue

export interface PresetsPanelProps {
  prefixCls: string
  presets?: Array<PresetValue<AnyPresetValue>>
  classNames?: Partial<Record<DatePickerSemanticSlot, string>>
  styles?: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>
  onSelect?: (value: ResolvedPresetValue) => void
}

function resolvePresetValue(preset: PresetValue<AnyPresetValue>): ResolvedPresetValue {
  const value = typeof preset.value === 'function' ? preset.value() : preset.value
  if (!Array.isArray(value)) return value
  return value.map((item) => (typeof item === 'function' ? item() : item)) as RangePickerValue
}

export function PresetsPanel(props: PresetsPanelProps) {
  return (
    <Show when={props.presets?.length}>
      <div
        class={semanticClass('presets', props.classNames, `${props.prefixCls}-presets`)}
        style={semanticStyle('presets', props.styles)}
      >
        <For each={props.presets}>
          {(preset) => (
            <button
              type="button"
              class={`${props.prefixCls}-preset`}
              onClick={() => props.onSelect?.(resolvePresetValue(preset))}
            >
              {preset.label}
            </button>
          )}
        </For>
      </div>
    </Show>
  )
}
