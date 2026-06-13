import { Show, children as resolveChildren, createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useBadgeStyle } from './badge.style'
import { Ribbon } from './ribbon'
import type {
  BadgeComponent,
  BadgeOffset,
  BadgeProps,
  BadgeSemanticClassNames,
  BadgeSemanticSlot,
} from './interface'
import {
  isPresetColor,
  mergeStyles,
  resolveBadgeClassNames,
  resolveBadgeStyles,
  resolveColor,
} from './utils'

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isEmpty(value: JSX.Element): boolean {
  return value === undefined || value === null || value === false || value === ''
}

function isZero(value: JSX.Element): boolean {
  return value === 0 || value === '0'
}

function offsetStyle(offset: BadgeOffset | undefined): JSX.CSSProperties | undefined {
  if (!offset) return undefined
  const horizontalOffset = Number.parseInt(String(offset[0]), 10)
  return {
    'margin-top': typeof offset[1] === 'number' ? `${offset[1]}px` : offset[1],
    'inset-inline-end': Number.isFinite(horizontalOffset) ? `${-horizontalOffset}px` : offset[0],
  } as JSX.CSSProperties
}

const BadgeRoot = (props: BadgeProps) => {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'scrollNumberPrefixCls',
    'count',
    'dot',
    'status',
    'text',
    'color',
    'overflowCount',
    'showZero',
    'size',
    'offset',
    'title',
    'rootClassName',
    'rootClass',
    'classNames',
    'styles',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const componentConfig = () => config.badge()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-badge`
  const [, hashId] = useBadgeStyle(prefixCls())
  const overflowCount = () => local.overflowCount ?? 99
  const size = () => (local.size === 'default' ? 'medium' : (local.size ?? 'medium'))
  const child = resolveChildren(() => local.children)
  const hasChildren = () => !isEmpty(child())
  const semanticClassNames = createMemo(() =>
    resolveBadgeClassNames(local.classNames ?? componentConfig().classNames, props),
  )
  const semanticStyles = createMemo(() =>
    resolveBadgeStyles(local.styles ?? componentConfig().styles, props),
  )
  const slotClass = (slot: BadgeSemanticSlot, classes = semanticClassNames()) => classes[slot]
  const slotStyle = (slot: BadgeSemanticSlot, styles = semanticStyles()) => styles[slot]
  const countText = () => {
    if (isNumber(local.count) && local.count > overflowCount()) return `${overflowCount()}+`
    return local.count
  }
  const numberedDisplayCount = () => {
    if (isNumber(local.count) && local.count > overflowCount()) return `${overflowCount()}+`
    return local.count
  }
  const showAsDot = () => Boolean(local.dot && !isZero(numberedDisplayCount()))
  const mergedCount = () => (showAsDot() ? '' : numberedDisplayCount())
  const ignoreCount = () =>
    local.count === undefined || local.count === null || (isZero(mergedCount()) && !local.showZero)
  const hidden = () => {
    if (showAsDot()) return false
    if (isEmpty(mergedCount()) && isEmpty(local.text)) return true
    if (isZero(mergedCount()) && !local.showZero) return true
    return false
  }
  const hasStatus = () => (local.status !== undefined || local.color !== undefined) && ignoreCount()
  const shouldShowCount = () => !hidden()
  const title = () => {
    if (local.title !== undefined) return local.title
    const count = local.count
    return typeof count === 'string' || typeof count === 'number' ? String(count) : undefined
  }
  const hasCustomCount = () =>
    !showAsDot() &&
    local.count !== undefined &&
    local.count !== null &&
    local.count !== false &&
    typeof local.count !== 'string' &&
    typeof local.count !== 'number'
  const indicatorStyle = (custom = false) => {
    const customColor = resolveColor(local.color)
    const colorStyle =
      customColor && !custom
        ? ({
            background: customColor,
            ...(!hasStatus() ? {} : { color: customColor }),
          } as JSX.CSSProperties)
        : undefined
    return mergeStyles(offsetStyle(local.offset), colorStyle, slotStyle('indicator'))
  }
  const statusTextStyle = () => {
    const styles = slotStyle('indicator')
    return styles?.color ? ({ color: styles.color } as JSX.CSSProperties) : undefined
  }
  const indicatorClass = (classes: BadgeSemanticClassNames = semanticClassNames()) =>
    classNames(
      showAsDot() ? `${prefixCls()}-dot` : `${prefixCls()}-count`,
      !showAsDot() && size() === 'small' && `${prefixCls()}-count-sm`,
      !showAsDot() &&
        countText() !== undefined &&
        countText() !== null &&
        String(countText()).length > 1 &&
        `${prefixCls()}-multiple-words`,
      local.status && `${prefixCls()}-status-${local.status}`,
      local.color && isPresetColor(local.color) && `${prefixCls()}-color-${local.color}`,
      slotClass('indicator', classes),
    )

  const customComponentClass = (classes: BadgeSemanticClassNames = semanticClassNames()) =>
    classNames(`${prefixCls()}-custom-component`, slotClass('indicator', classes))

  const indicator = () => (
    <Show when={shouldShowCount()}>
      <Show
        when={hasCustomCount()}
        fallback={
          <sup class={indicatorClass()} title={title()} style={indicatorStyle()}>
            {showAsDot() ? undefined : countText()}
          </sup>
        }
      >
        <span class={customComponentClass()} title={title()} style={indicatorStyle(true)}>
          {countText()}
        </span>
      </Show>
    </Show>
  )

  const rootClass = () =>
    classNames(
      prefixCls(),
      hasStatus() && `${prefixCls()}-status`,
      !hasChildren() && `${prefixCls()}-not-a-wrapper`,
      hasChildren() && `${prefixCls()}-with-children`,
      hashId(),
      componentConfig().class,
      slotClass('root'),
      local.class,
      local.rootClass,
      local.rootClassName,
    )

  const rootStyle = () => mergeStyles(slotStyle('root'), componentConfig().style, local.style)

  return (
    <Show
      when={hasStatus()}
      fallback={
        <span {...rest} class={rootClass()} style={rootStyle()}>
          {child()}
          {indicator()}
          <Show when={!hidden() && !isEmpty(local.text)}>
            <span class={`${prefixCls()}-status-text`}>{local.text}</span>
          </Show>
        </span>
      }
    >
      <span {...rest} class={rootClass()} style={rootStyle()}>
        <span
          class={classNames(
            `${prefixCls()}-status-dot`,
            local.status && `${prefixCls()}-status-${local.status}`,
            local.color && isPresetColor(local.color) && `${prefixCls()}-color-${local.color}`,
            slotClass('indicator'),
          )}
          style={indicatorStyle()}
        />
        <Show when={!isEmpty(local.text)}>
          <span class={`${prefixCls()}-status-text`} style={statusTextStyle()}>
            {local.text}
          </span>
        </Show>
      </span>
    </Show>
  )
}

BadgeRoot.Ribbon = Ribbon

export const Badge = BadgeRoot as BadgeComponent
