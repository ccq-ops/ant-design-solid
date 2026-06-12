import { Show, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { StatisticProps } from './interface'
import {
  formatStatisticValue,
  resolveSemanticClassNames,
  resolveSemanticStyles,
} from './format-util'
import { useStatisticStyle } from './statistic.style'

export function Statistic(props: StatisticProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'value',
    'precision',
    'prefix',
    'suffix',
    'loading',
    'formatter',
    'decimalSeparator',
    'groupSeparator',
    'classNames',
    'styles',
    'valueStyle',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-statistic`
  const [, hashId] = useStatisticStyle(prefixCls())
  const mergedProps = () => ({
    ...props,
    decimalSeparator: local.decimalSeparator ?? '.',
    groupSeparator: local.groupSeparator ?? ',',
    loading: local.loading ?? false,
  })
  const semanticClassNames = () => resolveSemanticClassNames(local.classNames, mergedProps())
  const semanticStyles = () => resolveSemanticStyles(local.styles, mergedProps())
  const valueText = () =>
    formatStatisticValue(local.value, {
      formatter: local.formatter,
      decimalSeparator: local.decimalSeparator,
      groupSeparator: local.groupSeparator,
      precision: local.precision,
    })
  const rootStyle = () =>
    typeof local.style === 'string'
      ? local.style
      : { ...semanticStyles().root, ...(local.style as JSX.CSSProperties | undefined) }
  const contentStyle = () =>
    typeof local.valueStyle === 'string'
      ? local.valueStyle
      : {
          ...(local.valueStyle as JSX.CSSProperties | undefined),
          ...semanticStyles().content,
        }

  return (
    <div
      {...rest}
      class={classNames(prefixCls(), hashId(), semanticClassNames().root, local.class)}
      classList={local.classList}
      style={rootStyle()}
    >
      <Show when={local.title !== undefined && local.title !== null}>
        <div
          class={classNames(`${prefixCls()}-header`, semanticClassNames().header)}
          style={semanticStyles().header}
        >
          <div
            class={classNames(`${prefixCls()}-title`, semanticClassNames().title)}
            style={semanticStyles().title}
          >
            {local.title}
          </div>
        </div>
      </Show>
      <div
        class={classNames(`${prefixCls()}-content`, semanticClassNames().content)}
        style={contentStyle()}
      >
        <Show when={!local.loading && local.prefix !== undefined && local.prefix !== null}>
          <span
            class={classNames(`${prefixCls()}-content-prefix`, semanticClassNames().prefix)}
            style={semanticStyles().prefix}
          >
            {local.prefix}
          </span>
        </Show>
        <span
          class={classNames(`${prefixCls()}-content-value`, semanticClassNames().value)}
          style={semanticStyles().value}
        >
          <Show when={!local.loading} fallback={<span class={`${prefixCls()}-loading`} />}>
            {valueText()}
          </Show>
        </span>
        <Show when={!local.loading && local.suffix !== undefined && local.suffix !== null}>
          <span
            class={classNames(`${prefixCls()}-content-suffix`, semanticClassNames().suffix)}
            style={semanticStyles().suffix}
          >
            {local.suffix}
          </span>
        </Show>
      </div>
    </div>
  )
}
