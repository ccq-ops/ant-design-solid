import { createEffect, createMemo, createSignal, on, onCleanup, Show, untrack } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import {
  FormItemContext,
  FormItemStatusContext,
  useFormContext,
  useFormLayoutContext,
  useFormListPrefix,
} from './context'
import { composeNamePath } from './name-path'
import type {
  FieldMeta,
  FieldName,
  FieldValue,
  FormItemControl,
  FormItemProps,
  Rule,
  ValidateStatus,
} from './interface'
import type { JSX } from 'solid-js'

function hasUsableEventValue(
  target: unknown,
  valuePropName: string,
): target is Record<string, unknown> {
  return Boolean(
    target &&
    typeof target === 'object' &&
    (valuePropName === 'checked' ? 'checked' in target : 'value' in target),
  )
}

export function getValueFromControl(valuePropName: string, nextOrEvent: FieldValue): FieldValue {
  if (nextOrEvent && typeof nextOrEvent === 'object') {
    const event = nextOrEvent as { currentTarget?: unknown; target?: unknown }
    if (hasUsableEventValue(event.currentTarget, valuePropName)) {
      return valuePropName === 'checked' ? event.currentTarget.checked : event.currentTarget.value
    }
    if (hasUsableEventValue(event.target, valuePropName)) {
      return valuePropName === 'checked' ? event.target.checked : event.target.value
    }
  }
  return nextOrEvent
}

function isRenderProp(
  children: FormItemProps['children'],
): children is (control: FormItemControl) => JSX.Element {
  return typeof children === 'function'
}

function isRequiredRule(rule: Rule, form: ReturnType<typeof useFormContext>): boolean {
  if (typeof rule !== 'function') return rule.required === true
  return form ? rule(form).required === true : false
}

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function matchesTrigger(
  triggerName: string,
  validateTrigger: string | string[] | undefined,
): boolean {
  return toArray(validateTrigger).includes(triggerName)
}

function noopCatch(error: unknown): void {
  if (error && typeof error === 'object') return
}

