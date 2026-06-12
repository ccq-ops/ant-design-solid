import { Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import { DownOutlined, MinusOutlined, PlusOutlined, UpOutlined } from '@ant-design-solid/icons'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import type {
  InputNumberChangeValue,
  InputNumberFocusOptions,
  InputNumberProps,
  InputNumberRef,
  InputNumberSemanticClassNames,
  InputNumberSemanticStyles,
  InputNumberStepEmitter,
} from './interface'
import { useInputNumberStyle } from './input-number.style'

const MAX_PRECISION = 20

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function clamp(value: number, min: number | undefined, max: number | undefined): number {
  let next = value
  if (min !== undefined) next = Math.max(min, next)
  if (max !== undefined) next = Math.min(max, next)
  return next
}

function normalizePrecision(precision: number | undefined): number | undefined {
  if (precision === undefined || !Number.isSafeInteger(precision) || precision < 0) return undefined
  return Math.min(precision, MAX_PRECISION)
}

function roundByPrecision(value: number, precision: number | undefined): number {
  const normalizedPrecision = normalizePrecision(precision)
  if (normalizedPrecision === undefined) return value
  const factor = 10 ** normalizedPrecision
  return Math.round(value * factor) / factor
}

function countDecimalPlaces(value: number | string | undefined): number {
  if (value === undefined) return 0
  const [, decimal = ''] = String(value).toLowerCase().split(/[.e]/)
  return decimal.replace(/^-/, '').length
}

function addByStep(value: number, step: number): number {
  const precision = Math.max(countDecimalPlaces(value), countDecimalPlaces(step))
  const factor = 10 ** Math.min(precision, MAX_PRECISION)
  return (Math.round(value * factor) + Math.round(step * factor)) / factor
}

function defaultParser(displayValue: string, decimalSeparator: string | undefined): number | null {
  const normalized = decimalSeparator ? displayValue.replace(decimalSeparator, '.') : displayValue
  if (normalized.trim() === '') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function applyDecimalSeparator(value: string, decimalSeparator: string | undefined): string {
  if (!decimalSeparator || decimalSeparator === '.') return value
  return value.replace('.', decimalSeparator)
}

function toNumber(value: InputNumberChangeValue): number | undefined {
  if (value === null) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toOutputValue(value: number | undefined, stringMode: boolean): InputNumberChangeValue {
  if (value === undefined) return null
  return stringMode ? String(value) : value
}

function mergeStyles(...values: Array<JSX.CSSProperties | string | undefined>) {
  return Object.assign({}, ...values.filter((value) => value && typeof value !== 'string'))
}

function assignRef(ref: InputNumberProps['ref'], value: InputNumberRef) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  if (!('focus' in ref)) ref.current = value
  Object.assign(ref as object, value)
}

export function InputNumber(props: InputNumberProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'min',
    'max',
    'step',
    'precision',
    'placeholder',
    'disabled',
    'readOnly',
    'size',
    'status',
    'controls',
    'formatter',
    'parser',
    'onChange',
    'onInput',
    'onBlur',
    'onFocus',
    'onKeyDown',
    'onPressEnter',
    'onWheel',
    'onStep',
    'ref',
    'class',
    'style',
    'keyboard',
    'changeOnBlur',
    'changeOnWheel',
    'prefix',
    'suffix',
    'variant',
    'mode',
    'stringMode',
    'decimalSeparator',
    'classNames',
    'styles',
    'rootClassName',
    'prefixCls',
    'addonBefore',
    'addonAfter',
    'bordered',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-input-number`
  const [, hashId] = useInputNumberStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<InputNumberChangeValue>(
    local.defaultValue ?? null,
  )
  const [draftValue, setDraftValue] = createSignal<InputNumberChangeValue | undefined>()
  const [displayValue, setDisplayValue] = createSignal('')
  const [focused, setFocused] = createSignal(false)
  let rootRef: HTMLSpanElement | undefined
  let inputRef: HTMLInputElement | undefined
  const controls = () => local.controls !== false && !local.readOnly
  const disabled = () => Boolean(local.disabled)
  const readOnly = () => Boolean(local.readOnly)
  const size = () => local.size ?? config.componentSize()
  const variant = () => local.variant ?? (local.bordered === false ? 'borderless' : 'outlined')
  const keyboard = () => local.keyboard !== false
  const changeOnBlur = () => local.changeOnBlur !== false
  const stringMode = () => Boolean(local.stringMode)
  const isValueControlled = () => 'value' in props
  const isFormOwned = () => formItem?.valuePropName() === 'value'
  const isFormBlurTrigger = () => isFormOwned() && formItem?.trigger() === 'onBlur'
  const isSourceControlled = () => isValueControlled() || isFormOwned()
  const step = () => {
    const parsed = Number(local.step)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }

  const sourceValue = createMemo<InputNumberChangeValue>(() => {
    if (isFormOwned()) return (formItem?.value() as InputNumberChangeValue | undefined) ?? null
    if (isValueControlled()) return local.value ?? null
    return innerValue()
  })

  const mergedValue = createMemo<InputNumberChangeValue>(() => {
    if (isFormBlurTrigger()) return draftValue() !== undefined ? draftValue()! : sourceValue()
    return sourceValue()
  })

  const semanticProps = (): InputNumberProps => ({
    ...props,
    value: sourceValue(),
    size: size(),
    variant: variant(),
  })
  const semanticClassNames = createMemo<InputNumberSemanticClassNames>(() =>
    typeof local.classNames === 'function'
      ? local.classNames({ props: semanticProps() })
      : (local.classNames ?? {}),
  )
  const semanticStyles = createMemo<InputNumberSemanticStyles>(() =>
    typeof local.styles === 'function'
      ? local.styles({ props: semanticProps() })
      : (local.styles ?? {}),
  )

  function formatValue(value: InputNumberChangeValue, userTyping = false, input?: string): string {
    const displayInput = input ?? (value === null ? '' : String(value))
    if (local.formatter) return local.formatter(value, { userTyping, input: displayInput })
    return value === null ? '' : applyDecimalSeparator(String(value), local.decimalSeparator)
  }

  createEffect(() => {
    sourceValue()
    if (isFormBlurTrigger()) setDraftValue(undefined)
  })

  createEffect(() => {
    if (!focused()) setDisplayValue(formatValue(mergedValue()))
  })

  function parseDisplay(value: string): InputNumberChangeValue {
    return local.parser ? local.parser(value) : defaultParser(value, local.decimalSeparator)
  }

  function normalize(value: InputNumberChangeValue): InputNumberChangeValue {
    const numeric = toNumber(value)
    if (!isFiniteNumber(numeric)) return null
    return toOutputValue(
      roundByPrecision(clamp(numeric, local.min, local.max), local.precision),
      stringMode(),
    )
  }

  function syncDisplayToSource(): void {
    setDisplayValue(formatValue(mergedValue()))
  }

  function commitValue(
    nextValue: InputNumberChangeValue,
    trigger: 'onChange' | 'onBlur',
  ): InputNumberChangeValue {
    const normalized = normalize(nextValue)
    if (isFormBlurTrigger()) setDraftValue(normalized)
    else if (!isSourceControlled()) setInnerValue(normalized)
    local.onChange?.(normalized)
    if (
      formItem?.valuePropName() === 'value' &&
      (formItem.trigger() === 'onChange' || formItem.trigger() === trigger)
    )
      formItem.setFieldValueFromControl(normalized)
    syncDisplayToSource()
    return normalized
  }

  function stepValue(direction: 1 | -1, emitter: InputNumberStepEmitter): void {
    if (disabled() || readOnly()) return
    const base = toNumber(mergedValue()) ?? 0
    const offset = step() * direction
    const normalized = commitValue(addByStep(base, offset), 'onChange')
    local.onStep?.(normalized, {
      offset: stringMode() ? String(offset) : offset,
      type: direction > 0 ? 'up' : 'down',
      emitter,
    })
  }

  function renderUpIcon() {
    if (typeof local.controls === 'object' && local.controls.upIcon) return local.controls.upIcon
    return local.mode === 'spinner' ? <PlusOutlined /> : <UpOutlined />
  }

  function renderDownIcon() {
    if (typeof local.controls === 'object' && local.controls.downIcon)
      return local.controls.downIcon
    return local.mode === 'spinner' ? <MinusOutlined /> : <DownOutlined />
  }

  function commitInputValue(input: string, trigger: 'onChange' | 'onBlur'): void {
    commitValue(parseDisplay(input), trigger)
  }

  function focus(options?: InputNumberFocusOptions): void {
    inputRef?.focus({ preventScroll: options?.preventScroll })
    if (!inputRef || !options?.cursor) return
    const length = inputRef.value.length
    if (options.cursor === 'start') inputRef.setSelectionRange(0, 0)
    if (options.cursor === 'end') inputRef.setSelectionRange(length, length)
    if (options.cursor === 'all') inputRef.setSelectionRange(0, length)
  }

  const inputNumberRef: InputNumberRef = {
    focus,
    blur: () => inputRef?.blur(),
    get nativeElement() {
      return rootRef
    },
  }
  assignRef(local.ref, inputNumberRef)

  const inputNumberNode = () => (
    <span
      ref={(el) => {
        rootRef = el
      }}
      class={classNames(
        prefixCls(),
        focused() && `${prefixCls()}-focused`,
        disabled() && `${prefixCls()}-disabled`,
        readOnly() && `${prefixCls()}-readonly`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.status && `${prefixCls()}-status-${local.status}`,
        `${prefixCls()}-variant-${variant()}`,
        !controls() && `${prefixCls()}-without-controls`,
        local.mode === 'spinner' && `${prefixCls()}-mode-spinner`,
        hashId(),
        local.rootClassName,
        local.class,
        semanticClassNames().root,
      )}
      style={mergeStyles(semanticStyles().root, local.style as JSX.CSSProperties | undefined)}
    >
      <Show when={local.prefix}>
        <span
          class={classNames(`${prefixCls()}-prefix`, semanticClassNames().prefix)}
          style={semanticStyles().prefix}
        >
          {local.prefix}
        </span>
      </Show>
      <input
        {...rest}
        ref={(el) => {
          inputRef = el
        }}
        role="spinbutton"
        type="text"
        class={classNames(`${prefixCls()}-input`, semanticClassNames().input)}
        style={semanticStyles().input}
        value={displayValue()}
        placeholder={local.placeholder}
        disabled={disabled()}
        readOnly={readOnly()}
        aria-disabled={disabled() ? 'true' : undefined}
        aria-valuemin={local.min}
        aria-valuemax={local.max}
        aria-valuenow={toNumber(mergedValue())}
        onInput={(event) => {
          if (disabled() || readOnly()) {
            event.currentTarget.value = displayValue()
            return
          }
          const input = event.currentTarget.value
          setDisplayValue(local.formatter ? formatValue(parseDisplay(input), true, input) : input)
          if (!changeOnBlur()) commitInputValue(input, 'onChange')
          local.onInput?.(input)
        }}
        onFocus={(event) => {
          setFocused(true)
          ;(local.onFocus as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          if (!disabled() && !readOnly() && changeOnBlur())
            commitInputValue(event.currentTarget.value, 'onBlur')
          else syncDisplayToSource()
          ;(local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
        }}
        onWheel={(event) => {
          ;(local.onWheel as JSX.EventHandler<HTMLInputElement, WheelEvent> | undefined)?.(event)
          if (event.defaultPrevented || !local.changeOnWheel || disabled() || readOnly()) return
          event.preventDefault()
          stepValue(event.deltaY < 0 ? 1 : -1, 'wheel')
        }}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined)?.(
            event,
          )
          if (event.key === 'Enter' && !event.defaultPrevented) {
            ;(
              local.onPressEnter as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined
            )?.(event)
          }
          if (event.defaultPrevented || disabled() || readOnly() || !keyboard()) return
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            stepValue(1, 'keydown')
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            stepValue(-1, 'keydown')
          }
        }}
      />
      <Show when={local.suffix}>
        <span
          class={classNames(`${prefixCls()}-suffix`, semanticClassNames().suffix)}
          style={semanticStyles().suffix}
        >
          {local.suffix}
        </span>
      </Show>
      <Show when={controls()}>
        <span
          class={classNames(`${prefixCls()}-controls`, semanticClassNames().actions)}
          style={semanticStyles().actions}
          aria-disabled={disabled() ? 'true' : undefined}
        >
          <button
            type="button"
            aria-label="increase value"
            class={classNames(`${prefixCls()}-handler`, `${prefixCls()}-handler-up`)}
            disabled={disabled()}
            onClick={() => stepValue(1, 'handler')}
          >
            {renderUpIcon()}
          </button>
          <button
            type="button"
            aria-label="decrease value"
            class={classNames(`${prefixCls()}-handler`, `${prefixCls()}-handler-down`)}
            disabled={disabled()}
            onClick={() => stepValue(-1, 'handler')}
          >
            {renderDownIcon()}
          </button>
        </span>
      </Show>
    </span>
  )

  return (
    <Show when={local.addonBefore || local.addonAfter} fallback={inputNumberNode()}>
      <span class={classNames(`${prefixCls()}-group-wrapper`, hashId())}>
        <Show when={local.addonBefore}>
          <span class={`${prefixCls()}-group-addon`}>{local.addonBefore}</span>
        </Show>
        {inputNumberNode()}
        <Show when={local.addonAfter}>
          <span class={`${prefixCls()}-group-addon`}>{local.addonAfter}</span>
        </Show>
      </span>
    </Show>
  )
}
