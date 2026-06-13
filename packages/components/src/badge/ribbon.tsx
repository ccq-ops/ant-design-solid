import { Show, children as resolveChildren, createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useRibbonStyle } from './badge.style'
import type { RibbonProps, RibbonSemanticSlot } from './interface'
import {
  isPresetColor,
  mergeStyles,
  resolveColor,
  resolveRibbonClassNames,
  resolveRibbonStyles,
} from './utils'

export function Ribbon(props: RibbonProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClassName',
    'rootClass',
    'text',
    'color',
    'placement',
    'classNames',
    'styles',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const componentConfig = () => config.ribbon()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-ribbon`
  const wrapperCls = () => `${prefixCls()}-wrapper`
  const [, hashId] = useRibbonStyle(prefixCls(), wrapperCls())
  const placement = () => local.placement ?? 'end'
  const child = resolveChildren(() => local.children)
  const semanticClassNames = createMemo(() =>
    resolveRibbonClassNames(local.classNames ?? componentConfig().classNames, {
      ...props,
      classNames: local.classNames,
    }),
  )
  const semanticStyles = createMemo(() =>
    resolveRibbonStyles(local.styles ?? componentConfig().styles, {
      ...props,
      styles: local.styles,
    }),
  )
  const slotClass = (slot: RibbonSemanticSlot) => semanticClassNames()[slot]
  const slotStyle = (slot: RibbonSemanticSlot): JSX.CSSProperties | undefined =>
    semanticStyles()[slot]
  const customColor = () => resolveColor(local.color)
  const ribbonStyle = () =>
    mergeStyles(
      customColor()
        ? ({ background: customColor(), color: customColor() } as JSX.CSSProperties)
        : undefined,
      local.styles && typeof local.styles !== 'function' ? local.styles.indicator : undefined,
      slotStyle('indicator'),
      local.style,
    )
  const cornerStyle = () =>
    customColor() ? ({ color: customColor() } as JSX.CSSProperties) : undefined

  return (
    <div
      {...rest}
      class={classNames(
        wrapperCls(),
        hashId(),
        componentConfig().class,
        slotClass('root'),
        local.rootClass,
        local.rootClassName,
      )}
      style={mergeStyles(slotStyle('root'), componentConfig().style)}
    >
      {child()}
      <div
        class={classNames(
          prefixCls(),
          `${prefixCls()}-placement-${placement()}`,
          local.color && isPresetColor(local.color) && `${prefixCls()}-color-${local.color}`,
          hashId(),
          slotClass('indicator'),
          local.class,
        )}
        style={ribbonStyle()}
      >
        <span
          class={classNames(`${prefixCls()}-content`, slotClass('content'))}
          style={slotStyle('content')}
        >
          {local.text}
        </span>
        <Show when={true}>
          <div class={`${prefixCls()}-corner`} style={cornerStyle()} />
        </Show>
      </div>
    </div>
  )
}