function serializeLayoutValue(value: unknown): string | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function FormItem(props: FormItemProps) {
  const form = useFormContext()
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-form`
  const layout = useFormLayoutContext()
  const valuePropName = () => props.valuePropName ?? 'value'
  const listPrefix = useFormListPrefix()
  const fieldName = (): FieldName | undefined =>
    props.name === undefined ? undefined : composeNamePath(listPrefix, props.name)
  const trigger = () => props.trigger ?? 'onChange'
  const validateTrigger = () => props.validateTrigger ?? layout.validateTrigger() ?? trigger()
  const rules = () =>
    props.required ? [{ required: true }, ...(props.rules ?? [])] : (props.rules ?? [])
  const errors = () => {
    const name = fieldName()
    return name !== undefined && form ? form.getFieldErrorAccessor(name)() : []
  }
  const isRequired = () =>
    props.required === true || rules().some((rule) => isRequiredRule(rule, form))
  const showOptionalMark = () => layout.requiredMark() === 'optional' && !isRequired()
  const mergedLabelAlign = () => props.labelAlign ?? layout.labelAlign()
  const mergedColon = () => props.colon ?? layout.colon()
  const labelCol = () => serializeLayoutValue(props.labelCol ?? layout.labelCol())
  const wrapperCol = () => serializeLayoutValue(props.wrapperCol ?? layout.wrapperCol())

  const warnings = () => {
    const name = fieldName()
    return name !== undefined && form ? (form.getFieldWarningAccessor?.(name)() ?? []) : []
  }
  const validating = () => {
    const name = fieldName()
    return name !== undefined && form ? (form.getFieldValidatingAccessor?.(name)() ?? false) : false
  }
  const mergedStatus = (): ValidateStatus | undefined => {
    if (props.validateStatus) return props.validateStatus
    if (validating()) return 'validating'
    if (errors().length > 0) return 'error'
    if (warnings().length > 0) return 'warning'
    return undefined
  }

  let unregisterField: (() => void) | undefined
  let registeredMeta: FieldMeta | undefined
  createEffect(
    on(
      fieldName,
      () => {
        unregisterField?.()
        unregisterField = undefined
        registeredMeta = undefined
        const name = fieldName()
        if (name === undefined || !form) return
        registeredMeta = {
          name,
          rules: rules(),
          initialValue: props.initialValue,
          preserve: props.preserve,
          dependencies: props.dependencies,
          validateTrigger: validateTrigger(),
          validateFirst: props.validateFirst,
        }
        unregisterField = untrack(() => form.registerField(registeredMeta as FieldMeta))
      },
      { defer: false },
    ),
  )
  createEffect(() => {
    const name = fieldName()
    const nextRules = rules()
    if (name === undefined || !registeredMeta) return
    registeredMeta.name = name
    registeredMeta.rules = nextRules
    registeredMeta.initialValue = props.initialValue
    registeredMeta.preserve = props.preserve
    registeredMeta.dependencies = props.dependencies
    registeredMeta.validateTrigger = validateTrigger()
    registeredMeta.validateFirst = props.validateFirst
  })
  onCleanup(() => unregisterField?.())

  const getControlValue = (args: unknown[]): FieldValue => {
    // Programmatic FormItemControl callbacks currently pass one value/event plus an optional
    // source trigger. Native child components should call the dedicated validate() API for
    // validation-only triggers so getValueFromEvent is not invoked with trigger metadata.
    if (props.getValueFromEvent) return props.getValueFromEvent(...args)
    return getValueFromControl(valuePropName(), args[0])
  }

  let validateDebounceTimer: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => {
    if (validateDebounceTimer) clearTimeout(validateDebounceTimer)
  })

  const validateCurrentField = () => {
    const name = fieldName()
    if (name === undefined || !form) return
    if (props.validateDebounce && props.validateDebounce > 0) {
      if (validateDebounceTimer) clearTimeout(validateDebounceTimer)
      validateDebounceTimer = setTimeout(() => {
        void form.validateFields([name]).catch(noopCatch)
      }, props.validateDebounce)
      return
    }
    void form.validateFields([name]).catch(noopCatch)
  }

  const validate = (sourceTrigger = trigger()) => {
    if (matchesTrigger(sourceTrigger, validateTrigger())) validateCurrentField()
  }

  const setFieldValueFromControl = (nextOrEvent: unknown, sourceTrigger = trigger()) => {
    const name = fieldName()
    if (name === undefined || !form) return
    const previousValue = form.getFieldValue(name)
    let nextValue = getControlValue([nextOrEvent])
    if (props.normalize)
      nextValue = props.normalize(nextValue, previousValue, form.getFieldsValue(true))
    form.setFieldValue(name, nextValue)
    validate(sourceTrigger)
  }

  const valueProps = (): Record<string, unknown> => {
    const name = fieldName()
    if (name === undefined || !form) return {}
    const value = form.getFieldValue(name)
    if (props.getValueProps) return props.getValueProps(value)
    return { [valuePropName()]: value }
  }

  const control = createMemo<FormItemControl | undefined>(() => {
    const name = fieldName()
    if (name === undefined || !form) return undefined
    return {
      name,
      value: () => form.getFieldValue(name),
      valueProps,
      valuePropName,
      trigger,
      validateTrigger,
      onChange: (nextOrEvent) => setFieldValueFromControl(nextOrEvent, trigger()),
      setFieldValueFromControl,
      validate,
      errors,
      status: mergedStatus,
    }
  })

  const statusContext = createMemo(() => ({
    status: mergedStatus,
    errors,
    warnings,
  }))

  const [renderVersion, setRenderVersion] = createSignal(0)
  const shouldUpdate = () => props.shouldUpdate
  const unsubscribeShouldUpdate = form?.subscribe((previousValues) => {
    const updater = shouldUpdate()
    if (!updater) return
    const nextValues = form.getFieldsValue(true)
    const previous = previousValues ?? nextValues
    const shouldRender = updater === true ? true : updater(previous, nextValues)
    if (shouldRender) setRenderVersion((version) => version + 1)
  })
  onCleanup(() => unsubscribeShouldUpdate?.())

  const content = () => {
    renderVersion()
    const itemControl = control()
    if (isRenderProp(props.children)) return props.children(itemControl as FormItemControl)
    return props.children as JSX.Element
  }

  const validateOnBlur = () => {
    if (matchesTrigger('onBlur', validateTrigger())) validateCurrentField()
  }

  const providers = () => (
    <FormItemStatusContext.Provider value={statusContext()}>
      <FormItemContext.Provider value={control()}>{content()}</FormItemContext.Provider>
    </FormItemStatusContext.Provider>
  )

  let itemElement: HTMLDivElement | undefined
  let unregisterFieldInstance: (() => void) | undefined
  createEffect(() => {
    unregisterFieldInstance?.()
    unregisterFieldInstance = undefined
    const name = fieldName()
    if (name !== undefined && itemElement) {
      unregisterFieldInstance = form?.registerFieldInstance?.(name, itemElement)
    }
  })
  onCleanup(() => unregisterFieldInstance?.())

  if (props.noStyle) return providers()

  return (
    <div
      ref={(element) => {
        itemElement = element
      }}
      class={classNames(
        `${prefixCls()}-item`,
        `${prefixCls()}-item-label-${mergedLabelAlign()}`,
        mergedStatus() && `${prefixCls()}-item-has-${mergedStatus()}`,
        props.hidden && `${prefixCls()}-item-hidden`,
      )}
      style={props.hidden ? { display: 'none' } : undefined}
      onFocusOut={validateOnBlur}
    >
      <Show when={props.label}>
        <label
          data-label-col={labelCol()}
          class={classNames(
            `${prefixCls()}-item-label`,
            `${prefixCls()}-item-label-${mergedLabelAlign()}`,
            mergedColon() && `${prefixCls()}-item-label-colon`,
            isRequired() && `${prefixCls()}-item-required`,
            layout.requiredMark() === false && `${prefixCls()}-item-required-mark-hidden`,
            layout.requiredMark() === 'optional' && `${prefixCls()}-item-required-mark-optional`,
          )}
        >
          <span class={`${prefixCls()}-item-label-content`}>{props.label}</span>
          <Show when={props.tooltip}>
            <span class={`${prefixCls()}-item-tooltip`}>{props.tooltip}</span>
          </Show>
          <Show when={showOptionalMark()}>
            <span class={`${prefixCls()}-item-optional`}>(optional)</span>
          </Show>
        </label>
      </Show>
      <div class={`${prefixCls()}-item-control`} data-wrapper-col={wrapperCol()}>
        {providers()}
        <Show when={props.help ?? errors()[0] ?? warnings()[0]}>
          <div
            class={classNames(
              `${prefixCls()}-item-explain`,
              mergedStatus() === 'error' && `${prefixCls()}-item-explain-error`,
              mergedStatus() === 'warning' && `${prefixCls()}-item-explain-warning`,
            )}
          >
            {props.help ?? errors()[0] ?? warnings()[0]}
          </div>
        </Show>
        <Show when={props.extra}>
          <div class={`${prefixCls()}-item-extra`}>{props.extra}</div>
        </Show>
      </div>
    </div>
  )
}
