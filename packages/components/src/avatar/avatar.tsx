import {
  children,
  createContext,
  createEffect,
  createSignal,
  For,
  onCleanup,
  Show,
  splitProps,
  useContext,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { Popover } from '../popover'
import { classNames } from '../shared/class-names'
import {
  isResponsiveObject,
  resolveResponsiveValue,
  useBreakpoint,
} from '../shared/responsive-observer'
import { useAvatarStyle } from './avatar.style'
import type {
  AvatarGroupProps,
  AvatarProps,
  AvatarResponsiveSize,
  AvatarShape,
  AvatarSize,
} from './interface'
import type { JSX } from 'solid-js'

interface AvatarGroupContextValue {
  size?: AvatarSize | AvatarResponsiveSize
  shape?: AvatarShape
}

const AvatarGroupContext = createContext<AvatarGroupContextValue>()

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function isStringSrc(src: AvatarProps['src']): src is string {
  return typeof src === 'string'
}

function sizeClass(prefixCls: string, size: AvatarSize | undefined): string | false {
  if (size === 'small') return `${prefixCls}-sm`
  if (size === 'large') return `${prefixCls}-lg`
  return false
}

function numericSizeStyle(size: AvatarSize | undefined, hasIcon: boolean): JSX.CSSProperties {
  if (typeof size !== 'number') return {}
  return {
    width: `${size}px`,
    height: `${size}px`,
    'font-size': `${hasIcon ? size / 2 : 18}px`,
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
    'prefixCls',
    'rootClass',
    'size',
    'shape',
    'src',
    'srcSet',
    'alt',
    'draggable',
    'crossOrigin',
    'icon',
    'gap',
    'onError',
    'children',
    'class',
    'style',
  ])
  const groupContext = useContext(AvatarGroupContext)
  const config = useConfig()
  const screens = useBreakpoint()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-avatar`
  const [, hashId] = useAvatarStyle(prefixCls())
  const [failedSrc, setFailedSrc] = createSignal<AvatarProps['src']>()
  const [scale, setScale] = createSignal(1)
  const [avatarElement, setAvatarElement] = createSignal<HTMLSpanElement>()
  const [childrenElement, setChildrenElement] = createSignal<HTMLSpanElement>()
  let resizeObserver: ResizeObserver | undefined
  const rawSize = () => local.size ?? groupContext?.size ?? 'medium'
  const size = () =>
    isResponsiveObject(rawSize())
      ? resolveResponsiveValue(rawSize() as AvatarResponsiveSize, screens())
      : (rawSize() as AvatarSize)
  const shape = () => local.shape ?? groupContext?.shape ?? 'circle'
  const hasImageElement = () => Boolean(local.src && !isStringSrc(local.src))
  const canShowImage = () => Boolean(local.src && failedSrc() !== local.src)
  const showIcon = () => !canShowImage() && isPresent(local.icon)
  const showChildren = () => !canShowImage() && !showIcon() && isPresent(local.children)
  const hasIcon = () => isPresent(local.icon)

  const updateScale = () => {
    const avatarRef = avatarElement()
    const childrenRef = childrenElement()
    if (!childrenRef || !avatarRef) return
    const childrenWidth = childrenRef.offsetWidth
    const nodeWidth = avatarRef.offsetWidth
    const gap = local.gap ?? 4
    if (!childrenWidth || !nodeWidth || gap * 2 >= nodeWidth) return
    setScale(nodeWidth - gap * 2 < childrenWidth ? (nodeWidth - gap * 2) / childrenWidth : 1)
  }

  createEffect(() => {
    const src = local.src
    void src
    setFailedSrc(undefined)
    setScale(1)
  })

  createEffect(() => {
    if (!showChildren()) return
    const currentSize = size()
    const gap = local.gap
    void currentSize
    void gap
    updateScale()
  })

  createEffect(() => {
    const childrenRef = childrenElement()
    const avatarRef = avatarElement()
    if (typeof ResizeObserver === 'undefined' || !childrenRef) return
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(childrenRef)
    if (avatarRef) resizeObserver.observe(avatarRef)
  })

  onCleanup(() => resizeObserver?.disconnect())

  const handleImageError = () => {
    const errorFlag = local.onError?.()
    if (errorFlag !== false) setFailedSrc(local.src)
  }

  const stringStyle = (): JSX.CSSProperties => {
    const transform = `scale(${scale()})`
    return {
      transform,
      '-webkit-transform': transform,
      '-ms-transform': transform,
    }
  }

  return (
    <span
      {...rest}
      ref={setAvatarElement}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${shape()}`,
        sizeClass(prefixCls(), size() as AvatarSize),
        canShowImage() && `${prefixCls()}-image`,
        hasIcon() && `${prefixCls()}-icon`,
        config.avatar().class,
        hashId(),
        local.rootClass,
        local.class,
      )}
      style={mergeStyle(
        {
          ...numericSizeStyle(size() as AvatarSize, hasIcon()),
          ...(typeof config.avatar().style === 'object' ? config.avatar().style : {}),
        },
        local.style,
      )}
    >
      <Show when={canShowImage() && isStringSrc(local.src)}>
        <img
          src={local.src as string}
          srcSet={local.srcSet}
          alt={local.alt}
          draggable={local.draggable}
          crossOrigin={local.crossOrigin}
          onError={handleImageError}
        />
      </Show>
      <Show when={canShowImage() && hasImageElement()}>{local.src}</Show>
      <Show when={showIcon()}>{local.icon}</Show>
      <Show when={showChildren()}>
        <span ref={setChildrenElement} class={`${prefixCls()}-string`} style={stringStyle()}>
          {local.children}
        </span>
      </Show>
    </span>
  )
}

