import { Show, splitProps, type JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { Tooltip, type TooltipSemanticClassNames, type TooltipSemanticStyles } from '../tooltip'
import type { PopoverProps, PopoverSemanticClassNames, PopoverSemanticStyles } from './interface'
import { usePopoverStyle } from './popover.style'

function hasNode(node: PopoverProps['title'] | PopoverProps['content']) {
  return node !== undefined && node !== null && node !== ''
}

function isRenderFunction(value: PopoverProps['title']): value is () => JSX.Element {
  return typeof value === 'function'
}

function resolveContent(value: PopoverProps['title'] | PopoverProps['content']) {
  return isRenderFunction(value) ? value() : value
}

function hasOverlayContent(title: PopoverProps['title'], content: PopoverProps['content']) {
  return hasNode(title) || hasNode(content) || isRenderFunction(title) || isRenderFunction(content)
}

function textColorForBackground(color: string): string | undefined {
  if (!color.startsWith('#')) return undefined
  const value = color.slice(1)
  const normalized =
    value.length === 3
      ? value
          .split('')
          .map((part) => part + part)
          .join('')
      : value
  if (normalized.length !== 6) return undefined
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  if ([red, green, blue].some((part) => Number.isNaN(part))) return undefined
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000
  return luminance > 160 ? 'rgba(0, 0, 0, 0.88)' : '#ffffff'
}

export function Popover(props: PopoverProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'title',
    'content',
    'color',
    'classNames',
    'styles',
    'overlayInnerStyle',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-popover`
  const [, hashId] = usePopoverStyle(prefixCls())

  const semanticProps = (): PopoverProps => ({ ...props })
  const resolvedClassNames = (): PopoverSemanticClassNames =>
    typeof local.classNames === 'function'
      ? local.classNames({ props: semanticProps() })
      : (local.classNames ?? {})
  const resolvedStyles = (): PopoverSemanticStyles =>
    typeof local.styles === 'function'
      ? local.styles({ props: semanticProps() })
      : (local.styles ?? {})

  const tooltipClassNames = (): TooltipSemanticClassNames => {
    const classNames = resolvedClassNames()
    return {
      root: classNames.root,
      container: classNames.container,
      arrow: classNames.arrow,
    }
  }

  const tooltipStyles = (): TooltipSemanticStyles => {
    const styles = resolvedStyles()
    const colorStyles = local.color
      ? {
          'background-color': local.color,
          color: textColorForBackground(local.color),
        }
      : undefined
    const arrowColorStyles = local.color ? { 'background-color': local.color } : undefined

    return {
      root: { ...colorStyles, ...styles.root },
      container: { ...colorStyles, ...styles.container },
      arrow: { ...arrowColorStyles, ...styles.arrow },
    }
  }

  const overlayInnerStyle = () => {
    const colorStyles = local.color
      ? {
          'background-color': local.color,
          color: textColorForBackground(local.color),
        }
      : undefined

    return {
      ...colorStyles,
      ...local.overlayInnerStyle,
    }
  }

  const overlay = () => {
    const semanticClassNames = resolvedClassNames()
    const styles = resolvedStyles()
    const title = resolveContent(local.title)
    const content = resolveContent(local.content)

    return (
      <>
        <Show when={hasNode(title)}>
          <div
            class={classNames(`${prefixCls()}-title`, semanticClassNames.title)}
            style={styles.title}
          >
            {title}
          </div>
        </Show>
        <Show when={hasNode(content)}>
          <div
            class={classNames(`${prefixCls()}-content`, semanticClassNames.content)}
            style={styles.content}
          >
            {content}
          </div>
        </Show>
      </>
    )
  }

  return (
    <Tooltip
      {...rest}
      color={local.color}
      title={hasOverlayContent(local.title, local.content) ? overlay : undefined}
      rootClass={classNames(hashId(), rest.rootClass)}
      classNames={tooltipClassNames()}
      styles={tooltipStyles()}
      prefixCls={prefixCls()}
      skipStyle
      skipConfig
      overlayInnerStyle={overlayInnerStyle()}
    />
  )
}
