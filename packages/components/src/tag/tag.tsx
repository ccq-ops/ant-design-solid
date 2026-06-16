import { Show, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTagStyle } from './tag.style'
import { CloseOutlined } from '@ant-design-solid/solid-icons'
import { CheckableTag } from './checkable-tag'
import { CheckableTagGroup } from './checkable-tag-group'
import type { JSX } from 'solid-js'
import type { TagClosable, TagProps, TagSemanticSlot } from './interface'

const presetColors = new Set([
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
  'success',
  'warning',
  'error',
  'processing',
])

function isClosableObject(
  closable: TagClosable | undefined,
): closable is { closeIcon?: JSX.Element } {
  return typeof closable === 'object' && closable !== null
}

function mergeStyle(
  ...values: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | string | undefined {
  const strings = values.filter((value): value is string => typeof value === 'string')
  const objects = values.filter(
    (value): value is JSX.CSSProperties =>
      Boolean(value) && typeof value === 'object' && !Array.isArray(value),
  )
  if (strings.length && objects.length) {
    return [
      strings.join('; '),
      ...objects.map((style) =>
        Object.entries(style)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; '),
      ),
    ]
      .filter(Boolean)
      .join('; ')
  }
  if (strings.length) return strings.join('; ')
  if (objects.length) return Object.assign({}, ...objects)
  return undefined
}

function semanticClass(
  slot: TagSemanticSlot,
  props: Pick<TagProps, 'classNames'>,
): string | undefined {
  return props.classNames?.[slot]
}

export function Tag(props: TagProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'color',
    'variant',
    'icon',
    'closable',
    'closeIcon',
    'onClose',
    'bordered',
    'href',
    'target',
    'disabled',
    'rootClassName',
    'classNames',
    'styles',
    'class',
    'children',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-tag`
  const [, hashId] = useTagStyle(prefixCls())
  const [visible, setVisible] = createSignal(true)
  const variant = () => local.variant ?? (local.bordered === false ? 'filled' : 'outlined')
  const isPreset = () => Boolean(local.color && presetColors.has(local.color))
  const isCustomColor = () => Boolean(local.color && !isPreset())
  const closeIcon = () =>
    local.closeIcon ?? (isClosableObject(local.closable) ? local.closable.closeIcon : undefined)
  const closable = () => Boolean(local.closable) && closeIcon() !== false && closeIcon() !== null
  const mergedStyle = (): JSX.CSSProperties | string | undefined => {
    const rootStyle = mergeStyle(local.styles?.root, local.style)
    if (!isCustomColor() || local.disabled) return rootStyle
    const customStyle = { '--ads-tag-custom-color': local.color } as JSX.CSSProperties
    return mergeStyle(customStyle, rootStyle)
  }

  function triggerClose(event: MouseEvent): void {
    if (local.disabled) {
      event.preventDefault()
      return
    }
    event.stopPropagation()
    local.onClose?.(event)
    if (!event.defaultPrevented) setVisible(false)
  }

  function handleCloseKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    const target = event.currentTarget
    if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  }

  function handleClick(event: MouseEvent): void {
    if (local.disabled) {
      event.preventDefault()
      return
    }
    ;(rest.onClick as JSX.EventHandler<HTMLElement, MouseEvent> | undefined)?.(event as never)
  }

  return (
    <Show when={visible()}>
      <DynamicTag
        {...rest}
        href={local.disabled ? undefined : local.href}
        target={local.target}
        isAnchor={Boolean(local.href)}
        style={mergedStyle()}
        class={classNames(
          prefixCls(),
          `${prefixCls()}-${variant()}`,
          isPreset() && `${prefixCls()}-${local.color}`,
          isCustomColor() && `${prefixCls()}-has-color`,
          local.bordered === false && `${prefixCls()}-borderless`,
          local.disabled && `${prefixCls()}-disabled`,
          hashId(),
          semanticClass('root', local),
          local.class,
          local.rootClassName,
        )}
        aria-disabled={local.disabled || undefined}
        onClick={handleClick as JSX.EventHandler<HTMLElement, MouseEvent>}
      >
        <Show when={local.icon}>
          {(icon) => (
            <span
              class={classNames(`${prefixCls()}-icon`, local.classNames?.icon)}
              style={local.styles?.icon}
            >
              {icon()}
            </span>
          )}
        </Show>
        <Show when={local.icon} fallback={local.children}>
          <span class={local.classNames?.content} style={local.styles?.content}>
            {local.children}
          </span>
        </Show>
        <Show when={closable()}>
          <span
            role="button"
            tabIndex={local.disabled ? -1 : 0}
            aria-label="Close tag"
            aria-disabled={local.disabled || undefined}
            class={classNames(`${prefixCls()}-close`, local.classNames?.close)}
            style={local.styles?.close}
            onClick={triggerClose}
            onKeyDown={handleCloseKeyDown}
          >
            {closeIcon() ?? <CloseOutlined />}
          </span>
        </Show>
      </DynamicTag>
    </Show>
  )
}

Tag.CheckableTag = CheckableTag
Tag.CheckableTagGroup = CheckableTagGroup

function DynamicTag(
  props: JSX.HTMLAttributes<HTMLElement> & {
    isAnchor: boolean
    href?: string
    target?: string
    children?: JSX.Element
  },
) {
  const [local, rest] = splitProps(props, ['isAnchor', 'href', 'target', 'children'])
  return (
    <Show
      when={local.isAnchor}
      fallback={<span {...(rest as JSX.HTMLAttributes<HTMLSpanElement>)}>{local.children}</span>}
    >
      <a
        {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={local.href}
        target={local.target}
      >
        {local.children}
      </a>
    </Show>
  )
}