function AvatarGroupItems(props: {
  children?: JSX.Element
  maxCount?: number
  maxStyle?: JSX.CSSProperties
  maxPopoverPlacement?: AvatarGroupProps['maxPopoverPlacement']
  maxPopoverTrigger?: AvatarGroupProps['maxPopoverTrigger']
  max?: AvatarGroupProps['max']
  prefixCls: string
}) {
  const resolved = children(() => props.children)
  const items = () =>
    resolved.toArray().filter((item) => item !== null && item !== undefined && item !== false)
  const visibleItems = () => {
    const count = maxCount()
    if (count === undefined) return items()
    return items().slice(0, Math.max(0, count))
  }
  const overflowCount = () => {
    const count = maxCount()
    if (count === undefined) return 0
    return Math.max(0, items().length - count)
  }
  const hiddenItems = () => {
    const count = maxCount()
    if (count === undefined) return []
    return items().slice(Math.max(0, count))
  }
  const hiddenPopoverContent = () =>
    hiddenItems().map((item) => (item instanceof Node ? item.cloneNode(true) : item))
  const maxCount = () => props.max?.count ?? props.maxCount
  const maxStyle = () => props.max?.style ?? props.maxStyle
  const popoverProps = () => ({
    ...props.max?.popover,
    placement: props.max?.popover?.placement ?? props.maxPopoverPlacement ?? 'top',
    trigger: props.max?.popover?.trigger ?? props.maxPopoverTrigger ?? 'hover',
    rootClass: classNames(`${props.prefixCls}-group-popover`, props.max?.popover?.rootClass),
    title: props.max?.popover?.title,
    content: props.max?.popover?.content ?? (() => hiddenPopoverContent()),
  })

  return (
    <>
      <For each={visibleItems()}>{(item) => item}</For>
      <Show when={overflowCount() > 0}>
        <Popover {...popoverProps()} destroyOnHidden>
          <AvatarBase class={`${props.prefixCls}-overflow`} style={maxStyle()}>
            +{overflowCount()}
          </AvatarBase>
        </Popover>
      </Show>
    </>
  )
}

function AvatarGroup(props: AvatarGroupProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClass',
    'maxCount',
    'maxStyle',
    'maxPopoverPlacement',
    'maxPopoverTrigger',
    'max',
    'size',
    'shape',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-avatar`
  const [, hashId] = useAvatarStyle(prefixCls())

  return (
    <div
      {...rest}
      class={classNames(
        `${prefixCls()}-group`,
        config.direction() === 'rtl' && `${prefixCls()}-group-rtl`,
        hashId(),
        local.rootClass,
        local.class,
      )}
      style={local.style}
    >
      <AvatarGroupContext.Provider value={{ size: local.size, shape: local.shape }}>
        <AvatarGroupItems
          prefixCls={prefixCls()}
          maxCount={local.maxCount}
          maxStyle={local.maxStyle}
          maxPopoverPlacement={local.maxPopoverPlacement}
          maxPopoverTrigger={local.maxPopoverTrigger}
          max={local.max}
        >
          {local.children}
        </AvatarGroupItems>
      </AvatarGroupContext.Provider>
    </div>
  )
}

export const Avatar = Object.assign(AvatarBase, { Group: AvatarGroup })
export type AvatarComponent = typeof Avatar
