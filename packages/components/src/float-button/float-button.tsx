import {
  Show,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { AffixTarget } from '../affix'
import type {
  FloatButtonBackTopProps,
  FloatButtonComponent,
  FloatButtonGroupProps,
  FloatButtonProps,
  FloatButtonShape,
} from './interface'
import { useFloatButtonStyle } from './float-button.style'

const GroupShapeContext = createContext<() => FloatButtonShape | undefined>(() => undefined)

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

function scrollToTop(target: AffixTarget) {
  if (typeof target.scrollTo === 'function') {
    target.scrollTo({ top: 0, behavior: 'smooth' })
  } else if (!isWindow(target)) {
    target.scrollTop = 0
  }
}

function renderContent(
  prefixCls: string,
  icon: FloatButtonProps['icon'],
  description: FloatButtonProps['description'],
) {
  return (
    <>
      <Show when={icon !== undefined && icon !== null}>
        <span class={`${prefixCls}-icon`}>{icon}</span>
      </Show>
      <Show when={description !== undefined && description !== null}>
        <span class={`${prefixCls}-description`}>{description}</span>
      </Show>
    </>
  )
}

const BaseFloatButton = (props: FloatButtonProps) => {
  const [local, rest] = splitProps(props, [
    'type',
    'shape',
    'icon',
    'description',
    'tooltip',
    'href',
    'target',
    'class',
    'classList',
    'ref',
    'aria-label',
  ])
  const groupShape = useContext(GroupShapeContext)
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-float-button`
  const [, hashId] = useFloatButtonStyle(prefixCls())
  const shape = () => local.shape ?? groupShape() ?? 'circle'
  const type = () => local.type ?? 'default'
  const className = () =>
    classNames(
      prefixCls(),
      `${prefixCls()}-${type()}`,
      `${prefixCls()}-${shape()}`,
      hashId(),
      local.class,
    )

  return (
    <Show
      when={local.href}
      fallback={
        <button
          {...rest}
          type="button"
          title={local.tooltip}
          aria-label={local['aria-label']}
          class={className()}
          classList={local.classList}
        >
          {renderContent(prefixCls(), local.icon, local.description)}
        </button>
      }
    >
      {(href) => (
        <a
          {...rest}
          href={href()}
          target={local.target}
          title={local.tooltip}
          aria-label={local['aria-label']}
          class={className()}
          classList={local.classList}
        >
          {renderContent(prefixCls(), local.icon, local.description)}
        </a>
      )}
    </Show>
  )
}

function FloatButtonGroup(props: FloatButtonGroupProps) {
  const [local, rest] = splitProps(props, ['shape', 'children', 'class', 'classList', 'style'])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-float-button`
  const [, hashId] = useFloatButtonStyle(prefixCls())
  return (
    <GroupShapeContext.Provider value={() => local.shape}>
      <div
        {...rest}
        class={classNames(`${prefixCls()}-group`, hashId(), local.class)}
        classList={local.classList}
        style={local.style}
      >
        {local.children}
      </div>
    </GroupShapeContext.Provider>
  )
}

function BackTop(props: FloatButtonBackTopProps) {
  const [local] = splitProps(props, [
    'visibilityHeight',
    'target',
    'duration',
    'onClick',
    'children',
    'class',
    'classList',
    'ref',
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

  const handleClick = (event: MouseEvent & { currentTarget: HTMLElement; target: Element }) => {
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
    const target = getTarget(local.target)
    if (target) scrollToTop(target)
  }

  return (
    <Show when={visible()}>
      <BaseFloatButton
        class={classNames(`${prefixCls()}-back-top`, local.class)}
        classList={local.classList}
        icon={local.children ?? '↑'}
        description={local.children ? undefined : 'Top'}
        aria-label={local['aria-label'] ?? 'Back to top'}
        onClick={handleClick}
      />
    </Show>
  )
}

export const FloatButton = BaseFloatButton as FloatButtonComponent
FloatButton.Group = FloatButtonGroup
FloatButton.BackTop = BackTop
