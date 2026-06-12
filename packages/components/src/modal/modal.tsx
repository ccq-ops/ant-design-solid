import {
  Show,
  createRenderEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
} from 'solid-js'
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
} from './interface'
import { useModalStyle } from './modal.style'
import { CloseOutlined } from '@ant-design-solid/icons'

const modalStack: object[] = []

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
    'className',
    'wrapClassName',
    'classNames',
    'styles',
    'onOk',
    'onCancel',
    'afterClose',
    'children',
    'class',
    'classList',
    'style',
    'aria-label',
    'aria-labelledby',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-modal`
  const watermarkPanelRef = useWatermarkPanelRef(`.${prefixCls()}-content`)
  const [, hashId] = useModalStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('Modal', local.zIndex)
  const titleId = createUniqueId()
  const stackItem = {}
  const [hasRendered, setHasRendered] = createSignal(Boolean(local.open || local.forceRender))
  let locked = false
  let wasOpen = false

  const shouldRender = () =>
    Boolean(local.open || local.forceRender || (hasRendered() && !local.destroyOnHidden))
  const maskEnabled = () =>
    isMaskConfig(local.mask) ? local.mask.enabled !== false : local.mask !== false
  const maskBlur = () => (isMaskConfig(local.mask) ? Boolean(local.mask.blur) : false)
  const maskClosable = () =>
    isMaskConfig(local.mask) && local.mask.closable !== undefined
      ? local.mask.closable
      : (local.maskClosable ?? true)
  const closeVisible = () => local.closable !== false
  const closeDisabled = () => isClosableConfig(local.closable) && Boolean(local.closable.disabled)
  const closeIcon = () =>
    isClosableConfig(local.closable)
      ? (local.closable.closeIcon ?? local.closeIcon ?? <CloseOutlined />)
      : (local.closeIcon ?? <CloseOutlined />)

  createRenderEffect(() => {
    if (local.open || local.forceRender) setHasRendered(true)
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
    if (local.open !== wasOpen) {
      local.afterOpenChange?.(Boolean(local.open))
    }
    if (!local.open && wasOpen) {
      local.afterClose?.()
      if (isClosableConfig(local.closable)) local.closable.afterClose?.()
    }
    wasOpen = Boolean(local.open)
  })

  const cleanupKeydown = addDocumentKeydown((event) => {
    if (
      event.key === 'Escape' &&
      local.open &&
      (local.keyboard ?? true) &&
      modalStack[modalStack.length - 1] === stackItem
    ) {
      local.onCancel?.()
    }
  })

  onCleanup(() => {
    cleanupKeydown()
    if (locked) {
      unlockBodyScroll()
      removeFromStack(stackItem)
    }
  })

  const widthStyle = () => {
    if (local.width === undefined) return undefined
    return typeof local.width === 'number' ? `${local.width}px` : local.width
  }
  const rootStyle = () => ({
    'z-index': zIndex,
    ...(local.open ? undefined : { display: 'none' }),
    ...local.styles?.root,
    ...local.style,
  })
  const titleLabelId = () => local['aria-labelledby'] ?? (local.title ? titleId : undefined)
  const handleOk = () => {
    try {
      const result = local.onOk?.()
      if (result && typeof (result as Promise<void>).catch === 'function') {
        ;(result as Promise<void>).catch(() => undefined)
      }
    } catch {
      // Keep controlled modal open and avoid surfacing handler failures through Solid's event system.
    }
  }
  const handleCloseClick = () => {
    if (isClosableConfig(local.closable)) local.closable.onClose?.()
    if (closeDisabled()) return
    local.onCancel?.()
  }

  const CancelBtn = () => (
    <Button {...local.cancelButtonProps} onClick={() => local.onCancel?.()}>
      {local.cancelText ?? 'Cancel'}
    </Button>
  )
  const OkBtn = () => (
    <Button
      {...local.okButtonProps}
      type={local.okType ?? 'primary'}
      loading={local.confirmLoading || local.okButtonProps?.loading}
      onClick={handleOk}
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
    const node = (
      <div
        ref={watermarkPanelRef}
        class={classNames(prefixCls(), local.class, local.className, local.classNames?.modal)}
        classList={local.classList}
        style={{ width: widthStyle(), ...local.styles?.modal }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          class={classNames(`${prefixCls()}-content`, local.classNames?.content)}
          style={local.styles?.content}
        >
          <Show when={closeVisible()}>
            <button
              type="button"
              class={classNames(`${prefixCls()}-close`, local.classNames?.close)}
              style={local.styles?.close}
              aria-label="close modal"
              aria-disabled={closeDisabled() || undefined}
              onClick={handleCloseClick}
            >
              {closeIcon()}
            </button>
          </Show>
          <Show when={local.title}>
            <div
              class={classNames(`${prefixCls()}-header`, local.classNames?.header)}
              style={local.styles?.header}
            >
              <div
                id={titleId}
                class={classNames(`${prefixCls()}-title`, local.classNames?.title)}
                style={local.styles?.title}
              >
                {local.title}
              </div>
            </div>
          </Show>
          <div
            class={classNames(`${prefixCls()}-body`, local.classNames?.body)}
            style={local.styles?.body}
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
              class={classNames(`${prefixCls()}-footer`, local.classNames?.footer)}
              style={local.styles?.footer}
            >
              {footerNode()}
            </div>
          </Show>
        </div>
      </div>
    )
    return local.modalRender ? local.modalRender(node) : node
  }

  const content = () => (
    <ZIndexContext.Provider value={contextZIndex}>
      <Show when={shouldRender()}>
        <div
          class={classNames(`${prefixCls()}-root`, hashId(), local.classNames?.root)}
          style={rootStyle()}
        >
          <Show when={maskEnabled()}>
            <div
              class={classNames(
                `${prefixCls()}-mask`,
                maskBlur() && `${prefixCls()}-mask-blur`,
                local.classNames?.mask,
              )}
              style={local.styles?.mask}
            />
          </Show>
          <div
            class={classNames(
              `${prefixCls()}-wrap`,
              local.centered && `${prefixCls()}-centered`,
              local.wrapClassName,
              local.classNames?.wrap,
            )}
            style={local.styles?.wrap}
            role="dialog"
            aria-modal="true"
            aria-label={local['aria-label']}
            aria-labelledby={titleLabelId()}
            onClick={(event) => {
              if (event.target === event.currentTarget && maskClosable()) {
                local.onCancel?.()
              }
            }}
          >
            {modalNode()}
          </div>
        </div>
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
