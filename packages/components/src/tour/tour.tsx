import { Show, createEffect, createRenderEffect, createSignal, onCleanup } from 'solid-js'
import { CloseOutlined } from '@solid-ant-design/icons'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, addPositionUpdateListeners } from '../shared/overlay'
import { getTooltipPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import type { JSX } from 'solid-js'
import type {
  TourArrow,
  TourGap,
  TourMask,
  TourPlacement,
  TourProps,
  TourScrollIntoViewOptions,
  TourSemanticClassNames,
  TourSemanticName,
  TourSemanticStyles,
  TourStep,
  TourTarget,
} from './interface'
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

function normalizeGap(gap: TourGap | undefined) {
  if (typeof gap === 'number') return { offsetX: gap, offsetY: gap, radius: undefined }
  const offset = gap?.offset ?? DEFAULT_GAP
  const offsetX = Array.isArray(offset) ? offset[0] : offset
  const offsetY = Array.isArray(offset) ? offset[1] : offset
  return { offsetX, offsetY, radius: gap?.radius }
}

function maskEnabled(mask: TourMask | undefined) {
  return mask !== false
}

function maskStyle(mask: TourMask | undefined): JSX.CSSProperties | undefined {
  return typeof mask === 'object' && mask !== null ? mask.style : undefined
}

function maskColor(mask: TourMask | undefined) {
  return typeof mask === 'object' && mask !== null ? mask.color : undefined
}

function arrowEnabled(arrow: TourArrow | undefined) {
  return arrow !== false
}

function getMaskTargetPosition(
  rect: DOMRect,
  gap: ReturnType<typeof normalizeGap>,
  mask: TourMask | undefined,
  disabledInteraction: boolean | undefined,
): TargetPosition {
  const style = maskStyle(mask) ?? {}
  return {
    ...style,
    top: `${rect.top - gap.offsetY}px`,
    left: `${rect.left - gap.offsetX}px`,
    width: `${rect.width + gap.offsetX * 2}px`,
    height: `${rect.height + gap.offsetY * 2}px`,
    ...(gap.radius !== undefined ? { 'border-radius': `${gap.radius}px` } : undefined),
    ...(maskColor(mask)
      ? { 'box-shadow': `0 0 0 9999px ${maskColor(mask)}`, background: 'transparent' }
      : undefined),
    'pointer-events': disabledInteraction ? 'auto' : 'none',
  }
}

function getMaskPosition(mask: TourMask | undefined): JSX.CSSProperties {
  return {
    ...maskStyle(mask),
    ...(maskColor(mask) ? { background: maskColor(mask) } : undefined),
  }
}

function resolveScrollIntoViewOptions(
  step: TourStep | undefined,
  props: TourProps,
): TourScrollIntoViewOptions {
  return step?.scrollIntoViewOptions ?? props.scrollIntoViewOptions ?? true
}

function scrollTargetIntoView(target: HTMLElement | undefined, options: TourScrollIntoViewOptions) {
  if (!target || options === false || typeof target.scrollIntoView !== 'function') return
  target.scrollIntoView(options === true ? undefined : options)
}

function resolveSemanticClassNames(
  value: TourProps['classNames'] | undefined,
  props: TourProps,
): TourSemanticClassNames {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: TourProps['styles'] | undefined,
  props: TourProps,
): TourSemanticStyles {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeSlotClass(
  key: TourSemanticName,
  propsClasses: TourSemanticClassNames,
  stepClasses?: TourStep['classNames'],
) {
  return classNames(propsClasses[key], stepClasses?.[key])
}

function mergeSlotStyle(
  key: TourSemanticName,
  propsStyles: TourSemanticStyles,
  stepStyles?: TourStep['styles'],
) {
  const merged = { ...propsStyles[key], ...stepStyles?.[key] }
  return Object.keys(merged).length > 0 ? merged : undefined
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
  const gap = () => normalizeGap(props.gap)
  const type = () => currentStep()?.type ?? props.type ?? 'default'
  const rootClassNames = () => resolveSemanticClassNames(props.classNames, props)
  const rootStyles = () => resolveSemanticStyles(props.styles, props)
  const slotClass = (key: TourSemanticName) =>
    mergeSlotClass(key, rootClassNames(), currentStep()?.classNames)
  const slotStyle = (key: TourSemanticName) =>
    mergeSlotStyle(key, rootStyles(), currentStep()?.styles)

  const updatePosition = () => {
    if (!mergedOpen()) return
    const step = currentStep()
    const target = resolveTarget(step?.target)
    const nextPlacement: TourPlacement = target ? placement(step) : 'center'
    scrollTargetIntoView(target, resolveScrollIntoViewOptions(step, props))

    if (!target || nextPlacement === 'center') {
      setTargetPosition(undefined)
      setPosition(getCenterPosition())
      return
    }

    const rect = target.getBoundingClientRect()
    setTargetPosition(getMaskTargetPosition(rect, gap(), mask(step), props.disabledInteraction))
    setPosition(
      getTooltipPosition(rect, nextPlacement, gap().offsetY + TOUR_OFFSET) as JSX.CSSProperties,
    )
  }

  const setOpen = (nextOpen: boolean) => {
    if (props.open === undefined) setInnerOpen(nextOpen)
  }

  const close = () => {
    const closingStep = current()
    currentStep()?.onClose?.()
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
    if (event.key === 'Escape' && mergedOpen() && props.keyboard !== false) close()
  })

  createRenderEffect(() => {
    const dependencies = [current(), mergedOpen(), props.placement, props.gap, props.mask]
    if (dependencies.length) updatePosition()
  })

  createEffect(() => {
    if (!mergedOpen()) return
    scrollTargetIntoView(
      resolveTarget(currentStep()?.target),
      resolveScrollIntoViewOptions(currentStep(), props),
    )
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
          <div class={classNames(`${prefixCls()}-root`, hashId())} style={{ 'z-index': zIndex }}>
            <Show when={maskEnabled(mask())}>
              <Show
                when={targetPosition()}
                fallback={
                  <div
                    class={classNames(`${prefixCls()}-mask`, slotClass('mask'))}
                    style={{ ...getMaskPosition(mask()), ...slotStyle('mask') }}
                  />
                }
              >
                {(targetStyle) => (
                  <div
                    class={classNames(`${prefixCls()}-mask-target`, slotClass('mask'))}
                    style={{ ...targetStyle(), ...slotStyle('mask') }}
                  />
                )}
              </Show>
            </Show>
            <div
              role="dialog"
              aria-modal="true"
              class={classNames(
                prefixCls(),
                `${prefixCls()}-${resolveTarget(currentStep()?.target) ? placement() : 'center'}`,
                type() !== 'default' && `${prefixCls()}-${type()}`,
                hashId(),
                props.class,
                currentStep()?.class,
                slotClass('root'),
              )}
              classList={props.classList}
              style={{
                ...position(),
                ...props.style,
                ...currentStep()?.style,
                ...slotStyle('root'),
              }}
            >
              <Show when={arrowEnabled(arrow()) && resolveTarget(currentStep()?.target)}>
                <div class={`${prefixCls()}-arrow`} />
              </Show>
              <div
                class={classNames(`${prefixCls()}-inner`, slotClass('section'))}
                style={slotStyle('section')}
              >
                <button
                  type="button"
                  class={classNames(`${prefixCls()}-close`, slotClass('close'))}
                  style={slotStyle('close')}
                  aria-label="Close"
                  onClick={close}
                >
                  {currentStep()?.closeIcon ?? props.closeIcon ?? <CloseOutlined />}
                </button>
                <Show when={currentStep()?.cover}>
                  <div
                    class={classNames(`${prefixCls()}-cover`, slotClass('cover'))}
                    style={slotStyle('cover')}
                  >
                    {currentStep()?.cover}
                  </div>
                </Show>
                <div
                  class={classNames(`${prefixCls()}-header`, slotClass('header'))}
                  style={slotStyle('header')}
                >
                  <Show when={currentStep()?.title}>
                    <div
                      class={classNames(`${prefixCls()}-title`, slotClass('title'))}
                      style={slotStyle('title')}
                    >
                      {currentStep()?.title}
                    </div>
                  </Show>
                  <Show when={currentStep()?.description}>
                    <div
                      class={classNames(`${prefixCls()}-description`, slotClass('description'))}
                      style={slotStyle('description')}
                    >
                      {currentStep()?.description}
                    </div>
                  </Show>
                </div>
                <div
                  class={classNames(`${prefixCls()}-footer`, slotClass('footer'))}
                  style={slotStyle('footer')}
                >
                  <div
                    class={classNames(`${prefixCls()}-indicators`, slotClass('indicators'))}
                    style={slotStyle('indicators')}
                  >
                    <span class={slotClass('indicator')} style={slotStyle('indicator')}>
                      {currentStep()?.indicatorsRender?.(current(), steps().length) ??
                        props.indicatorsRender?.(current(), steps().length) ??
                        `${current() + 1} / ${steps().length}`}
                    </span>
                  </div>
                  {(() => {
                    const originNode = (
                      <div
                        class={classNames(`${prefixCls()}-buttons`, slotClass('actions'))}
                        style={slotStyle('actions')}
                      >
                        <Show when={current() > 0}>
                          <Button
                            {...currentStep()?.prevButtonProps}
                            htmlType={currentStep()?.prevButtonProps?.htmlType ?? 'button'}
                            size={currentStep()?.prevButtonProps?.size ?? 'small'}
                            class={classNames(
                              `${prefixCls()}-btn`,
                              `${prefixCls()}-prev-btn`,
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
                            {currentStep()?.prevButtonProps?.children ??
                              props.prevText ??
                              'Previous'}
                          </Button>
                        </Show>
                        <Button
                          {...currentStep()?.nextButtonProps}
                          htmlType={currentStep()?.nextButtonProps?.htmlType ?? 'button'}
                          size={currentStep()?.nextButtonProps?.size ?? 'small'}
                          type={currentStep()?.nextButtonProps?.type ?? 'primary'}
                          class={classNames(
                            `${prefixCls()}-btn`,
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
                        </Button>
                      </div>
                    )
                    return (
                      currentStep()?.actionsRender?.(originNode, {
                        current: current(),
                        total: steps().length,
                      }) ??
                      props.actionsRender?.(originNode, {
                        current: current(),
                        total: steps().length,
                      }) ??
                      originNode
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </ZIndexContext.Provider>
  )
}
