import {
  Show,
  createEffect,
  createRenderEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, lockBodyScroll, unlockBodyScroll } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import { useWatermarkPanelRef } from '../watermark/context'
import type {
  ModalClosableConfig,
  ModalFooterRender,
  ModalMaskConfig,
  ModalProps,
  ModalStyles,
} from './interface'
import { useModalStyle } from './modal.style'
import { CloseOutlined } from '@solid-ant-design/icons'

const modalStack: object[] = []
const modalMotionDuration = 200
type MotionStatus = 'enter' | 'stable' | 'leave'

function removeFromStack(item: object) {
  const index = modalStack.lastIndexOf(item)
  if (index !== -1) modalStack.splice(index, 1)
}

function isMaskConfig(mask: ModalProps['mask']): mask is ModalMaskConfig {
  return typeof mask === 'object' && mask !== null
}

function isClosableConfig(closable: ModalProps['closable']): closable is ModalClosableConfig {
  return typeof closable === 'object' && closable !== null
}

function isFooterRender(footer: ModalProps['footer']): footer is ModalFooterRender {
  return typeof footer === 'function'
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function resolveGetContainer(
  getContainer: ModalProps['getContainer'],
): HTMLElement | undefined | false {
  if (!canUseDom()) return undefined
  if (getContainer === false) return false
  if (typeof getContainer === 'string') {
    return document.querySelector<HTMLElement>(getContainer) ?? undefined
  }
  if (typeof getContainer === 'function') return getContainer()
  return getContainer
}

function isCloseIconHidden(value: ModalProps['closeIcon']) {
  return value === null || value === false
}

function focusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    ),
  ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1)
}

