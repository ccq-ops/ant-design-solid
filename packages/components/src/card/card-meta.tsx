import { Show, createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  CardMetaProps,
  CardMetaSemanticClassNames,
  CardMetaSemanticClassNamesMap,
  CardMetaSemanticStyles,
  CardMetaSemanticStylesMap,
} from './interface'

function resolvePrefixCls(customizePrefixCls: string | undefined, fallbackPrefixCls: string) {
  return customizePrefixCls ?? `${fallbackPrefixCls}-card`
}

function resolveSemanticClassNames(
  value: CardMetaSemanticClassNames | undefined,
  props: CardMetaProps,
): CardMetaSemanticClassNamesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: CardMetaSemanticStyles | undefined,
  props: CardMetaProps,
): CardMetaSemanticStylesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeStyle(
  ...styles: Array<string | JSX.CSSProperties | undefined>
): string | JSX.CSSProperties {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  return Object.assign({}, ...styles.filter(Boolean))
}

export function CardMeta(props: CardMetaProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'avatar',
    'title',
    'description',
    'classNames',
    'styles',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())
  const metaPrefixCls = () => `${prefixCls()}-meta`
  const semanticClassNames = createMemo(() => resolveSemanticClassNames(local.classNames, props))
  const semanticStyles = createMemo(() => resolveSemanticStyles(local.styles, props))

  return (
    <div
      {...rest}
      class={classNames(metaPrefixCls(), semanticClassNames().root, local.class)}
      style={mergeStyle(semanticStyles().root, local.style)}
    >
      <Show when={local.avatar}>
        <div
          class={classNames(`${metaPrefixCls()}-avatar`, semanticClassNames().avatar)}
          style={semanticStyles().avatar}
        >
          {local.avatar}
        </div>
      </Show>
      <Show when={local.title || local.description}>
        <div
          class={classNames(`${metaPrefixCls()}-section`, semanticClassNames().section)}
          style={semanticStyles().section}
        >
          <Show when={local.title}>
            <div
              class={classNames(`${metaPrefixCls()}-title`, semanticClassNames().title)}
              style={semanticStyles().title}
            >
              {local.title}
            </div>
          </Show>
          <Show when={local.description}>
            <div
              class={classNames(`${metaPrefixCls()}-description`, semanticClassNames().description)}
              style={semanticStyles().description}
            >
              {local.description}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
