import { For, Show, createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
import { colorToCss, parseColor } from './color'
import type { ColorPickerPreset } from './interface'
import type { ColorPickerValue } from './color'

export interface PresetsProps {
  prefixCls: string
  presets: ColorPickerPreset[]
  disabled?: boolean
  onSelect: (value: ColorPickerValue) => void
}

function presetColorLabel(value: ColorPickerValue): string {
  return typeof value === 'string' ? value : colorToCss(parseColor(value))
}

export function Presets(props: PresetsProps): JSX.Element {
  const [openKeys, setOpenKeys] = createSignal(
    new Set(
      props.presets
        .map((preset, index) => ({
          key: String(preset.key ?? index),
          open: preset.defaultOpen !== false,
        }))
        .filter((item) => item.open)
        .map((item) => item.key),
    ),
  )
  const toggle = (key: string): void => {
    setOpenKeys((current) => {
      const next = new Set(current)

      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }

      return next
    })
  }

  return (
    <div class={`${props.prefixCls}-presets`}>
      <For each={props.presets}>
        {(preset, index) => {
          const key = () => String(preset.key ?? index())

          return (
            <div class={`${props.prefixCls}-preset`}>
              <button
                type="button"
                class={`${props.prefixCls}-preset-label`}
                aria-expanded={openKeys().has(key()) ? 'true' : 'false'}
                onClick={() => toggle(key())}
              >
                {preset.label}
              </button>
              <Show when={openKeys().has(key())}>
                <div class={`${props.prefixCls}-preset-colors`}>
                  <For each={preset.colors}>
                    {(presetColor) => (
                      <button
                        type="button"
                        class={`${props.prefixCls}-preset-color`}
                        aria-label={`Select preset color ${presetColorLabel(presetColor)}`}
                        title={presetColorLabel(presetColor)}
                        disabled={props.disabled}
                        onClick={() => props.onSelect(presetColor)}
                      >
                        <span
                          class={`${props.prefixCls}-preset-color-inner`}
                          style={{ background: colorToCss(parseColor(presetColor)) }}
                        />
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          )
        }}
      </For>
    </div>
  )
}
