import { Show, createRenderEffect, onCleanup, splitProps } from 'solid-js'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, lockBodyScroll, unlockBodyScroll } from '../shared/overlay'
import { InternalPortal } from '../shared/portal'
import type { ModalProps } from './interface'
import { useModalStyle } from './modal.style'

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
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-modal`
  const [, hashId] = useModalStyle(prefixCls())
  let locked = false
  let wasOpen = false

  createRenderEffect(() => {
    if (local.open && !locked) {
      lockBodyScroll()
      locked = true
    }
    if (!local.open && locked) {
      unlockBodyScroll()
      locked = false
    }
    if (!local.open && wasOpen) local.afterClose?.()
    wasOpen = Boolean(local.open)
  })

  const cleanupKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && local.open && (local.keyboard ?? true)) local.onCancel?.()
  })

  onCleanup(() => {
    cleanupKeydown()
    if (locked) unlockBodyScroll()
  })

  const widthStyle = () => {
    if (local.width === undefined) return undefined
    return typeof local.width === 'number' ? `${local.width}px` : local.width
  }
  const rootStyle = () => ({ 'z-index': local.zIndex, ...local.style })

  return (
    <Show when={local.open}>
      <InternalPortal>
        <div class={classNames(`${prefixCls()}-root`, hashId())} style={rootStyle()}>
          <Show when={local.mask ?? true}>
            <div
              class={`${prefixCls()}-mask`}
              onClick={() => {
                if (local.maskClosable ?? true) local.onCancel?.()
              }}
            />
          </Show>
          <div
            class={classNames(`${prefixCls()}-wrap`, local.centered && `${prefixCls()}-centered`)}
            role="dialog"
            aria-modal="true"
          >
            <div
              class={classNames(prefixCls(), local.class)}
              classList={local.classList}
              style={{ width: widthStyle() }}
            >
              <div class={`${prefixCls()}-content`}>
                <Show when={local.closable ?? true}>
                  <button
                    type="button"
                    class={`${prefixCls()}-close`}
                    aria-label="close modal"
                    onClick={() => local.onCancel?.()}
                  >
                    ×
                  </button>
                </Show>
                <Show when={local.title}>
                  <div class={`${prefixCls()}-header`}>
                    <div class={`${prefixCls()}-title`}>{local.title}</div>
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
                        <Button
                          type="primary"
                          loading={local.confirmLoading}
                          onClick={() => local.onOk?.()}
                        >
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
  )
}
