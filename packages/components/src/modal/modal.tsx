import { Show, createRenderEffect, createUniqueId, onCleanup, splitProps } from 'solid-js'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, lockBodyScroll, unlockBodyScroll } from '../shared/overlay'
import { InternalPortal } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import type { ModalProps } from './interface'
import { useModalStyle } from './modal.style'
import { CloseOutlined } from '@ant-design-solid/icons'

const modalStack: object[] = []

function removeFromStack(item: object) {
  const index = modalStack.lastIndexOf(item)
  if (index !== -1) modalStack.splice(index, 1)
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
    'mask',
    'maskClosable',
    'keyboard',
    'centered',
    'width',
    'zIndex',
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
  const [, hashId] = useModalStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('Modal', local.zIndex)
  const titleId = createUniqueId()
  const stackItem = {}
  let locked = false
  let wasOpen = false

  createRenderEffect(() => {
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
    if (!local.open && wasOpen) local.afterClose?.()
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
  const rootStyle = () => ({ 'z-index': zIndex, ...local.style })
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

  return (
    <ZIndexContext.Provider value={contextZIndex}>
      <Show when={local.open}>
        <InternalPortal>
          <div class={classNames(`${prefixCls()}-root`, hashId())} style={rootStyle()}>
            <Show when={local.mask ?? true}>
              <div class={`${prefixCls()}-mask`} />
            </Show>
            <div
              class={classNames(`${prefixCls()}-wrap`, local.centered && `${prefixCls()}-centered`)}
              role="dialog"
              aria-modal="true"
              aria-label={local['aria-label']}
              aria-labelledby={titleLabelId()}
              onClick={(event) => {
                if (event.target === event.currentTarget && (local.maskClosable ?? true)) {
                  local.onCancel?.()
                }
              }}
            >
              <div
                class={classNames(prefixCls(), local.class)}
                classList={local.classList}
                style={{ width: widthStyle() }}
                onClick={(event) => event.stopPropagation()}
              >
                <div class={`${prefixCls()}-content`}>
                  <Show when={local.closable ?? true}>
                    <button
                      type="button"
                      class={`${prefixCls()}-close`}
                      aria-label="close modal"
                      onClick={() => local.onCancel?.()}
                    >
                      <CloseOutlined />
                    </button>
                  </Show>
                  <Show when={local.title}>
                    <div class={`${prefixCls()}-header`}>
                      <div id={titleId} class={`${prefixCls()}-title`}>
                        {local.title}
                      </div>
                    </div>
                  </Show>
                  <div class={`${prefixCls()}-body`}>{local.children}</div>
                  <Show when={local.footer !== null}>
                    <div class={`${prefixCls()}-footer`}>
                      {local.footer ?? (
                        <>
                          <Button onClick={() => local.onCancel?.()}>
                            {local.cancelText ?? 'Cancel'}
                          </Button>
                          <Button type="primary" loading={local.confirmLoading} onClick={handleOk}>
                            {local.okText ?? 'OK'}
                          </Button>
                        </>
                      )}
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </ZIndexContext.Provider>
  )
}
