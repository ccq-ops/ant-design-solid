import { CloseOutlined, FileTextOutlined, VerticalAlignTopOutlined } from '@solid-ant-design/icons'
import {
  Show,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { Badge } from '../badge'
import { Tooltip } from '../tooltip'
import { classNames } from '../shared/class-names'
import type { AffixTarget } from '../affix'
import type {
  FloatButtonBackTopProps,
  FloatButtonComponent,
  FloatButtonGroupProps,
  FloatButtonGroupSemanticClassNames,
  FloatButtonGroupSemanticStyles,
  FloatButtonProps,
  FloatButtonSemanticClassNames,
  FloatButtonSemanticStyles,
  FloatButtonShape,
  FloatButtonTooltip,
} from './interface'
import { useFloatButtonStyle } from './float-button.style'

interface GroupContextValue {
  shape?: FloatButtonShape
  individual?: boolean
  classNames?: FloatButtonSemanticClassNames
  styles?: FloatButtonSemanticStyles
}

const GroupContext = createContext<() => GroupContextValue>(() => ({}))

function isWindow(target: AffixTarget): target is Window {
  return target === window
}

function getScrollTop(target: AffixTarget) {
  return isWindow(target)
    ? window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    : target.scrollTop
}

function getTarget(target?: () => AffixTarget | undefined | null): AffixTarget | undefined {
  if (typeof window === 'undefined') return undefined
  return target?.() ?? window
}

function addTargetListener(target: AffixTarget, eventName: 'scroll', listener: () => void) {
  target.addEventListener(eventName, listener)
  return () => target.removeEventListener(eventName, listener)
}

function resolveSemanticClassNames(
  value: FloatButtonProps['classNames'],
  props: FloatButtonProps,
): FloatButtonSemanticClassNames {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: FloatButtonProps['styles'],
  props: FloatButtonProps,
): FloatButtonSemanticStyles {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveGroupClassNames(
  value: FloatButtonGroupProps['classNames'],
  props: FloatButtonGroupProps,
): FloatButtonGroupSemanticClassNames {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveGroupStyles(
  value: FloatButtonGroupProps['styles'],
  props: FloatButtonGroupProps,
): FloatButtonGroupSemanticStyles {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeStyles(...values: Array<JSX.CSSProperties | string | undefined>) {
  if (values.some((value) => typeof value === 'string')) {
    return values.filter(Boolean).join(';')
  }
  return Object.assign({}, ...values.filter(Boolean))
}

function tooltipProps(tooltip: FloatButtonTooltip) {
  return typeof tooltip === 'object' &&
    tooltip !== null &&
    !Array.isArray(tooltip) &&
    !(tooltip instanceof Node)
    ? tooltip
    : { title: tooltip }
}

function scrollElementTo(target: AffixTarget, top: number) {
  if (isWindow(target)) {
    window.scrollTo(0, top)
    return
  }
  target.scrollTop = top
}

function scrollToTop(target: AffixTarget, duration = 450) {
  const startTop = getScrollTop(target)
  if (duration <= 0 || startTop <= 0 || typeof window === 'undefined') {
    scrollElementTo(target, 0)
    return
  }

  const startTime = Date.now()
  const frame = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - (1 - progress) ** 3
    scrollElementTo(target, Math.round(startTop * (1 - easeOut)))
    if (progress < 1) window.setTimeout(frame, 16)
  }
  frame()
}

function renderContent(
  prefixCls: string,
  icon: FloatButtonProps['icon'],
  content: FloatButtonProps['content'],
  semanticClassNames: FloatButtonSemanticClassNames,
  semanticStyles: FloatButtonSemanticStyles,
) {
  return (
    <>
      <Show when={icon !== undefined && icon !== null}>
        <span
          class={classNames(`${prefixCls}-icon`, semanticClassNames.icon)}
          style={semanticStyles.icon}
        >
          {icon}
        </span>
      </Show>
      <Show when={content !== undefined && content !== null}>
        <span
          class={classNames(`${prefixCls}-content`, semanticClassNames.content)}
          style={semanticStyles.content}
        >
          {content}
        </span>
      </Show>
    </>
  )
}

const BaseFloatButton = (props: FloatButtonProps) => {
  const [local, rest] = splitProps(props, [
    'type',
    'shape',
    'icon',
    'content',
    'description',
    'tooltip',
    'href',
    'target',
    'badge',
    'disabled',
    'htmlType',
    'classNames',
    'styles',
    'class',
    'classList',
    'style',
    'ref',
    'aria-label',
    'onClick',
  ])
  const groupContext = useContext(GroupContext)
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-float-button`
  const [, hashId] = useFloatButtonStyle(prefixCls())
  const mergedContent = () => local.content ?? local.description
  const mergedIcon = () => (!mergedContent() && !local.icon ? <FileTextOutlined /> : local.icon)
  const shape = () => groupContext().shape ?? local.shape ?? 'circle'
  const type = () => local.type ?? 'default'
  const semanticProps = (): FloatButtonProps => ({
    ...props,
    type: type(),
    shape: shape(),
    content: mergedContent(),
    icon: mergedIcon(),
  })
  const semanticClassNames = createMemo(() => ({
    ...groupContext().classNames,
    ...resolveSemanticClassNames(local.classNames, semanticProps()),
  }))
  const semanticStyles = createMemo(() => ({
    ...groupContext().styles,
    ...resolveSemanticStyles(local.styles, semanticProps()),
  }))
  const className = () =>
    classNames(
      prefixCls(),
      `${prefixCls()}-${type()}`,
      `${prefixCls()}-${shape()}`,
      groupContext().individual !== false && `${prefixCls()}-individual`,
      !mergedContent() && `${prefixCls()}-icon-only`,
      local.disabled && `${prefixCls()}-disabled`,
      hashId(),
      semanticClassNames().root,
      local.class,
    )
  const handleClick = (event: MouseEvent) => {
    if (local.disabled) {
      event.preventDefault()
      return
    }
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
  }
  const contentNode = () => (
    <>
      {renderContent(
        prefixCls(),
        mergedIcon(),
        mergedContent(),
        semanticClassNames(),
        semanticStyles(),
      )}
      <Show when={local.badge}>
        {(badge) => (
          <Badge
            {...badge()}
            class={classNames(
              `${prefixCls()}-badge`,
              badge().dot && `${prefixCls()}-badge-dot`,
              badge().class,
            )}
          />
        )}
      </Show>
    </>
  )
  const node = () => (
    <Show
      when={local.href}
      fallback={
        <button
          {...rest}
          ref={local.ref as HTMLButtonElement | undefined}
          type={local.htmlType ?? 'button'}
          disabled={local.disabled}
          title={typeof local.tooltip === 'string' ? local.tooltip : undefined}
          aria-label={local['aria-label']}
          class={className()}
          classList={local.classList}
          style={mergeStyles(semanticStyles().root, local.style as JSX.CSSProperties | undefined)}
          onClick={handleClick as JSX.EventHandler<HTMLButtonElement, MouseEvent>}
        >
          {contentNode()}
        </button>
      }
    >
      {(href) => (
        <a
          {...(rest as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={local.ref as HTMLAnchorElement | undefined}
          href={href()}
          target={local.target}
          title={typeof local.tooltip === 'string' ? local.tooltip : undefined}
          aria-label={local['aria-label']}
          aria-disabled={local.disabled || undefined}
          class={className()}
          classList={local.classList}
          style={mergeStyles(semanticStyles().root, local.style as JSX.CSSProperties | undefined)}
          onClick={handleClick as JSX.EventHandler<HTMLAnchorElement, MouseEvent>}
        >
          {contentNode()}
        </a>
      )}
    </Show>
  )

  if (typeof local.tooltip === 'string') return node()

  const tooltipNode = createMemo(() => local.tooltip)
  return (
    <Show when={tooltipNode()} fallback={node()}>
      {(tooltip) => <Tooltip {...tooltipProps(tooltip() as FloatButtonTooltip)}>{node()}</Tooltip>}
    </Show>
  )
}

function FloatButtonGroup(props: FloatButtonGroupProps) {
  const [local] = splitProps(props, [
    'shape',
    'trigger',
    'open',
    'closeIcon',
    'placement',
    'onOpenChange',
    'children',
    'classNames',
    'styles',
    'class',
    'classList',
    'style',
    'icon',
    'content',
    'description',
    'type',
    'tooltip',
    'badge',
    'disabled',
    'htmlType',
    'onClick',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-float-button`
  const [, hashId] = useFloatButtonStyle(prefixCls())
  const placement = () => local.placement ?? 'top'
  const isMenuMode = () => local.trigger === 'click' || local.trigger === 'hover'
  const [innerOpen, setInnerOpen] = createSignal(false)
  const open = () => Boolean(local.open ?? innerOpen())
  const mergedContent = () => local.content ?? local.description
  const groupProps = (): FloatButtonGroupProps => ({
    ...props,
    shape: local.shape ?? 'circle',
    placement: placement(),
  })
  const semanticClassNames = createMemo(() =>
    resolveGroupClassNames(local.classNames, groupProps()),
  )
  const semanticStyles = createMemo(() => resolveGroupStyles(local.styles, groupProps()))

  const setOpen = (nextOpen: boolean) => {
    if (open() === nextOpen) return
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }
  const handleMouseEnter = () => {
    if (local.trigger === 'hover') setOpen(true)
  }
  const handleMouseLeave = () => {
    if (local.trigger === 'hover') setOpen(false)
  }
  const handleTriggerClick = (event: MouseEvent) => {
    if (local.trigger === 'click') setOpen(!open())
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
  }
  const onDocumentClick = (event: MouseEvent) => {
    if (local.trigger !== 'click' || !open()) return
    if (rootRef?.contains(event.target as Node)) return
    setOpen(false)
  }
  let rootRef: HTMLDivElement | undefined

  onMount(() => {
    document.addEventListener('click', onDocumentClick, { capture: true })
  })
  onCleanup(() => document.removeEventListener('click', onDocumentClick, { capture: true }))

  const listContext = (): GroupContextValue => ({
    shape: local.shape ?? 'circle',
    individual: (local.shape ?? 'circle') === 'circle',
    classNames: {
      root: semanticClassNames().item,
      icon: semanticClassNames().itemIcon,
      content: semanticClassNames().itemContent,
    },
    styles: {
      root: semanticStyles().item,
      icon: semanticStyles().itemIcon,
      content: semanticStyles().itemContent,
    },
  })
  const triggerContext = (): GroupContextValue => ({
    ...listContext(),
    individual: true,
    classNames: {
      root: semanticClassNames().trigger,
      icon: semanticClassNames().triggerIcon,
      content: semanticClassNames().triggerContent,
    },
    styles: {
      root: semanticStyles().trigger,
      icon: semanticStyles().triggerIcon,
      content: semanticStyles().triggerContent,
    },
  })

  return (
    <div
      ref={(element) => {
        rootRef = element
      }}
      class={classNames(
        `${prefixCls()}-group`,
        (local.shape ?? 'circle') === 'circle' && `${prefixCls()}-group-individual`,
        isMenuMode() && `${prefixCls()}-group-menu-mode`,
        isMenuMode() && `${prefixCls()}-group-${placement()}`,
        hashId(),
        semanticClassNames().root,
        local.class,
      )}
      classList={local.classList}
      style={mergeStyles(semanticStyles().root, local.style as JSX.CSSProperties | undefined)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <GroupContext.Provider value={listContext}>
        <div
          class={classNames(`${prefixCls()}-group-list`, semanticClassNames().list)}
          style={mergeStyles(
            isMenuMode() && !open() ? { display: 'none' } : undefined,
            semanticStyles().list,
          )}
        >
          {local.children}
        </div>
      </GroupContext.Provider>
      <Show when={isMenuMode()}>
        <GroupContext.Provider value={triggerContext}>
          <BaseFloatButton
            type={local.type}
            shape={local.shape}
            icon={
              open() ? (local.closeIcon ?? <CloseOutlined />) : (local.icon ?? <FileTextOutlined />)
            }
            content={mergedContent()}
            tooltip={local.tooltip}
            badge={local.badge}
            disabled={local.disabled}
            htmlType={local.htmlType}
            onClick={handleTriggerClick}
          />
        </GroupContext.Provider>
      </Show>
    </div>
  )
}

function BackTop(props: FloatButtonBackTopProps) {
  const [local, rest] = splitProps(props, [
    'visibilityHeight',
    'target',
    'duration',
    'onClick',
    'children',
    'icon',
    'content',
    'class',
    'classList',
    'aria-label',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-float-button`
  const [visible, setVisible] = createSignal(false)

  const updateVisible = () => {
    const target = getTarget(local.target)
    if (!target) return
    setVisible(getScrollTop(target) >= (local.visibilityHeight ?? 400))
  }

  onMount(() => {
    const target = getTarget(local.target)
    if (!target) return
    updateVisible()
    const cleanupScroll = addTargetListener(target, 'scroll', updateVisible)
    onCleanup(cleanupScroll)
  })

  const handleClick = (event: MouseEvent) => {
    const target = getTarget(local.target)
    if (target) scrollToTop(target, local.duration ?? 450)
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
  }

  return (
    <Show when={visible()}>
      <BaseFloatButton
        {...rest}
        class={classNames(`${prefixCls()}-back-top`, local.class)}
        classList={local.classList}
        icon={local.icon ?? local.children ?? <VerticalAlignTopOutlined />}
        content={local.content}
        aria-label={local['aria-label'] ?? (local.content ? undefined : 'Back to top')}
        onClick={handleClick}
      />
    </Show>
  )
}

export const FloatButton = BaseFloatButton as FloatButtonComponent
FloatButton.Group = FloatButtonGroup
FloatButton.BackTop = BackTop
