import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTagStyle } from './tag.style'
import type { JSX } from 'solid-js'
import type { TagProps } from './interface'

const presetColors = new Set(['success', 'warning', 'error', 'processing'])

export function Tag(props: TagProps) {
  const [local, rest] = splitProps(props, [
    'color',
    'closable',
    'onClose',
    'bordered',
    'class',
    'children',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-tag`
  const [, hashId] = useTagStyle(prefixCls())
  const isPreset = () => Boolean(local.color && presetColors.has(local.color))
  const isCustomColor = () => Boolean(local.color && !isPreset())
  const mergedStyle = (): JSX.CSSProperties | string | undefined => {
    if (!isCustomColor()) return local.style
    const customStyle = { '--ads-tag-custom-color': local.color } as JSX.CSSProperties
    if (typeof local.style === 'string') return `${local.style}; --ads-tag-custom-color: ${local.color}`
    return { ...customStyle, ...(local.style ?? {}) }
  }

  return (
    <span
      {...rest}
      style={mergedStyle()}
      class={classNames(
        prefixCls(),
        isPreset() && `${prefixCls()}-${local.color}`,
        isCustomColor() && `${prefixCls()}-has-color`,
        local.bordered === false && `${prefixCls()}-borderless`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
      <Show when={local.closable}>
        <button
          type="button"
          aria-label="Close tag"
          class={`${prefixCls()}-close`}
          onClick={(event) => local.onClose?.(event)}
        >
          ×
        </button>
      </Show>
    </span>
  )
}
