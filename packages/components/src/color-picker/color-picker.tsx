import { Show, createRenderEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import { getDropdownPosition, type OverlayPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { Color, clamp, colorToCss, normalizeHsb, parseColor } from './color'
import type { HsbColor } from './color'
import { useColorPickerStyle } from './color-picker.style'
import type { ColorPickerProps } from './interface'
import type { ColorPickerFormat } from './interface'

function emptyPosition(): OverlayPosition {
  return { top: '0px', left: '0px' }
}

function renderText(showText: ColorPickerProps['showText'], color: Color | undefined): JSX.Element {
  if (typeof showText === 'function') return showText(color)
  if (showText) return color?.toHexString() ?? ''
  return undefined
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
    'placement',
    'trigger',
    'format',
    'defaultFormat',
    'disabledAlpha',
    'allowClear',
    'showText',
    'presets',
    'panelRender',
    'popupClass',
    'popupStyle',
    'class',
    'style',
    'onClick',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-color-picker`
  const [, hashId] = useColorPickerStyle(prefixCls())
  const initialColor = parseColor(local.defaultValue)
  const [innerColor, setInnerColor] = createSignal(initialColor)
  const [innerHsb, setInnerHsb] = createSignal(
    initialColor?.toHsb() ?? { h: 0, s: 0, b: 100, a: 1 },
  )
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [innerFormat, setInnerFormat] = createSignal<ColorPickerFormat>(
    local.defaultFormat ?? 'hex',
  )
  const [position, setPosition] = createSignal<OverlayPosition>(emptyPosition())
  const valueControlled = () => 'value' in props
  const openControlled = () => 'open' in props
  const formatControlled = () => 'format' in props
  let triggerRef: HTMLButtonElement | undefined
  let popupRef: HTMLDivElement | undefined
  let activeDragCleanup: (() => void) | undefined

  const size = () => local.size ?? config.componentSize()
  const disabled = () => Boolean(local.disabled)
  const mergedColor = () => (valueControlled() ? parseColor(local.value) : innerColor())
  const mergedHsb = () =>
    (valueControlled() ? mergedColor()?.toHsb() : innerHsb()) ?? { h: 0, s: 0, b: 100, a: 1 }
  const open = () => (openControlled() ? Boolean(local.open) : innerOpen())
  const format = () => local.format ?? innerFormat()
  const placement = () => local.placement ?? 'bottomLeft'

  function updatePosition(element = triggerRef): void {
    if (!canUseDom() || !element) return
    setPosition(getDropdownPosition(element.getBoundingClientRect(), placement(), 4))
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled() && nextOpen) return
    if (nextOpen) updatePosition()
    if (!openControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
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
    if (open()) updatePosition()
  })

  onCleanup(() => {
    removeKeydown()
    removePointerDown()
    activeDragCleanup?.()
    activeDragCleanup = undefined
  })

  function emitColor(nextHsb: HsbColor): Color {
    const nextColor = Color.fromHsb(normalizeHsb(nextHsb))

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

  function parseInputNumber(value: string): number | undefined {
    if (value.trim() === '') return undefined

    const numberValue = Number(value)

    return Number.isFinite(numberValue) ? numberValue : undefined
  }

  function commitParsedInput(value: string): void {
    const nextColor = parseColor(value)

    if (!nextColor) return

    emitColor(nextColor.toHsb())
  }

  function commitRgbInputs(red: string, green: string, blue: string): void {
    const r = parseInputNumber(red)
    const g = parseInputNumber(green)
    const b = parseInputNumber(blue)

    if (r === undefined || g === undefined || b === undefined) return

    emitColor(Color.fromRgb({ r, g, b, a: mergedColor()?.toRgb().a ?? 1 }).toHsb())
  }

  function commitHsbInputs(hue: string, saturation: string, brightness: string): void {
    const h = parseInputNumber(hue)
    const s = parseInputNumber(saturation)
    const b = parseInputNumber(brightness)

    if (h === undefined || s === undefined || b === undefined) return

    emitColor(Color.fromHsb({ h, s, b, a: mergedHsb().a }).toHsb())
  }

  function handleInputKeyDown(event: KeyboardEvent, commit: () => void): void {
    if (event.key !== 'Enter') return

    commit()
  }

  function formatInputs(): JSX.Element {
    const currentFormat = format()
    const color = mergedColor()
    const rgb = color?.toRgb() ?? { r: 0, g: 0, b: 0, a: 1 }
    const hsb = mergedHsb()

    if (currentFormat === 'rgb') {
      let redRef: HTMLInputElement | undefined
      let greenRef: HTMLInputElement | undefined
      let blueRef: HTMLInputElement | undefined
      const commit = () =>
        commitRgbInputs(redRef?.value ?? '', greenRef?.value ?? '', blueRef?.value ?? '')

      return (
        <div class={`${prefixCls()}-inputs ${prefixCls()}-inputs-rgb`}>
          <input
            ref={(element) => {
              redRef = element
            }}
            aria-label="Red"
            class={`${prefixCls()}-input`}
            value={String(rgb.r)}
            onBlur={commit}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
          <input
            ref={(element) => {
              greenRef = element
            }}
            aria-label="Green"
            class={`${prefixCls()}-input`}
            value={String(rgb.g)}
            onBlur={commit}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
          <input
            ref={(element) => {
              blueRef = element
            }}
            aria-label="Blue"
            class={`${prefixCls()}-input`}
            value={String(rgb.b)}
            onBlur={commit}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
        </div>
      )
    }

    if (currentFormat === 'hsb') {
      let hueRef: HTMLInputElement | undefined
      let saturationRef: HTMLInputElement | undefined
      let brightnessRef: HTMLInputElement | undefined
      const commit = () =>
        commitHsbInputs(hueRef?.value ?? '', saturationRef?.value ?? '', brightnessRef?.value ?? '')

      return (
        <div class={`${prefixCls()}-inputs ${prefixCls()}-inputs-hsb`}>
          <input
            ref={(element) => {
              hueRef = element
            }}
            aria-label="H"
            class={`${prefixCls()}-input`}
            value={String(hsb.h)}
            onBlur={commit}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
          <input
            ref={(element) => {
              saturationRef = element
            }}
            aria-label="S"
            class={`${prefixCls()}-input`}
            value={String(hsb.s)}
            onBlur={commit}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
          <input
            ref={(element) => {
              brightnessRef = element
            }}
            aria-label="B"
            class={`${prefixCls()}-input`}
            value={String(hsb.b)}
            onBlur={commit}
            onKeyDown={(event) => handleInputKeyDown(event, commit)}
          />
        </div>
      )
    }

    let hexRef: HTMLInputElement | undefined
    const commit = () => commitParsedInput(hexRef?.value ?? '')

    return (
      <div class={`${prefixCls()}-inputs ${prefixCls()}-inputs-hex`}>
        <input
          ref={(element) => {
            hexRef = element
          }}
          aria-label="Hex"
          class={`${prefixCls()}-input`}
          value={color?.toHexString() ?? ''}
          onBlur={commit}
          onKeyDown={(event) => handleInputKeyDown(event, commit)}
        />
      </div>
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

  function renderPanel(): JSX.Element {
    const hsb = mergedHsb
    const alphaBackground = () =>
      `linear-gradient(to right, rgba(255, 255, 255, 0), ${Color.fromHsb({ ...hsb(), a: 1 }).toRgbString()})`

    return (
      <div class={`${prefixCls()}-panel`}>
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
          >
            <span class={`${prefixCls()}-slider-handler`} style={{ left: `${hsb().a * 100}%` }} />
          </div>
        </Show>
        <div class={`${prefixCls()}-format-row`}>
          <select
            aria-label="Color format"
            class={`${prefixCls()}-format-select`}
            value={format()}
            disabled={formatControlled()}
            onChange={(event) => {
              if (!formatControlled())
                setInnerFormat(event.currentTarget.value as ColorPickerFormat)
            }}
          >
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsb">HSB</option>
          </select>
          {formatInputs()}
        </div>
        <div class={`${prefixCls()}-preview`}>
          <span class={`${prefixCls()}-preview-color`} aria-hidden="true">
            <span
              class={`${prefixCls()}-preview-color-inner`}
              style={{ background: colorToCss(mergedColor()) }}
            />
          </span>
          <span class={`${prefixCls()}-preview-text`}>
            {mergedColor()?.toRgbString() ?? 'No color'}
          </span>
        </div>
      </div>
    )
  }

  const renderedPanel = () =>
    local.panelRender?.(renderPanel(), { components: { picker: renderPanel() } }) ?? renderPanel()

  return (
    <>
      <button
        {...rest}
        ref={(element) => {
          triggerRef = element
        }}
        type="button"
        class={classNames(
          prefixCls(),
          size() === 'small' && `${prefixCls()}-sm`,
          size() === 'large' && `${prefixCls()}-lg`,
          disabled() && `${prefixCls()}-disabled`,
          hashId(),
          local.class,
        )}
        style={local.style}
        disabled={disabled()}
        aria-label="Color Picker"
        aria-haspopup="dialog"
        aria-expanded={open() ? 'true' : 'false'}
        aria-disabled={disabled() ? 'true' : undefined}
        onClick={(event) => {
          ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
          if (event.defaultPrevented || local.trigger === 'hover') return
          setOpen(!open())
        }}
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
      <Show when={open()}>
        <InternalPortal>
          <div
            ref={(element) => {
              popupRef = element
            }}
            role="dialog"
            aria-label="Color Picker Panel"
            class={classNames(
              `${prefixCls()}-popup`,
              `${prefixCls()}-${placement()}`,
              hashId(),
              local.popupClass,
            )}
            style={{ ...position(), ...local.popupStyle }}
          >
            {renderedPanel()}
          </div>
        </InternalPortal>
      </Show>
    </>
  )
}
