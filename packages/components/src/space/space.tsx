import { children, For, splitProps } from 'solid-js'
import { getComponentToken, type GlobalToken } from '@ant-design-solid/theme'
import { useConfig, useToken } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useSpaceStyle } from './space.style'
import type {
  SpaceAddonProps,
  SpaceCompactProps,
  SpaceOrientation,
  SpaceProps,
  SpaceSemanticClassNames,
  SpaceSemanticStyles,
  SpaceSingleSize,
  SpaceSize,
} from './interface'
import type { JSX } from 'solid-js'

function resolveSingleGap(size: SpaceSingleSize | undefined, token: GlobalToken): number {
  const ct = getComponentToken('Space', token)
  if (typeof size === 'number') return size
  if (size === 'middle') return ct.gapMiddle
  if (size === 'large') return ct.gapLarge
  return ct.gapSmall
}

function resolveGap(size: SpaceSize | undefined, token: GlobalToken): [number, number] {
  if (Array.isArray(size))
    return [resolveSingleGap(size[0], token), resolveSingleGap(size[1], token)]
  const gap = resolveSingleGap(size, token)
  return [gap, gap]
}

function isRenderableItem(item: unknown) {
  if (item === null || item === undefined || item === false) return false
  if (item instanceof Text && item.data === '') return false
  return true
}

function mergeStyle(
  ...styles: Array<string | JSX.CSSProperties | undefined>
): string | JSX.CSSProperties {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  return Object.assign({}, ...styles.filter(Boolean))
}

function resolveSemanticClassNames(
  classNames: SpaceSemanticClassNames | undefined,
  props: SpaceProps,
) {
  return typeof classNames === 'function' ? classNames({ props }) : (classNames ?? {})
}

function resolveSemanticStyles(styles: SpaceSemanticStyles | undefined, props: SpaceProps) {
  return typeof styles === 'function' ? styles({ props }) : (styles ?? {})
}

function resolveOrientation(props: {
  orientation?: SpaceOrientation
  direction?: SpaceOrientation
  vertical?: boolean
}): SpaceOrientation {
  return props.orientation ?? (props.vertical ? 'vertical' : props.direction) ?? 'horizontal'
}

function compactSizeClass(prefixCls: string, size: SpaceCompactProps['size']) {
  if (size === 'small') return `${prefixCls}-compact-sm`
  if (size === 'large') return `${prefixCls}-compact-lg`
  return false
}

export function SpaceRoot(props: SpaceProps) {
  const [local, rest] = splitProps(props, [
    'size',
    'direction',
    'orientation',
    'vertical',
    'align',
    'wrap',
    'split',
    'separator',
    'classNames',
    'styles',
    'class',
    'style',
    'children',
  ])
  const config = useConfig()
  const token = useToken()
  const prefixCls = () => `${config.prefixCls()}-space`
  const [, hashId] = useSpaceStyle(prefixCls())
  const resolved = children(() => local.children)
  const items = () => resolved.toArray().filter(isRenderableItem)
  const gap = () => resolveGap(local.size, token())
  const orientation = () => resolveOrientation(local)
  const separator = () => local.separator ?? local.split
  const semanticClassNames = () => resolveSemanticClassNames(local.classNames, props)
  const semanticStyles = () => resolveSemanticStyles(local.styles, props)
  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        orientation() === 'vertical' && `${prefixCls()}-vertical`,
        local.wrap && `${prefixCls()}-wrap`,
        hashId(),
        local.class,
      )}
      style={mergeStyle(
        {
          'row-gap': `${gap()[1]}px`,
          'column-gap': `${gap()[0]}px`,
          'align-items': local.align,
        },
        local.style,
      )}
    >
      <For each={items()}>
        {(item, index) => (
          <>
            <span
              class={classNames(`${prefixCls()}-item`, semanticClassNames().item)}
              style={semanticStyles().item}
            >
              {item}
            </span>
            {separator() && index() < items().length - 1 ? (
              <span
                class={classNames(`${prefixCls()}-split`, semanticClassNames().split)}
                style={semanticStyles().split}
              >
                {separator()}
              </span>
            ) : null}
          </>
        )}
      </For>
    </div>
  )
}

export function SpaceCompact(props: SpaceCompactProps) {
  const [local, rest] = splitProps(props, [
    'block',
    'direction',
    'orientation',
    'vertical',
    'size',
    'class',
    'children',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-space`
  const [, hashId] = useSpaceStyle(prefixCls())
  const orientation = () => resolveOrientation(local)
  const size = () => local.size ?? 'medium'
  return (
    <div
      {...rest}
      class={classNames(
        `${prefixCls()}-compact`,
        orientation() === 'vertical' && `${prefixCls()}-compact-vertical`,
        local.block && `${prefixCls()}-compact-block`,
        compactSizeClass(prefixCls(), size()),
        hashId(),
        local.class,
      )}
    >
      {local.children}
    </div>
  )
}

export function SpaceAddon(props: SpaceAddonProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-space`
  const [, hashId] = useSpaceStyle(prefixCls())
  return (
    <span {...rest} class={classNames(`${prefixCls()}-compact-addon`, hashId(), local.class)}>
      {local.children}
    </span>
  )
}

export const Space = Object.assign(SpaceRoot, { Compact: SpaceCompact, Addon: SpaceAddon })
