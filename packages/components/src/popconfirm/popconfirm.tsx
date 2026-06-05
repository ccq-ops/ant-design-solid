import { Show, createEffect, createSignal, onCleanup } from 'solid-js'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import type { PopconfirmProps } from './interface'
import { usePopconfirmStyle } from './popconfirm.style'

const POPUP_GAP = 8

export function Popconfirm(props: PopconfirmProps) {
  const [innerOpen, setInnerOpen] = createSignal(props.defaultOpen ?? false)
  const [trigger, setTrigger] = createSignal<HTMLElement>()
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-popconfirm`
  const [, hashId] = usePopconfirmStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('Popconfirm', props.zIndex)
  const mergedOpen = () => props.open ?? innerOpen()
  const placement = () => props.placement ?? 'top'

  const setOpen = (next: boolean) => {
    if (props.disabled && next) return
    if (props.open === undefined) setInnerOpen(next)
    props.onOpenChange?.(next)
  }

  const getPosition = (element = trigger()) => {
    if (!canUseDom()) return { top: '0px', left: '0px' }

    const rect = element?.getBoundingClientRect()
    if (!rect) return { top: '0px', left: '0px' }

    if (placement() === 'bottom') {
      return { top: `${rect.bottom + POPUP_GAP}px`, left: `${rect.left}px` }
    }
    if (placement() === 'left') {
      return { top: `${rect.top}px`, left: `${rect.left - 288}px` }
    }
    if (placement() === 'right') {
      return { top: `${rect.top}px`, left: `${rect.right + POPUP_GAP}px` }
    }
    return {
      top: `${rect.top - POPUP_GAP}px`,
      left: `${rect.left}px`,
      transform: 'translateY(-100%)',
    }
  }
  const [position, setPosition] = createSignal(getPosition())

  function updatePosition(): void {
    setPosition(getPosition())
  }

  createEffect(() => {
    if (!mergedOpen()) return
    const removeListeners = addPositionUpdateListeners(updatePosition)
    onCleanup(removeListeners)
  })

  const confirm = async (event?: MouseEvent) => {
    event?.stopPropagation()
    try {
      await props.onConfirm?.()
      setOpen(false)
    } catch {
      setOpen(true)
    }
  }

  const cancel = (event?: MouseEvent) => {
    event?.stopPropagation()
    props.onCancel?.()
    setOpen(false)
  }

  return (
    <ZIndexContext.Provider value={contextZIndex}>
      <span
        ref={setTrigger}
        onClick={(event) => {
          if (props.disabled) return
          setPosition(getPosition(event.currentTarget))
          setOpen(true)
        }}
      >
        {props.children}
      </span>
      <Show when={mergedOpen()}>
        <InternalPortal
          mount={() =>
            props.getPopupContainer?.(trigger()) ?? config.getPopupContainer?.(trigger())
          }
        >
          <div
            class={classNames(prefixCls(), `${prefixCls()}-${placement()}`, hashId())}
            style={{ ...position(), 'z-index': zIndex }}
            role="dialog"
            on:click={(event) => event.stopPropagation()}
          >
            <div class={`${prefixCls()}-title`}>{props.title}</div>
            <Show when={props.description}>
              <div class={`${prefixCls()}-description`}>{props.description}</div>
            </Show>
            <div class={`${prefixCls()}-buttons`}>
              <Button size="small" on:click={cancel}>
                {props.cancelText ?? 'Cancel'}
              </Button>
              <Button size="small" type="primary" on:click={confirm}>
                {props.okText ?? 'OK'}
              </Button>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </ZIndexContext.Provider>
  )
}
