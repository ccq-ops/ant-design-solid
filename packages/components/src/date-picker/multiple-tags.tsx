import { For } from 'solid-js'
import type { JSX } from 'solid-js'
import type { dayjs } from './date-utils'
import { formatDayjs } from './format-utils'
import type { DatePickerFormat, PickerType, TagRenderProps } from './interface'

export interface MultipleTagsProps {
  prefixCls: string
  values: dayjs.Dayjs[]
  disabled?: boolean
  format?: DatePickerFormat
  picker?: PickerType
  tagRender?: (props: TagRenderProps) => JSX.Element
  onRemove?: (value: dayjs.Dayjs) => void
}

export function MultipleTags(props: MultipleTagsProps) {
  function label(value: dayjs.Dayjs): string {
    return formatDayjs(value, props.format, props.picker)
  }

  function closeValue(value: dayjs.Dayjs): void {
    if (!props.disabled) props.onRemove?.(value)
  }

  return (
    <div class={`${props.prefixCls}-multiple-tags`}>
      <For each={props.values}>
        {(value) => {
          const labelText = () => label(value)
          const tagProps = (): TagRenderProps => ({
            label: labelText(),
            value,
            disabled: Boolean(props.disabled),
            onClose: () => closeValue(value),
          })
          return (
            <>
              {props.tagRender?.(tagProps()) ?? (
                <button
                  type="button"
                  class={`${props.prefixCls}-multiple-tag`}
                  aria-label={`Remove ${labelText()}`}
                  disabled={props.disabled}
                  onClick={(event) => {
                    event.stopPropagation()
                    closeValue(value)
                  }}
                >
                  {labelText()}
                </button>
              )}
            </>
          )
        }}
      </For>
    </div>
  )
}
