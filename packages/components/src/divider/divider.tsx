import { Show, createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useDividerStyle } from './divider.style'
import type {
  DividerProps,
  DividerSemanticClassNames,
  DividerSemanticStyles,
  DividerTitlePlacement,
} from './interface'

function mergeStyles(...values: Array<JSX.CSSProperties | string | undefined>) {
  return Object.assign({}, ...values.filter((value) => value && typeof value !== 'string'))
}

function normalizeSize(size: DividerProps['size']) {
  return size === 'middle' ? 'medium' : size
}

function normalizeOrientationMargin(value: string | number | undefined) {
  if (typeof value === 'number') return `${value}px`
  if (value !== undefined && /^\d+$/.test(value)) return `${value}px`
  return value
}

export function Divider(props: DividerProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'orientation',
    'vertical',
    'titlePlacement',
    'orientationMargin',
    'rootClass',
    'dashed',
    'variant',
    'size',
    'plain',
    'classNames',
    'styles',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-divider`
  const [, hashId] = useDividerStyle(prefixCls())
  const orientation = () => local.orientation ?? (local.vertical ? 'vertical' : 'horizontal')
  const isVertical = () => orientation() === 'vertical'
  const titlePlacement = (): 'start' | 'end' | 'center' => {
    const placement: DividerTitlePlacement = local.titlePlacement ?? 'center'
    if (placement === 'left') return config.direction() === 'rtl' ? 'end' : 'start'
    if (placement === 'right') return config.direction() === 'rtl' ? 'start' : 'end'
    return placement
  }
  const variant = () => local.variant ?? (local.dashed ? 'dashed' : 'solid')
  const size = () => normalizeSize(local.size)
  const hasText = () => !isVertical() && local.children !== undefined && local.children !== null
  const hasMarginStart = () => titlePlacement() === 'start' && local.orientationMargin != null
  const hasMarginEnd = () => titlePlacement() === 'end' && local.orientationMargin != null
  const semanticProps = (): DividerProps => ({
    ...props,
    orientation: orientation(),
    vertical: isVertical(),
    titlePlacement: titlePlacement(),
    variant: variant(),
    size: size(),
  })
  const semanticClassNames = createMemo<DividerSemanticClassNames>(() =>
    typeof local.classNames === 'function'
      ? local.classNames({ props: semanticProps() })
      : (local.classNames ?? {}),
  )
  const semanticStyles = createMemo<DividerSemanticStyles>(() =>
    typeof local.styles === 'function'
      ? local.styles({ props: semanticProps() })
      : (local.styles ?? {}),
  )
  const contentMarginStyle = (): JSX.CSSProperties => ({
    'margin-inline-start': hasMarginStart()
      ? normalizeOrientationMargin(local.orientationMargin)
      : undefined,
    'margin-inline-end': hasMarginEnd()
      ? normalizeOrientationMargin(local.orientationMargin)
      : undefined,
  })
  const railClass = () => classNames(`${prefixCls()}-rail`, semanticClassNames().rail)

  return (
    <div
      {...rest}
      role="separator"
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${orientation()}`,
        hasText() && `${prefixCls()}-with-text`,
        hasText() && `${prefixCls()}-with-text-${titlePlacement()}`,
        variant() !== 'solid' && `${prefixCls()}-${variant()}`,
        local.plain && `${prefixCls()}-plain`,
        config.direction() === 'rtl' && `${prefixCls()}-rtl`,
        hasMarginStart() && `${prefixCls()}-no-default-orientation-margin-start`,
        hasMarginEnd() && `${prefixCls()}-no-default-orientation-margin-end`,
        size() === 'medium' && `${prefixCls()}-md`,
        size() === 'small' && `${prefixCls()}-sm`,
        !hasText() && railClass(),
        hashId(),
        local.class,
        local.rootClass,
        semanticClassNames().root,
      )}
      style={mergeStyles(
        semanticStyles().root,
        !hasText() ? semanticStyles().rail : undefined,
        local.style,
      )}
    >
      <Show when={hasText()}>
        <div
          class={classNames(railClass(), `${prefixCls()}-rail-start`)}
          style={semanticStyles().rail}
        />
        <span
          class={classNames(`${prefixCls()}-inner-text`, semanticClassNames().content)}
          style={mergeStyles(contentMarginStyle(), semanticStyles().content)}
        >
          {local.children}
        </span>
        <div
          class={classNames(railClass(), `${prefixCls()}-rail-end`)}
          style={semanticStyles().rail}
        />
      </Show>
    </div>
  )
}
