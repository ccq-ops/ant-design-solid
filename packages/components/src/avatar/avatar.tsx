import { children, createContext, createSignal, For, Show, splitProps, useContext } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useAvatarStyle } from './avatar.style'
import type { AvatarGroupProps, AvatarProps, AvatarShape, AvatarSize } from './interface'
import type { JSX } from 'solid-js'

interface AvatarGroupContextValue {
  size?: AvatarSize
  shape?: AvatarShape
}

const AvatarGroupContext = createContext<AvatarGroupContextValue>()

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function sizeClass(prefixCls: string, size: AvatarSize): string | false {
  if (size === 'small') return `${prefixCls}-sm`
  if (size === 'large') return `${prefixCls}-lg`
  return false
}

function numericSizeStyle(size: AvatarSize): JSX.CSSProperties {
  if (typeof size !== 'number') return {}
  return {
    width: `${size}px`,
    height: `${size}px`,
    'font-size': `${Math.max(12, size / 2)}px`,
    'line-height': `${size}px`,
  }
}

function mergeStyle(
  base: JSX.CSSProperties,
  style: string | JSX.CSSProperties | undefined,
): string | JSX.CSSProperties {
  if (typeof style === 'string') return style
  if (style) return { ...base, ...style }
  return base
}

function AvatarBase(props: AvatarProps) {
  const [local, rest] = splitProps(props, [
    'size',
    'shape',
    'src',
    'alt',
    'icon',
    'gap',
    'children',
    'class',
    'style',
  ])
  const groupContext = useContext(AvatarGroupContext)
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-avatar`
  const [, hashId] = useAvatarStyle(prefixCls())
  const [failedSrc, setFailedSrc] = createSignal<string>()
  const size = () => local.size ?? groupContext?.size ?? 'default'
  const shape = () => local.shape ?? groupContext?.shape ?? 'circle'
  const canShowImage = () => Boolean(local.src && failedSrc() !== local.src)
  const showIcon = () => !canShowImage() && isPresent(local.icon)
  const showChildren = () => !canShowImage() && !showIcon() && isPresent(local.children)

  return (
    <span
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${shape()}`,
        sizeClass(prefixCls(), size()),
        canShowImage() && `${prefixCls()}-image`,
        hashId(),
        local.class,
      )}
      style={mergeStyle(numericSizeStyle(size()), local.style)}
    >
      <Show when={canShowImage()}>
        <img src={local.src} alt={local.alt} onError={() => setFailedSrc(local.src)} />
      </Show>
      <Show when={showIcon()}>
        <span class={`${prefixCls()}-icon`}>{local.icon}</span>
      </Show>
      <Show when={showChildren()}>
        <span class={`${prefixCls()}-string`}>{local.children}</span>
      </Show>
    </span>
  )
}

function AvatarGroupItems(props: {
  children?: JSX.Element
  maxCount?: number
  maxStyle?: JSX.CSSProperties
  prefixCls: string
}) {
  const resolved = children(() => props.children)
  const items = () =>
    resolved.toArray().filter((item) => item !== null && item !== undefined && item !== false)
  const visibleItems = () => {
    if (props.maxCount === undefined) return items()
    return items().slice(0, Math.max(0, props.maxCount))
  }
  const overflowCount = () => {
    if (props.maxCount === undefined) return 0
    return Math.max(0, items().length - props.maxCount)
  }

  return (
    <>
      <For each={visibleItems()}>{(item) => item}</For>
      <Show when={overflowCount() > 0}>
        <AvatarBase class={`${props.prefixCls}-overflow`} style={props.maxStyle}>
          +{overflowCount()}
        </AvatarBase>
      </Show>
    </>
  )
}

function AvatarGroup(props: AvatarGroupProps) {
  const [local, rest] = splitProps(props, [
    'maxCount',
    'maxStyle',
    'size',
    'shape',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-avatar`
  const [, hashId] = useAvatarStyle(prefixCls())

  return (
    <div {...rest} class={classNames(`${prefixCls()}-group`, hashId(), local.class)}>
      <AvatarGroupContext.Provider value={{ size: local.size, shape: local.shape }}>
        <AvatarGroupItems
          prefixCls={prefixCls()}
          maxCount={local.maxCount}
          maxStyle={local.maxStyle}
        >
          {local.children}
        </AvatarGroupItems>
      </AvatarGroupContext.Provider>
    </div>
  )
}

export const Avatar = Object.assign(AvatarBase, { Group: AvatarGroup })
export type AvatarComponent = typeof Avatar
