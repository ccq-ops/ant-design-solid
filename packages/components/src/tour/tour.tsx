import { Show, createEffect, createRenderEffect, createSignal, onCleanup } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, addPositionUpdateListeners } from '../shared/overlay'
import { getTooltipPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import type { JSX } from 'solid-js'
import type { TourPlacement, TourProps, TourStep, TourTarget } from './interface'
import { useTourStyle } from './tour.style'

type TargetPosition = JSX.CSSProperties

const DEFAULT_GAP = 8
const TOUR_OFFSET = 4

function resolveTarget(target: TourTarget | undefined) {
  if (!canUseDom() || !target) return undefined
  return typeof target === 'function' ? (target() ?? undefined) : (target ?? undefined)
}

function clampCurrent(current: number, total: number) {
  if (total <= 0) return 0
  if (current < 0) return 0
  if (current >= total) return total - 1
  return current
}

function getCenterPosition(): JSX.CSSProperties {
  if (!canUseDom()) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
}

function getMaskTargetPosition(rect: DOMRect, gap: number): TargetPosition {
  return {
    top: `${rect.top - gap}px`,
    left: `${rect.left - gap}px`,
    width: `${rect.width + gap * 2}px`,
    height: `${rect.height + gap * 2}px`,
  }
}

export function Tour(props: TourProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-tour`
  const [, hashId] = useTourStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('Tour', props.zIndex)
  const [innerOpen, setInnerOpen] = createSignal(Boolean(props.defaultOpen))
  const [innerCurrent, setInnerCurrent] = createSignal(props.defaultCurrent ?? 0)
  const [position, setPosition] = createSignal<JSX.CSSProperties>(getCenterPosition())
  const [targetPosition, setTargetPosition] = createSignal<TargetPosition>()

  const steps = () => props.steps ?? []
  const mergedOpen = () => Boolean((props.open ?? innerOpen()) && steps().length > 0)
  const current = () => clampCurrent(props.current ?? innerCurrent(), steps().length)
  const currentStep = () => steps()[current()]
  const placement = (step: TourStep | undefined = currentStep()) =>
    step?.placement ?? props.placement ?? 'bottom'
  const mask = (step: TourStep | undefined = currentStep()) => step?.mask ?? props.mask ?? true
  const arrow = (step: TourStep | undefined = currentStep()) => step?.arrow ?? props.arrow ?? true
  const gap = () => props.gap ?? DEFAULT_GAP

  const updatePosition = () => {
    if (!mergedOpen()) return
    const step = currentStep()
    const target = resolveTarget(step?.target)
    const nextPlacement: TourPlacement = target ? placement(step) : 'center'

    if (!target || nextPlacement === 'center') {
      setTargetPosition(undefined)
      setPosition(getCenterPosition())
      return
    }

    const rect = target.getBoundingClientRect()
    setTargetPosition(getMaskTargetPosition(rect, gap()))
    setPosition(getTooltipPosition(rect, nextPlacement, gap() + TOUR_OFFSET) as JSX.CSSProperties)
  }

  const setOpen = (nextOpen: boolean) => {
    if (props.open === undefined) setInnerOpen(nextOpen)
  }

  const close = () => {
    const closingStep = current()
    setOpen(false)
    props.onClose?.(closingStep)
  }

  const changeCurrent = (nextCurrent: number) => {
    const next = clampCurrent(nextCurrent, steps().length)
    if (props.current === undefined) setInnerCurrent(next)
    props.onChange?.(next)
  }

  const next = () => {
    if (current() >= steps().length - 1) {
      props.onFinish?.()
      close()
      return
    }
    changeCurrent(current() + 1)
  }

  const prev = () => changeCurrent(current() - 1)

  const cleanupKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && mergedOpen()) close()
  })

  createRenderEffect(() => {
    const dependencies = [current(), mergedOpen(), props.placement, props.gap]
    if (dependencies.length) updatePosition()
  })

  createEffect(() => {
    if (!mergedOpen()) return
    const removeListeners = addPositionUpdateListeners(updatePosition)
    onCleanup(removeListeners)
  })

  onCleanup(cleanupKeydown)

  return (
    <ZIndexContext.Provider value={contextZIndex}>
      <Show when={mergedOpen()}>
        <InternalPortal
          mount={() => props.getPopupContainer?.(resolveTarget(currentStep()?.target))}
        >
          <div
            class={classNames(`${prefixCls()}-root`, hashId())}
            style={{ 'z-index': zIndex, ...props.style }}
          >
            <Show when={mask()}>
              <Show when={targetPosition()} fallback={<div class={`${prefixCls()}-mask`} />}>
                {(targetStyle) => (
                  <div class={`${prefixCls()}-mask-target`} style={targetStyle()} />
                )}
              </Show>
            </Show>
            <div
              role="dialog"
              aria-modal="true"
              class={classNames(
                prefixCls(),
                `${prefixCls()}-${resolveTarget(currentStep()?.target) ? placement() : 'center'}`,
                hashId(),
                props.class,
              )}
              classList={props.classList}
              style={position()}
            >
              <Show when={arrow() && resolveTarget(currentStep()?.target)}>
                <div class={`${prefixCls()}-arrow`} />
              </Show>
              <div class={`${prefixCls()}-inner`}>
                <button
                  type="button"
                  class={`${prefixCls()}-close`}
                  aria-label="Close"
                  onClick={close}
                >
                  {props.closeIcon ?? '×'}
                </button>
                <Show when={currentStep()?.title}>
                  <div class={`${prefixCls()}-title`}>{currentStep()?.title}</div>
                </Show>
                <Show when={currentStep()?.description}>
                  <div class={`${prefixCls()}-description`}>{currentStep()?.description}</div>
                </Show>
                <div class={`${prefixCls()}-footer`}>
                  <div class={`${prefixCls()}-indicators`}>
                    {props.indicatorsRender?.(current(), steps().length) ??
                      `${current() + 1} / ${steps().length}`}
                  </div>
                  <div class={`${prefixCls()}-buttons`}>
                    <Show when={current() > 0}>
                      <button
                        {...currentStep()?.prevButtonProps}
                        type={currentStep()?.prevButtonProps?.type ?? 'button'}
                        class={classNames(
                          `${prefixCls()}-btn`,
                          currentStep()?.prevButtonProps?.class,
                        )}
                        onClick={(event) => {
                          const onClick = currentStep()?.prevButtonProps?.onClick as
                            | ((event: MouseEvent) => void)
                            | undefined
                          onClick?.(event)
                          prev()
                        }}
                      >
                        {currentStep()?.prevButtonProps?.children ?? props.prevText ?? 'Previous'}
                      </button>
                    </Show>
                    <button
                      {...currentStep()?.nextButtonProps}
                      type={currentStep()?.nextButtonProps?.type ?? 'button'}
                      class={classNames(
                        `${prefixCls()}-btn`,
                        `${prefixCls()}-primary-btn`,
                        current() >= steps().length - 1
                          ? `${prefixCls()}-finish-btn`
                          : `${prefixCls()}-next-btn`,
                        currentStep()?.nextButtonProps?.class,
                      )}
                      onClick={(event) => {
                        const onClick = currentStep()?.nextButtonProps?.onClick as
                          | ((event: MouseEvent) => void)
                          | undefined
                        onClick?.(event)
                        next()
                      }}
                    >
                      {currentStep()?.nextButtonProps?.children ??
                        (current() >= steps().length - 1
                          ? (props.finishText ?? 'Finish')
                          : (props.nextText ?? 'Next'))}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </ZIndexContext.Provider>
  )
}
