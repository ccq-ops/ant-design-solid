import {
  For,
  Show,
  children as resolveChildren,
  createEffect,
  createRenderEffect,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import {
  addDocumentKeydown,
  addDocumentPointerDown,
  addPositionUpdateListeners,
} from '../shared/overlay'
import { getAdjustedTooltipPlacement, getTooltipPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import { Color, clamp, colorToCss, normalizeHsb, parseColor } from './color'
import type { HsbColor, ParsedGradientColorStop } from './color'
import { ColorPickerPanel } from './color-picker-panel'
import { useColorPickerStyle } from './color-picker.style'
import { GradientSlider } from './gradient-slider'
import type { ColorPickerProps } from './interface'
import type { ColorPickerFormat, ColorPickerMode } from './interface'

function emptyPosition(): JSX.CSSProperties {
  return { position: 'fixed', top: '0px', left: '0px' }
}

function mergeStyle(
  ...styles: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | string | undefined {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  const objectStyles = styles.filter((style): style is JSX.CSSProperties => !!style)

  if (stringStyle) return stringStyle
  if (!objectStyles.length) return undefined

  return Object.assign({}, ...objectStyles)
}

function resolveMaybeFn<T>(
  value: T | ((info: { props: ColorPickerProps }) => T) | undefined,
  props: ColorPickerProps,
): T | undefined {
  return typeof value === 'function'
    ? (value as (info: { props: ColorPickerProps }) => T)({ props })
    : value
}

function showArrow(arrow: ColorPickerProps['arrow']): boolean {
  return arrow !== false
}

function pointAtCenter(arrow: ColorPickerProps['arrow']): boolean {
  return typeof arrow === 'object' && Boolean(arrow.pointAtCenter)
}

function renderText(showText: ColorPickerProps['showText'], color: Color | undefined): JSX.Element {
  if (typeof showText === 'function') return showText(color)
  if (showText) return color?.toHexString() ?? ''
  return undefined
}

interface RgbInputDraft {
  red: string
  green: string
  blue: string
}

interface HsbInputDraft {
  hue: string
  saturation: string
  brightness: string
}

export function ColorPicker(props: ColorPickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onChange',
    'onChangeComplete',
    'open',
    'defaultOpen',
    'onOpenChange',
    'disabled',
    'size',
    'mode',
    'children',
    'placement',
    'arrow',
    'rootClass',
    'classNames',
    'styles',
    'autoAdjustOverflow',
    'destroyOnHidden',
    'destroyTooltipOnHide',
    'trigger',
    'format',
    'defaultFormat',
    'onFormatChange',
    'disabledFormat',
    'disabledAlpha',
    'allowClear',
    'onClear',
    'showText',
    'presets',
    'panelRender',
    'popupClass',
    'popupStyle',
    'zIndex',
    'getPopupContainer',
    'class',
    'style',
    'onClick',
    'onKeyDown',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-color-picker`
  const [, hashId] = useColorPickerStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('ColorPicker', local.zIndex)
  const initialColor = parseColor(local.defaultValue)
  const [innerColor, setInnerColor] = createSignal(initialColor)
  const [innerHsb, setInnerHsb] = createSignal(
    initialColor?.toHsb() ?? { h: 0, s: 0, b: 100, a: 1 },
  )
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [hasRenderedPopup, setHasRenderedPopup] = createSignal(Boolean(local.defaultOpen))
  const [innerFormat, setInnerFormat] = createSignal<ColorPickerFormat>(
    local.defaultFormat ?? 'hex',
  )
  const [innerMode, setInnerMode] = createSignal<ColorPickerMode>(
    initialColor?.isGradient() ? 'gradient' : 'single',
  )
  const [activeGradientIndex, setActiveGradientIndex] = createSignal(0)
  const [hexDraft, setHexDraft] = createSignal(
    parseColor(local.value)?.toHexString() ?? initialColor?.toHexString() ?? '',
  )
  const [rgbDraft, setRgbDraft] = createSignal<RgbInputDraft>({ red: '0', green: '0', blue: '0' })
  const [hsbDraft, setHsbDraft] = createSignal<HsbInputDraft>({
    hue: '0',
    saturation: '0',
    brightness: '100',
  })
  const [position, setPosition] = createSignal<JSX.CSSProperties>(emptyPosition())
  const resolvedChildren = resolveChildren(() => local.children)
  const valueControlled = () => 'value' in props
  const openControlled = () => 'open' in props
  const formatControlled = () => 'format' in props
  let triggerRef: HTMLElement | undefined
  let popupRef: HTMLDivElement | undefined
  let activeDragCleanup: (() => void) | undefined
  let suppressBlurTarget: HTMLInputElement | undefined
  let hoverCloseTimer: ReturnType<typeof setTimeout> | undefined
  let interactiveTriggerElement: HTMLElement | undefined
  let customTriggerClickCaptureCleanup: (() => void) | undefined

  const size = () => local.size ?? config.componentSize()
  const disabled = () => Boolean(local.disabled)
  const mergedColor = () => (valueControlled() ? parseColor(local.value) : innerColor())
  const modeOptions = (): ColorPickerMode[] =>
    Array.isArray(local.mode) ? local.mode : [local.mode ?? 'single']
  const modeState = (): ColorPickerMode => {
    if (modeOptions().length === 1) return modeOptions()[0]
    if (mergedColor()?.isGradient()) return 'gradient'
    return innerMode()
  }
  const gradientColors = (): ParsedGradientColorStop[] => {
    const color = mergedColor()

    if (color?.isGradient()) return color.getColors()

    const baseColor = color ?? Color.fromHsb(innerHsb())

    return [
      { color: baseColor, percent: 0 },
      { color: baseColor, percent: 100 },
    ]
  }
  const activeColor = () =>
    modeState() === 'gradient'
      ? (gradientColors()[activeGradientIndex()]?.color ?? gradientColors()[0]?.color)
      : mergedColor()
  const mergedHsb = () =>
    (modeState() === 'gradient'
      ? activeColor()?.toHsb()
      : valueControlled()
        ? mergedColor()?.toHsb()
        : innerHsb()) ?? { h: 0, s: 0, b: 100, a: 1 }
  const displayColor = () => (modeState() === 'gradient' ? mergedColor() : activeColor())
  const open = () => (openControlled() ? Boolean(local.open) : innerOpen())
  const format = () => local.format ?? innerFormat()
  const placement = () => local.placement ?? 'bottomLeft'
  const semanticClassNames = () => resolveMaybeFn(local.classNames, props) ?? {}
  const semanticStyles = () => resolveMaybeFn(local.styles, props) ?? {}
  const destroyOnHidden = () => {
    if (local.destroyOnHidden !== undefined) return local.destroyOnHidden
    if (typeof local.destroyTooltipOnHide === 'boolean') return local.destroyTooltipOnHide
    if (local.destroyTooltipOnHide) return true
    return false
  }
  const shouldRenderPopup = () => open() || (hasRenderedPopup() && !destroyOnHidden())
  const popupVisible = () => open()
  const adjustedPlacement = () => {
    const target = triggerRef

    if (!canUseDom() || !target) return placement()

    return getAdjustedTooltipPlacement(
      target.getBoundingClientRect(),
      placement(),
      4,
      local.autoAdjustOverflow,
    )
  }

  function updatePosition(element?: HTMLElement | Event): void {
    const target = element instanceof HTMLElement ? element : triggerRef
    if (!canUseDom() || !target) return
    const targetRect = target.getBoundingClientRect()
    const nextPlacement = getAdjustedTooltipPlacement(
      targetRect,
      placement(),
      4,
      local.autoAdjustOverflow,
    )

    setPosition({
      position: 'fixed',
      ...getTooltipPosition(targetRect, nextPlacement, 4),
    })
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled() && nextOpen) return
    if (nextOpen) updatePosition()
    if (!openControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function clearHoverCloseTimer(): void {
    if (!hoverCloseTimer) return

    clearTimeout(hoverCloseTimer)
    hoverCloseTimer = undefined
  }

  function scheduleHoverClose(): void {
    clearHoverCloseTimer()
    hoverCloseTimer = setTimeout(() => {
      hoverCloseTimer = undefined
      setOpen(false)
    }, 100)
  }

  function handleHoverEnter(): void {
    if (local.trigger !== 'hover') return

    clearHoverCloseTimer()
    setOpen(true)
  }

  function handleHoverLeave(): void {
    if (local.trigger !== 'hover') return

    scheduleHoverClose()
  }

  function containsTarget(target: EventTarget | null): boolean {
    return Boolean(
      target instanceof Node && (triggerRef?.contains(target) || popupRef?.contains(target)),
    )
  }

  const removeKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && open()) setOpen(false)
  })
  const removePointerDown = addDocumentPointerDown((event) => {
    if (open() && !containsTarget(event.target)) setOpen(false)
  })

  createRenderEffect(() => {
    if (!open()) return

    setHasRenderedPopup(true)
    updatePosition()
  })

  createRenderEffect(() => {
    syncDraftToSource(format())
  })

  createEffect(() => {
    if (!open()) return
    const removeListeners = addPositionUpdateListeners(updatePosition)
    onCleanup(removeListeners)
  })

  onCleanup(() => {
    removeKeydown()
    removePointerDown()
    clearHoverCloseTimer()
    activeDragCleanup?.()
    activeDragCleanup = undefined
    customTriggerClickCaptureCleanup?.()
    customTriggerClickCaptureCleanup = undefined
  })

  function emitColor(nextHsb: HsbColor): Color {
    const nextColor = Color.fromHsb(normalizeHsb(nextHsb))

    if (modeState() === 'gradient') {
      const nextColors = gradientColors()
      const nextIndex = clamp(activeGradientIndex(), 0, Math.max(0, nextColors.length - 1))

      nextColors[nextIndex] = { ...nextColors[nextIndex], color: nextColor }

      const nextGradient = Color.fromGradient(nextColors)

      if (!nextGradient) return nextColor
      if (!valueControlled()) {
        setInnerColor(nextGradient)
        setInnerHsb(nextColor.toHsb())
      }
      local.onChange?.(nextGradient, nextGradient.toCssString())

      return nextGradient
    }

    if (!valueControlled()) {
      setInnerColor(nextColor)
      setInnerHsb(normalizeHsb(nextHsb))
    }
    local.onChange?.(nextColor, nextColor.toHexString())

    return nextColor
  }

  function updateHsb(nextHsb: HsbColor): Color {
    return emitColor(nextHsb)
  }

  function hsbWith(nextHsb: Partial<HsbColor>): HsbColor {
    return { ...mergedHsb(), ...nextHsb }
  }

  function setModeState(nextMode: ColorPickerMode): void {
    if (disabled() || modeState() === nextMode) return

    setInnerMode(nextMode)

    if (nextMode === 'gradient') {
      const nextGradient = Color.fromGradient(gradientColors())

      if (!nextGradient) return
      if (!valueControlled()) setInnerColor(nextGradient)
      local.onChange?.(nextGradient, nextGradient.toCssString())
      syncDraftToSource()
      return
    }

    const nextColor = activeColor()

    if (!valueControlled()) {
      setInnerColor(nextColor)
      if (nextColor) setInnerHsb(nextColor.toHsb())
    }
    if (nextColor) local.onChange?.(nextColor, nextColor.toHexString())
    syncDraftToSource()
  }

  function emitGradientColors(
    colors: ParsedGradientColorStop[],
    options: { complete?: boolean } = {},
  ): Color | undefined {
    const nextGradient = Color.fromGradient(colors)

    if (!nextGradient) return undefined
    if (!valueControlled()) {
      setInnerColor(nextGradient)
      setInnerHsb(
        nextGradient.getColors()[activeGradientIndex()]?.color.toHsb() ??
          nextGradient.getColors()[0].color.toHsb(),
      )
    }
    local.onChange?.(nextGradient, nextGradient.toCssString())
    if (options.complete) local.onChangeComplete?.(nextGradient)
    syncDraftToSource()

    return nextGradient
  }

  function rgbSourceDraft(): RgbInputDraft {
    const rgb = activeColor()?.toRgb() ?? { r: 0, g: 0, b: 0 }

    return {
      red: String(rgb.r),
      green: String(rgb.g),
      blue: String(rgb.b),
    }
  }

  function hsbSourceDraft(): HsbInputDraft {
    const hsb = mergedHsb()

    return {
      hue: String(hsb.h),
      saturation: String(hsb.s),
      brightness: String(hsb.b),
    }
  }

  function syncDraftToSource(nextFormat = format()): void {
    if (nextFormat === 'rgb') {
      setRgbDraft(rgbSourceDraft())
      return
    }

    if (nextFormat === 'hsb') {
      setHsbDraft(hsbSourceDraft())
      return
    }

    setHexDraft(activeColor()?.toHexString() ?? '')
  }

  function sourceValueForInput(label: string | null): string {
    const rgb = rgbSourceDraft()
    const hsb = hsbSourceDraft()

    switch (label) {
      case 'Red':
        return rgb.red
      case 'Green':
        return rgb.green
      case 'Blue':
        return rgb.blue
      case 'H':
        return hsb.hue
      case 'S':
        return hsb.saturation
      case 'B':
        return hsb.brightness
      default:
        return activeColor()?.toHexString() ?? ''
    }
  }

  function resetDisabledInput(element: HTMLInputElement): void {
    syncDraftToSource()
    element.value = sourceValueForInput(element.getAttribute('aria-label'))
  }

  function parseInputNumber(value: string): number | undefined {
    if (value.trim() === '') return undefined

    const numberValue = Number(value)

    return Number.isFinite(numberValue) ? numberValue : undefined
  }

  function completeInputCommit(nextColor: Color): void {
    local.onChangeComplete?.(nextColor)
    syncDraftToSource()
  }

  function clearColor(): void {
    if (disabled()) return

    if (!valueControlled()) setInnerColor(undefined)
    local.onChange?.(undefined, '')
    local.onChangeComplete?.(undefined)
    local.onClear?.()
    syncDraftToSource()
  }

  function presetColorLabel(
    value: NonNullable<ColorPickerProps['presets']>[number]['colors'][number],
  ): string {
    return typeof value === 'string' ? value : colorToCss(parseColor(value))
  }

  function selectPreset(
    value: NonNullable<ColorPickerProps['presets']>[number]['colors'][number],
  ): void {
    if (disabled()) return

    const nextColor = parseColor(value)

    if (!nextColor) return

    completeInputCommit(emitColor(nextColor.toHsb()))
  }

  function presetList() {
    return local.presets ?? []
  }

  function commitParsedInput(value: string): void {
    if (disabled()) {
      syncDraftToSource()
      return
    }

    const nextColor = parseColor(value)

    if (!nextColor) {
      syncDraftToSource()
      return
    }

    completeInputCommit(emitColor(nextColor.toHsb()))
  }

  function commitRgbInputs(red: string, green: string, blue: string): void {
    if (disabled()) {
      syncDraftToSource()
      return
    }

    const r = parseInputNumber(red)
    const g = parseInputNumber(green)
    const b = parseInputNumber(blue)

    if (r === undefined || g === undefined || b === undefined) {
      syncDraftToSource()
      return
    }

    completeInputCommit(
      emitColor(Color.fromRgb({ r, g, b, a: mergedColor()?.toRgb().a ?? 1 }).toHsb()),
    )
  }

  function commitHsbInputs(hue: string, saturation: string, brightness: string): void {
    if (disabled()) {
      syncDraftToSource()
      return
    }

    const h = parseInputNumber(hue)
    const s = parseInputNumber(saturation)
    const b = parseInputNumber(brightness)

    if (h === undefined || s === undefined || b === undefined) {
      syncDraftToSource()
      return
    }

    completeInputCommit(emitColor(Color.fromHsb({ h, s, b, a: mergedHsb().a }).toHsb()))
  }

  function handleInputKeyDown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement },
    commit: () => void,
  ): void {
    if (event.key !== 'Enter') return

    event.preventDefault()
    if (disabled()) {
      resetDisabledInput(event.currentTarget)
      return
    }

    commit()
    suppressBlurTarget = event.currentTarget
  }

  function handleInputBlur(
    event: FocusEvent & { currentTarget: HTMLInputElement },
    commit: () => void,
  ): void {
    if (disabled()) {
      resetDisabledInput(event.currentTarget)
      return
    }

    if (suppressBlurTarget === event.currentTarget) {
      suppressBlurTarget = undefined
      return
    }

    commit()
  }

  function formatInputs(): JSX.Element {
    const currentFormat = format()

    if (currentFormat === 'rgb') {
      const draft = rgbDraft()
      const commit = () => commitRgbInputs(rgbDraft().red, rgbDraft().green, rgbDraft().blue)

      return (
        <fieldset class={`${prefixCls()}-inputs ${prefixCls()}-inputs-rgb`} disabled={disabled()}>
          <input
            aria-label="Red"
            class={`${prefixCls()}-input`}
            value={draft.red}
            disabled={disabled()}
            onInput={(event) => {
              suppressBlurTarget = undefined
              if (disabled()) {
                resetDisabledInput(event.currentTarget)
                return
              }
              setRgbDraft((current) => ({ ...current, red: event.currentTarget.value }))
            }}
            onBlur={(event) => handleInputBlur(event, commit)}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
          <input
            aria-label="Green"
            class={`${prefixCls()}-input`}
            value={draft.green}
            disabled={disabled()}
            onInput={(event) => {
              suppressBlurTarget = undefined
              if (disabled()) {
                resetDisabledInput(event.currentTarget)
                return
              }
              setRgbDraft((current) => ({ ...current, green: event.currentTarget.value }))
            }}
            onBlur={(event) => handleInputBlur(event, commit)}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
          <input
            aria-label="Blue"
            class={`${prefixCls()}-input`}
            value={draft.blue}
            disabled={disabled()}
            onInput={(event) => {
              suppressBlurTarget = undefined
              if (disabled()) {
                resetDisabledInput(event.currentTarget)
                return
              }
              setRgbDraft((current) => ({ ...current, blue: event.currentTarget.value }))
            }}
            onBlur={(event) => handleInputBlur(event, commit)}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
        </fieldset>
      )
    }

    if (currentFormat === 'hsb') {
      const draft = hsbDraft()
      const commit = () =>
        commitHsbInputs(hsbDraft().hue, hsbDraft().saturation, hsbDraft().brightness)

      return (
        <fieldset class={`${prefixCls()}-inputs ${prefixCls()}-inputs-hsb`} disabled={disabled()}>
          <input
            aria-label="H"
            title="Hue"
            class={`${prefixCls()}-input`}
            value={draft.hue}
            disabled={disabled()}
            onInput={(event) => {
              suppressBlurTarget = undefined
              if (disabled()) {
                resetDisabledInput(event.currentTarget)
                return
              }
              setHsbDraft((current) => ({ ...current, hue: event.currentTarget.value }))
            }}
            onBlur={(event) => handleInputBlur(event, commit)}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
          <input
            aria-label="S"
            title="Saturation"
            class={`${prefixCls()}-input`}
            value={draft.saturation}
            disabled={disabled()}
            onInput={(event) => {
              suppressBlurTarget = undefined
              if (disabled()) {
                resetDisabledInput(event.currentTarget)
                return
              }
              setHsbDraft((current) => ({ ...current, saturation: event.currentTarget.value }))
            }}
            onBlur={(event) => handleInputBlur(event, commit)}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
          <input
            aria-label="B"
            title="Brightness"
            class={`${prefixCls()}-input`}
            value={draft.brightness}
            disabled={disabled()}
            onInput={(event) => {
              suppressBlurTarget = undefined
              if (disabled()) {
                resetDisabledInput(event.currentTarget)
                return
              }
              setHsbDraft((current) => ({ ...current, brightness: event.currentTarget.value }))
            }}
            onBlur={(event) => handleInputBlur(event, commit)}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
        </fieldset>
      )
    }

    const commit = () => commitParsedInput(hexDraft())

    return (
      <fieldset class={`${prefixCls()}-inputs ${prefixCls()}-inputs-hex`} disabled={disabled()}>
        <input
          aria-label="Hex"
          class={`${prefixCls()}-input`}
          value={hexDraft()}
          disabled={disabled()}
          onInput={(event) => {
            suppressBlurTarget = undefined
            if (disabled()) {
              resetDisabledInput(event.currentTarget)
              return
            }
            setHexDraft(event.currentTarget.value)
          }}
          onBlur={(event) => handleInputBlur(event, commit)}
          onKeyDown={(event) => handleInputKeyDown(event, commit)}
        />
      </fieldset>
    )
  }

  function updateSaturation(
    element: HTMLElement,
    event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  ): Color {
    const rect = element.getBoundingClientRect()
    const width = rect.width || 1
    const height = rect.height || 1
    const saturation = clamp(((event.clientX - rect.left) / width) * 100, 0, 100)
    const brightness = clamp(100 - ((event.clientY - rect.top) / height) * 100, 0, 100)

    return updateHsb(hsbWith({ s: saturation, b: brightness }))
  }

  function updateSlider(
    element: HTMLElement,
    event: Pick<PointerEvent, 'clientX'>,
    channel: 'h' | 'a',
  ): Color {
    const rect = element.getBoundingClientRect()
    const width = rect.width || 1
    const percent = clamp((event.clientX - rect.left) / width, 0, 1)
    const nextValue = channel === 'h' ? percent * 360 : percent

    return updateHsb(hsbWith({ [channel]: nextValue }))
  }

  function startPointerDrag(
    event: PointerEvent,
    update: (event: Pick<PointerEvent, 'clientX' | 'clientY'>) => Color,
  ): void {
    if (disabled()) return

    activeDragCleanup?.()
    activeDragCleanup = undefined
    event.preventDefault()
    let latestColor = update(event)

    const cleanupDrag = (complete = false) => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerCancel)
      if (activeDragCleanup === cleanupDrag) activeDragCleanup = undefined
      if (complete) local.onChangeComplete?.(latestColor)
    }
    const handlePointerMove = (moveEvent: PointerEvent) => {
      latestColor = update(moveEvent)
    }
    const handlePointerUp = () => {
      cleanupDrag(true)
    }
    const handlePointerCancel = (cancelEvent: PointerEvent) => {
      latestColor = update(cancelEvent)
      cleanupDrag(true)
    }

    activeDragCleanup = cleanupDrag
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerCancel)
  }

  function completeKeyboardChange(nextHsb: HsbColor): void {
    const nextColor = emitColor(nextHsb)

    local.onChangeComplete?.(nextColor)
  }

  function handleHueKeyDown(event: KeyboardEvent): void {
    if (disabled()) return

    const step = event.shiftKey ? 10 : 1
    let nextHue: number | undefined

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextHue = clamp(mergedHsb().h + step, 0, 360)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        nextHue = clamp(mergedHsb().h - step, 0, 360)
        break
      case 'Home':
        nextHue = 0
        break
      case 'End':
        nextHue = 360
        break
      default:
        return
    }

    event.preventDefault()
    completeKeyboardChange(hsbWith({ h: nextHue }))
  }

  function handleAlphaKeyDown(event: KeyboardEvent): void {
    if (disabled()) return

    const step = event.shiftKey ? 0.1 : 0.01
    let nextAlpha: number | undefined

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextAlpha = clamp(mergedHsb().a + step, 0, 1)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        nextAlpha = clamp(mergedHsb().a - step, 0, 1)
        break
      case 'Home':
        nextAlpha = 0
        break
      case 'End':
        nextAlpha = 1
        break
      default:
        return
    }

    event.preventDefault()
    completeKeyboardChange(hsbWith({ a: Number(nextAlpha.toFixed(2)) }))
  }

  function handleSaturationKeyDown(event: KeyboardEvent): void {
    if (disabled()) return

    const step = event.shiftKey ? 10 : 1
    let nextHsb: Partial<HsbColor> | undefined

    switch (event.key) {
      case 'ArrowRight':
        nextHsb = { s: clamp(mergedHsb().s + step, 0, 100) }
        break
      case 'ArrowLeft':
        nextHsb = { s: clamp(mergedHsb().s - step, 0, 100) }
        break
      case 'ArrowUp':
        nextHsb = { b: clamp(mergedHsb().b + step, 0, 100) }
        break
      case 'ArrowDown':
        nextHsb = { b: clamp(mergedHsb().b - step, 0, 100) }
        break
      case 'Home':
        nextHsb = { s: 0, b: 0 }
        break
      case 'End':
        nextHsb = { s: 100, b: 100 }
        break
      default:
        return
    }

    event.preventDefault()
    completeKeyboardChange(hsbWith(nextHsb))
  }

  function renderModeSwitcher(): JSX.Element {
    return (
      <Show when={modeOptions().length > 1}>
        <div class={`${prefixCls()}-mode-switch`} role="group" aria-label="Color mode">
          <button
            type="button"
            class={classNames(
              `${prefixCls()}-mode-button`,
              modeState() === 'single' && `${prefixCls()}-mode-button-active`,
            )}
            aria-pressed={modeState() === 'single'}
            disabled={disabled()}
            onClick={() => setModeState('single')}
          >
            Single
          </button>
          <button
            type="button"
            class={classNames(
              `${prefixCls()}-mode-button`,
              modeState() === 'gradient' && `${prefixCls()}-mode-button-active`,
            )}
            aria-pressed={modeState() === 'gradient'}
            disabled={disabled()}
            onClick={() => setModeState('gradient')}
          >
            Gradient
          </button>
        </div>
      </Show>
    )
  }

  function renderGradientSlider(): JSX.Element {
    return (
      <Show when={modeState() === 'gradient'}>
        <GradientSlider
          prefixCls={prefixCls()}
          colors={gradientColors()}
          activeIndex={activeGradientIndex()}
          disabled={disabled()}
          onActive={(index) => {
            setActiveGradientIndex(index)
            syncDraftToSource()
          }}
          onChange={(colors) => {
            emitGradientColors(colors)
          }}
          onChangeComplete={(colors) => {
            emitGradientColors(colors, { complete: true })
          }}
        />
      </Show>
    )
  }

  function renderPicker(): JSX.Element {
    const hsb = mergedHsb
    const alphaBackground = () =>
      `linear-gradient(to right, rgba(255, 255, 255, 0), ${Color.fromHsb({ ...hsb(), a: 1 }).toRgbString()})`

    return (
      <>
        <div
          role="slider"
          aria-label="Saturation and brightness"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(hsb().s)}
          aria-valuetext={`${Math.round(hsb().s)}% saturation, ${Math.round(hsb().b)}% brightness`}
          tabIndex={disabled() ? undefined : 0}
          aria-disabled={disabled() ? 'true' : undefined}
          class={`${prefixCls()}-saturation`}
          style={{ background: Color.fromHsb({ h: hsb().h, s: 100, b: 100, a: 1 }).toRgbString() }}
          onPointerDown={(event) => {
            const element = event.currentTarget

            startPointerDrag(event, (pointerEvent) => updateSaturation(element, pointerEvent))
          }}
          onKeyDown={handleSaturationKeyDown}
        >
          <div class={`${prefixCls()}-saturation-white`} />
          <div class={`${prefixCls()}-saturation-black`} />
          <span
            class={`${prefixCls()}-handler`}
            style={{ left: `${hsb().s}%`, top: `${100 - hsb().b}%` }}
          />
        </div>
        <div
          role="slider"
          aria-label="Hue"
          aria-valuemin="0"
          aria-valuemax="360"
          aria-valuenow={Math.round(hsb().h)}
          tabIndex={disabled() ? undefined : 0}
          aria-disabled={disabled() ? 'true' : undefined}
          class={`${prefixCls()}-slider ${prefixCls()}-hue`}
          onPointerDown={(event) => {
            const element = event.currentTarget

            startPointerDrag(event, (pointerEvent) => updateSlider(element, pointerEvent, 'h'))
          }}
          onKeyDown={handleHueKeyDown}
        >
          <span
            class={`${prefixCls()}-slider-handler`}
            style={{ left: `${(hsb().h / 360) * 100}%` }}
          />
        </div>
        <Show when={!local.disabledAlpha}>
          <div
            role="slider"
            aria-label="Alpha"
            aria-valuemin="0"
            aria-valuemax="1"
            aria-valuenow={Number(hsb().a.toFixed(2))}
            tabIndex={disabled() ? undefined : 0}
            aria-disabled={disabled() ? 'true' : undefined}
            class={`${prefixCls()}-slider ${prefixCls()}-alpha`}
            style={{ background: alphaBackground() }}
            onPointerDown={(event) => {
              const element = event.currentTarget

              startPointerDrag(event, (pointerEvent) => updateSlider(element, pointerEvent, 'a'))
            }}
            onKeyDown={handleAlphaKeyDown}
          >
            <span class={`${prefixCls()}-slider-handler`} style={{ left: `${hsb().a * 100}%` }} />
          </div>
        </Show>
        <div class={`${prefixCls()}-format-row`}>
          <select
            aria-label="Color format"
            class={`${prefixCls()}-format-select`}
            value={format()}
            disabled={disabled() || formatControlled() || Boolean(local.disabledFormat)}
            onChange={(event) => {
              if (disabled() || formatControlled() || local.disabledFormat) return

              const nextFormat = event.currentTarget.value as ColorPickerFormat

              if (nextFormat === format()) return

              setInnerFormat(nextFormat)
              local.onFormatChange?.(nextFormat)
            }}
          >
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsb">HSB</option>
          </select>
          {formatInputs()}
        </div>
      </>
    )
  }

  function renderPresets(): JSX.Element {
    return (
      <Show when={presetList().length > 0}>
        <div class={`${prefixCls()}-presets`}>
          <For each={presetList()}>
            {(preset) => (
              <div class={`${prefixCls()}-preset`}>
                <Show when={preset.label}>
                  <div class={`${prefixCls()}-preset-label`}>{preset.label}</div>
                </Show>
                <div class={`${prefixCls()}-preset-colors`}>
                  <For each={preset.colors}>
                    {(presetColor) => (
                      <button
                        type="button"
                        class={`${prefixCls()}-preset-color`}
                        aria-label={`Select preset color ${presetColorLabel(presetColor)}`}
                        title={presetColorLabel(presetColor)}
                        disabled={disabled()}
                        onClick={() => selectPreset(presetColor)}
                      >
                        <span
                          class={`${prefixCls()}-preset-color-inner`}
                          style={{ background: colorToCss(parseColor(presetColor)) }}
                        />
                      </button>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    )
  }

  function renderActions(): JSX.Element {
    return (
      <Show when={local.allowClear}>
        <div class={`${prefixCls()}-actions`}>
          <button
            type="button"
            class={`${prefixCls()}-clear`}
            disabled={disabled()}
            onClick={clearColor}
          >
            Clear color
          </button>
        </div>
      </Show>
    )
  }

  function renderPreview(): JSX.Element {
    return (
      <div class={`${prefixCls()}-preview`}>
        <span class={`${prefixCls()}-preview-color`} aria-hidden="true">
          <span
            class={`${prefixCls()}-preview-color-inner`}
            style={{ background: colorToCss(displayColor()) }}
          />
        </span>
        <span class={`${prefixCls()}-preview-text`}>
          {displayColor()?.toRgbString() ?? 'No color'}
        </span>
      </div>
    )
  }

  function renderPanel(): JSX.Element {
    return (
      <ColorPickerPanel
        prefixCls={prefixCls()}
        modeSwitcher={renderModeSwitcher()}
        gradientSlider={renderGradientSlider()}
        picker={renderPicker()}
        presets={renderPresets()}
        actions={renderActions()}
        preview={renderPreview()}
      />
    )
  }

  const renderedPanel = () =>
    local.panelRender?.(renderPanel(), {
      components: {
        Picker: renderPicker,
        Presets: renderPresets,
      },
    }) ?? renderPanel()
  const [hasInteractiveCustomChild, setHasInteractiveCustomChild] = createSignal(false)
  const interactiveChildSelector =
    'button, a[href], input, select, textarea, summary, [role="button"], [role="link"]'
  const triggerClass = () =>
    classNames(
      prefixCls(),
      size() === 'small' && `${prefixCls()}-sm`,
      size() === 'large' && `${prefixCls()}-lg`,
      disabled() && `${prefixCls()}-disabled`,
      hashId(),
      local.rootClass,
      semanticClassNames().root,
      local.class,
    )
  const handleTriggerClick = (event: MouseEvent): void => {
    if (disabled()) return
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
    if (event.defaultPrevented || local.trigger === 'hover') return
    setOpen(!open())
  }
  const handleTriggerKeyDown = (event: KeyboardEvent): void => {
    ;(local.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    if (event.defaultPrevented) return
    if (hasInteractiveCustomChild() && !isAriaRoleInteractiveElement(interactiveTriggerElement))
      return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    if (disabled() || local.trigger === 'hover') return
    setOpen(!open())
  }
  const customTriggerProps = rest as JSX.HTMLAttributes<HTMLSpanElement>
  const customTrigger = () => resolvedChildren()
  const isAriaRoleInteractiveElement = (element: HTMLElement | undefined): boolean => {
    const role = element?.getAttribute('role')

    return role === 'button' || role === 'link'
  }
  const syncInteractiveTriggerElement = (): void => {
    interactiveTriggerElement?.setAttribute('aria-haspopup', 'dialog')
    interactiveTriggerElement?.setAttribute('aria-expanded', open() ? 'true' : 'false')
    if (disabled()) {
      interactiveTriggerElement?.setAttribute('aria-disabled', 'true')
    } else {
      interactiveTriggerElement?.removeAttribute('aria-disabled')
    }
  }
  const updateInteractiveCustomChild = (): void => {
    const nextInteractiveTriggerElement =
      triggerRef?.querySelector<HTMLElement>(interactiveChildSelector) ?? undefined

    if (nextInteractiveTriggerElement !== interactiveTriggerElement) {
      interactiveTriggerElement = nextInteractiveTriggerElement
    }

    setHasInteractiveCustomChild(Boolean(interactiveTriggerElement))
    syncInteractiveTriggerElement()
  }
  const addCustomTriggerClickCapture = (element: HTMLElement): void => {
    customTriggerClickCaptureCleanup?.()

    const handleClickCapture = (event: MouseEvent) => {
      if (!disabled()) return

      event.preventDefault()
      event.stopPropagation()
    }

    element.addEventListener('click', handleClickCapture, { capture: true })
    customTriggerClickCaptureCleanup = () => {
      element.removeEventListener('click', handleClickCapture, { capture: true })
    }
  }

  createEffect(() => {
    customTrigger()
    open()
    disabled()
    updateInteractiveCustomChild()
  })

  return (
    <ZIndexContext.Provider value={contextZIndex}>
      <Show
        when={customTrigger()}
        fallback={
          <button
            {...rest}
            ref={(element) => {
              triggerRef = element
            }}
            type="button"
            class={triggerClass()}
            style={mergeStyle(semanticStyles().root, local.style)}
            disabled={disabled()}
            aria-label="Color Picker"
            aria-haspopup="dialog"
            aria-expanded={open() ? 'true' : 'false'}
            aria-disabled={disabled() ? 'true' : undefined}
            onClick={handleTriggerClick}
            onKeyDown={(event) => {
              ;(local.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event)
            }}
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}
          >
            <span class={`${prefixCls()}-color-block`} aria-hidden="true">
              <span
                class={`${prefixCls()}-color-block-inner`}
                style={{ background: colorToCss(mergedColor()) }}
              />
            </span>
            {local.showText && (
              <span class={`${prefixCls()}-text`}>{renderText(local.showText, mergedColor())}</span>
            )}
          </button>
        }
      >
        <span
          {...customTriggerProps}
          ref={(element) => {
            triggerRef = element
            addCustomTriggerClickCapture(element)
            updateInteractiveCustomChild()
          }}
          role={hasInteractiveCustomChild() ? undefined : 'button'}
          class={triggerClass()}
          style={mergeStyle(semanticStyles().root, local.style)}
          tabIndex={hasInteractiveCustomChild() || disabled() ? undefined : 0}
          aria-label={customTriggerProps['aria-label']}
          aria-haspopup="dialog"
          aria-expanded={open() ? 'true' : 'false'}
          aria-disabled={disabled() ? 'true' : undefined}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          onMouseEnter={handleHoverEnter}
          onMouseLeave={handleHoverLeave}
        >
          {customTrigger()}
        </span>
      </Show>
      <Show when={shouldRenderPopup()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(triggerRef) ?? config.getPopupContainer?.(triggerRef)
          }
        >
          <div
            ref={(element) => {
              popupRef = element
            }}
            role="dialog"
            aria-label="Color Picker Panel"
            aria-hidden={popupVisible() ? undefined : 'true'}
            class={classNames(
              `${prefixCls()}-popup`,
              `${prefixCls()}-${adjustedPlacement()}`,
              !popupVisible() && `${prefixCls()}-popup-hidden`,
              showArrow(local.arrow) && `${prefixCls()}-with-arrow`,
              pointAtCenter(local.arrow) && `${prefixCls()}-arrow-point-at-center`,
              hashId(),
              local.popupClass,
              semanticClassNames().popup?.root,
            )}
            style={mergeStyle(
              position(),
              { 'z-index': zIndex },
              semanticStyles().popup?.root,
              local.popupStyle,
            )}
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}
          >
            <Show when={showArrow(local.arrow)}>
              <div class={`${prefixCls()}-arrow`} />
            </Show>
            <div
              class={classNames(
                `${prefixCls()}-popup-inner`,
                semanticClassNames().popupOverlayInner,
              )}
              style={semanticStyles().popupOverlayInner}
            >
              {renderedPanel()}
            </div>
          </div>
        </InternalPortal>
      </Show>
    </ZIndexContext.Provider>
  )
}