export function ModalBase(props: ModalProps) {
  const [local] = splitProps(props, [
    'open',
    'title',
    'footer',
    'okText',
    'cancelText',
    'confirmLoading',
    'closable',
    'closeIcon',
    'mask',
    'maskClosable',
    'keyboard',
    'centered',
    'width',
    'zIndex',
    'okType',
    'okButtonProps',
    'cancelButtonProps',
    'destroyOnHidden',
    'forceRender',
    'getContainer',
    'modalRender',
    'afterOpenChange',
    'loading',
    'focusable',
    'focusTriggerAfterClose',
    'rootClass',
    'wrapClass',
    'classNames',
    'styles',
    'bodyStyle',
    'maskStyle',
    'onOk',
    'onCancel',
    'afterClose',
    'children',
    'class',
    'classList',
    'style',
    'rootStyle',
    'wrapProps',
    'prefixCls',
    'transitionName',
    'maskTransitionName',
    'mousePosition',
    'aria-label',
    'aria-labelledby',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-modal`
  const watermarkPanelRef = useWatermarkPanelRef(`.${prefixCls()}-content`)
  const [, hashId] = useModalStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('Modal', local.zIndex)
  const componentConfig = () => config.modal()
  const titleId = createUniqueId()
  const stackItem = {}
  const [hasRendered, setHasRendered] = createSignal(Boolean(local.open || local.forceRender))
  const [visible, setVisible] = createSignal(Boolean(local.open))
  const [motionStatus, setMotionStatus] = createSignal<MotionStatus>(
    local.open ? 'enter' : 'stable',
  )
  let locked = false
  let wasOpen = false
  let closeNotified = !local.open
  let motionTimer: ReturnType<typeof setTimeout> | undefined
  const [wrapRef, setWrapRef] = createSignal<HTMLDivElement>()
  let lastActiveElement: HTMLElement | null = null

  const shouldRender = () =>
    Boolean(
      local.open || visible() || local.forceRender || (hasRendered() && !local.destroyOnHidden),
    )
  const mergedMask = () => (local.mask !== undefined ? local.mask : componentConfig().mask)
  const mergedClosable = () =>
    local.closable !== undefined ? local.closable : componentConfig().closable
  const mergedCloseIcon = () =>
    local.closeIcon !== undefined ? local.closeIcon : componentConfig().closeIcon
  const mergedCentered = () =>
    local.centered !== undefined ? local.centered : componentConfig().centered
  const mergedOkButtonProps = () => ({
    ...componentConfig().okButtonProps,
    ...local.okButtonProps,
  })
  const mergedCancelButtonProps = () => ({
    ...componentConfig().cancelButtonProps,
    ...local.cancelButtonProps,
  })
  const mergedFocusable = () => ({
    ...componentConfig().focusable,
    ...local.focusable,
  })
  const maskEnabled = () => {
    const mask = mergedMask()
    return isMaskConfig(mask) ? mask.enabled !== false : mask !== false
  }
  const maskBlur = () => {
    const mask = mergedMask()
    return isMaskConfig(mask) ? Boolean(mask.blur) : false
  }
  const maskClosable = () => {
    const mask = mergedMask()
    return isMaskConfig(mask) && mask.closable !== undefined
      ? mask.closable
      : (local.maskClosable ?? true)
  }
  const closeVisible = () => mergedClosable() !== false && !isCloseIconHidden(mergedCloseIcon())
  const closeDisabled = () => {
    const closable = mergedClosable()
    return isClosableConfig(closable) && Boolean(closable.disabled)
  }
  const closeIcon = () => {
    const closable = mergedClosable()
    return isClosableConfig(closable)
      ? (closable.closeIcon ?? mergedCloseIcon() ?? <CloseOutlined />)
      : (mergedCloseIcon() ?? <CloseOutlined />)
  }
  const closeButtonAttrs = () => {
    const closable = mergedClosable()
    if (!isClosableConfig(closable)) return {}
    const attrs: Record<string, string | undefined> = {}
    Object.entries(closable).forEach(([key, value]) => {
      if ((key.startsWith('aria-') || key.startsWith('data-')) && typeof value === 'string') {
        attrs[key] = value
      }
    })
    return attrs
  }
  const focusableConfig = () => ({
    trap: mergedFocusable().trap ?? maskEnabled(),
    focusTriggerAfterClose:
      mergedFocusable().focusTriggerAfterClose ?? local.focusTriggerAfterClose ?? true,
    autoFocusButton: mergedFocusable().autoFocusButton,
  })
  const semanticInfo = () => ({ props })
  const semanticClasses = () => {
    const classNamesConfig = local.classNames ?? componentConfig().classNames
    return typeof classNamesConfig === 'function'
      ? classNamesConfig(semanticInfo())
      : classNamesConfig
  }
  const semanticStyles = () => {
    const stylesConfig = local.styles ?? componentConfig().styles
    return typeof stylesConfig === 'function' ? stylesConfig(semanticInfo()) : stylesConfig
  }
  const transitionName = () =>
    local.transitionName === undefined ? `${config.prefixCls()}-zoom` : local.transitionName
  const maskTransitionName = () =>
    local.maskTransitionName === undefined ? `${config.prefixCls()}-fade` : local.maskTransitionName
  const motionClass = (name: string | undefined, target: MotionStatus) =>
    name && target !== 'stable' ? `${name}-${target} ${name}-${target}-active` : undefined
  const modalMotionClass = () => motionClass(transitionName(), motionStatus())
  const maskMotionClass = () => motionClass(maskTransitionName(), motionStatus())
  const notifyClose = () => {
    if (closeNotified) return
    closeNotified = true
    local.afterClose?.()
    const closable = mergedClosable()
    if (isClosableConfig(closable)) closable.afterClose?.()
    if (focusableConfig().focusTriggerAfterClose) {
      queueMicrotask(() => lastActiveElement?.focus?.())
    }
    local.afterOpenChange?.(false)
  }
  const scheduleMotionEnd = (status: MotionStatus) => {
    if (motionTimer) clearTimeout(motionTimer)
    motionTimer = setTimeout(() => {
      if (status === 'enter' && local.open) {
        setMotionStatus('stable')
        return
      }
      if (status === 'leave' && !local.open) {
        setMotionStatus('stable')
        setVisible(false)
        notifyClose()
      }
    }, modalMotionDuration)
  }

  createRenderEffect(() => {
    if (local.open && !wasOpen && canUseDom()) {
      lastActiveElement = document.activeElement as HTMLElement | null
    }
    if (local.open || local.forceRender) setHasRendered(true)
    if (local.open) setVisible(true)
    if (local.open && !locked) {
      lockBodyScroll()
      modalStack.push(stackItem)
      locked = true
    }
    if (!local.open && locked) {
      unlockBodyScroll()
      removeFromStack(stackItem)
      locked = false
    }
    if (local.open && !wasOpen) {
      closeNotified = false
      setMotionStatus('enter')
      scheduleMotionEnd('enter')
      local.afterOpenChange?.(true)
    }
    if (!local.open && wasOpen) {
      setMotionStatus('leave')
      setVisible(true)
      scheduleMotionEnd('leave')
    }
    wasOpen = Boolean(local.open)
  })

  createEffect(() => {
    const wrap = wrapRef()
    if (!local.open || !wrap) return
    const autoFocusButton = focusableConfig().autoFocusButton
    if (!autoFocusButton) return
    const selector =
      autoFocusButton === 'ok'
        ? `.${prefixCls()}-footer .${config.prefixCls()}-btn-primary`
        : `.${prefixCls()}-footer .${config.prefixCls()}-btn:not(.${config.prefixCls()}-btn-primary)`
    queueMicrotask(() => wrap.querySelector<HTMLElement>(selector)?.focus())
  })

  const cleanupKeydown = addDocumentKeydown((event) => {
    if (
      event.key === 'Tab' &&
      local.open &&
      focusableConfig().trap &&
      modalStack[modalStack.length - 1] === stackItem &&
      wrapRef()
    ) {
      const wrap = wrapRef()
      if (!wrap) return
      const elements = focusableElements(wrap)
      if (!elements.length) {
        event.preventDefault()
        wrap.focus()
        return
      }
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    if (
      event.key === 'Escape' &&
      local.open &&
      (local.keyboard ?? true) &&
      modalStack[modalStack.length - 1] === stackItem
    ) {
      if (local.confirmLoading) return
      local.onCancel?.(event)
    }
  })

  onCleanup(() => {
    if (motionTimer) clearTimeout(motionTimer)
    cleanupKeydown()
    if (locked) {
      unlockBodyScroll()
      removeFromStack(stackItem)
    }
  })

  const widthStyle = (): string | ModalStyles['modal'] | undefined => {
    if (local.width === undefined) return undefined
    if (isPlainObject(local.width)) {
      const style: ModalStyles['modal'] = {}
      Object.entries(local.width).forEach(([breakpoint, value]) => {
        style[`--${prefixCls()}-${breakpoint}-width` as never] =
          typeof value === 'number' ? `${value}px` : value
      })
      return style
    }
    return typeof local.width === 'number' ? `${local.width}px` : local.width
  }
  const rootStyle = () => ({
    'z-index': zIndex,
    ...(visible() ? undefined : { display: 'none' }),
    ...semanticStyles()?.root,
    ...local.rootStyle,
    ...local.style,
  })
  const titleLabelId = () => local['aria-labelledby'] ?? (local.title ? titleId : undefined)
  const handleOk = (event: MouseEvent) => {
    try {
      const result = local.onOk?.(event)
      if (result && typeof (result as Promise<void>).catch === 'function') {
        ;(result as Promise<void>).catch(() => undefined)
      }
    } catch {
      // Keep controlled modal open and avoid surfacing handler failures through Solid's event system.
    }
  }
  const handleCancel = (event: MouseEvent | KeyboardEvent) => {
    if (local.confirmLoading) return
    local.onCancel?.(event)
  }
  const handleCloseClick = (event: MouseEvent) => {
    if (local.confirmLoading) return
    const closable = mergedClosable()
    if (isClosableConfig(closable)) closable.onClose?.()
    if (closeDisabled()) return
    handleCancel(event)
  }

  const CancelBtn = () => (
    <Button
      {...mergedCancelButtonProps()}
      onClick={(event) => handleCancel(event as unknown as MouseEvent)}
    >
      {local.cancelText ?? 'Cancel'}
    </Button>
  )
  const OkBtn = () => (
    <Button
      {...mergedOkButtonProps()}
      type={local.okType ?? 'primary'}
      loading={local.confirmLoading || mergedOkButtonProps().loading}
      onClick={(event) => handleOk(event as unknown as MouseEvent)}
    >
      {local.okText ?? 'OK'}
    </Button>
  )
  const defaultFooter = () => (
    <>
      <CancelBtn />
      <OkBtn />
    </>
  )
  const footerNode = () => {
    if (local.footer === null) return null
    const originNode = defaultFooter()
    if (isFooterRender(local.footer)) return local.footer(originNode, { OkBtn, CancelBtn })
    return local.footer ?? originNode
  }

  const modalNode = () => {
    const classes = semanticClasses()
    const styles = semanticStyles()
    const modalStyle = widthStyle()
    const node = (
      <div
        ref={watermarkPanelRef}
        class={classNames(
          prefixCls(),
          componentConfig().class,
          local.class,
          modalMotionClass(),
          classes?.modal,
          classes?.container,
        )}
        classList={local.classList}
        style={{
          ...(typeof modalStyle === 'object' ? modalStyle : { width: modalStyle }),
          ...styles?.modal,
          ...styles?.container,
          ...componentConfig().style,
          ...local.style,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div class={classNames(`${prefixCls()}-content`, classes?.content)} style={styles?.content}>
          <Show when={closeVisible()}>
            <button
              type="button"
              class={classNames(`${prefixCls()}-close`, classes?.close)}
              style={styles?.close}
              aria-label="close modal"
              aria-disabled={closeDisabled() || undefined}
              {...closeButtonAttrs()}
              onClick={(event) => handleCloseClick(event as unknown as MouseEvent)}
            >
              {closeIcon()}
            </button>
          </Show>
          <Show when={local.title}>
            <div
              class={classNames(`${prefixCls()}-header`, classes?.header)}
              style={styles?.header}
            >
              <div
                id={titleId}
                class={classNames(`${prefixCls()}-title`, classes?.title)}
                style={styles?.title}
              >
                {local.title}
              </div>
            </div>
          </Show>
          <div
            class={classNames(`${prefixCls()}-body`, classes?.body)}
            style={{ ...styles?.body, ...local.bodyStyle }}
          >
            <Show
              when={!local.loading}
              fallback={<div class={`${prefixCls()}-loading`}>Loading...</div>}
            >
              {local.children}
            </Show>
          </div>
          <Show when={footerNode() !== null}>
            <div
              class={classNames(`${prefixCls()}-footer`, classes?.footer)}
              style={styles?.footer}
            >
              {footerNode()}
            </div>
          </Show>
        </div>
      </div>
    )
    return local.modalRender ? (
      <div
        class={`${prefixCls()}-render`}
        style={typeof modalStyle === 'object' ? modalStyle : { width: modalStyle }}
      >
        {local.modalRender(node)}
      </div>
    ) : (
      node
    )
  }

  const content = () => (
    <ZIndexContext.Provider value={contextZIndex}>
      <Show when={shouldRender()}>
        {(() => {
          const classes = semanticClasses()
          const styles = semanticStyles()
          return (
            <div
              class={classNames(`${prefixCls()}-root`, hashId(), local.rootClass, classes?.root)}
              style={rootStyle()}
            >
              <Show when={maskEnabled()}>
                <div
                  class={classNames(
                    `${prefixCls()}-mask`,
                    maskBlur() && `${prefixCls()}-mask-blur`,
                    maskMotionClass(),
                    classes?.mask,
                  )}
                  style={{ ...styles?.mask, ...local.maskStyle }}
                />
              </Show>
              <div
                {...local.wrapProps}
                ref={setWrapRef}
                class={classNames(
                  `${prefixCls()}-wrap`,
                  mergedCentered() && `${prefixCls()}-centered`,
                  local.wrapClass,
                  classes?.wrap,
                  classes?.wrapper,
                  local.wrapProps?.class,
                )}
                style={{
                  ...styles?.wrap,
                  ...styles?.wrapper,
                  ...(local.wrapProps?.style as JSX.CSSProperties | undefined),
                }}
                tabindex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={local['aria-label']}
                aria-labelledby={titleLabelId()}
                onClick={(event) => {
                  if (event.target === event.currentTarget && maskClosable()) {
                    handleCancel(event as unknown as MouseEvent)
                  }
                  const wrapClick = local.wrapProps?.onClick
                  if (typeof wrapClick === 'function') wrapClick(event)
                }}
              >
                {modalNode()}
              </div>
            </div>
          )
        })()}
      </Show>
    </ZIndexContext.Provider>
  )

  const mount = () => resolveGetContainer(local.getContainer)

  return (
    <Show when={mount() !== false} fallback={content()}>
      <InternalPortal mount={mount() || undefined}>{content()}</InternalPortal>
    </Show>
  )
}
