import { createEffect, createMemo, createSignal, on, onCleanup, Show, untrack } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { FormItemContext, FormItemStatusContext, useFormContext } from './context'
import type { FieldValue, FormItemControl, FormItemProps, Rule, ValidateStatus } from './interface'
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

function isRequiredRule(rule: Rule): boolean {
  return typeof rule !== 'function' && rule.required === true
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

export function FormItem(props: FormItemProps) {
  const form = useFormContext()
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-form`
  const valuePropName = () => props.valuePropName ?? 'value'
  const trigger = () => props.trigger ?? 'onChange'
  const validateTrigger = () => props.validateTrigger ?? trigger()
  const rules = () =>
    props.required ? [{ required: true }, ...(props.rules ?? [])] : (props.rules ?? [])
  const errors = () =>
    props.name !== undefined && form ? form.getFieldErrorAccessor(props.name)() : []
  const warnings = () =>
    props.name !== undefined && form ? (form.getFieldWarningAccessor?.(props.name)() ?? []) : []
  const validating = () =>
    props.name !== undefined && form
      ? (form.getFieldValidatingAccessor?.(props.name)() ?? false)
      : false
  const mergedStatus = (): ValidateStatus | undefined => {
    if (props.validateStatus) return props.validateStatus
    if (validating()) return 'validating'
    if (errors().length > 0) return 'error'
    if (warnings().length > 0) return 'warning'
    return undefined
  }

  const [registrationVersion, setRegistrationVersion] = createSignal(0)
  let unregisterField: (() => void) | undefined
  createEffect(
    on(
      () => props.name,
      () => {
        unregisterField?.()
        unregisterField = undefined
        if (props.name === undefined || !form) return
        unregisterField = untrack(() =>
          form.registerField({
            name: props.name as NonNullable<FormItemProps['name']>,
            rules: rules(),
            initialValue: props.initialValue,
            preserve: props.preserve,
            dependencies: props.dependencies,
            validateTrigger: props.validateTrigger,
            validateFirst: props.validateFirst,
          }),
        )
        setRegistrationVersion((version) => version + 1)
      },
      { defer: false },
    ),
  )
  createEffect(() => {
    registrationVersion()
    if (props.name === undefined || !form) return
    const meta = {
      name: props.name as NonNullable<FormItemProps['name']>,
      rules: rules(),
      initialValue: props.initialValue,
      preserve: props.preserve,
      dependencies: props.dependencies,
      validateTrigger: props.validateTrigger,
      validateFirst: props.validateFirst,
    }
    untrack(() => form.registerField(meta))
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
    if (props.name === undefined || !form) return
    if (props.validateDebounce && props.validateDebounce > 0) {
      if (validateDebounceTimer) clearTimeout(validateDebounceTimer)
      validateDebounceTimer = setTimeout(() => {
        void form
          .validateFields([props.name as NonNullable<FormItemProps['name']>])
          .catch(noopCatch)
      }, props.validateDebounce)
      return
    }
    void form.validateFields([props.name]).catch(noopCatch)
  }

  const validate = (sourceTrigger = trigger()) => {
    if (matchesTrigger(sourceTrigger, validateTrigger())) validateCurrentField()
  }

  const setFieldValueFromControl = (nextOrEvent: unknown, sourceTrigger = trigger()) => {
    if (props.name === undefined || !form) return
    const previousValue = form.getFieldValue(props.name)
    let nextValue = getControlValue([nextOrEvent])
    if (props.normalize)
      nextValue = props.normalize(nextValue, previousValue, form.getFieldsValue(true))
    form.setFieldValue(props.name, nextValue)
    validate(sourceTrigger)
  }

  const valueProps = (): Record<string, unknown> => {
    if (props.name === undefined || !form) return {}
    const value = form.getFieldValue(props.name)
    if (props.getValueProps) return props.getValueProps(value)
    return { [valuePropName()]: value }
  }

  const control = createMemo<FormItemControl | undefined>(() => {
    if (props.name === undefined || !form) return undefined
    const name = props.name
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

  const content = () => {
    const itemControl = control()
    if (itemControl && isRenderProp(props.children)) return props.children(itemControl)
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

  if (props.noStyle) return providers()

  return (
    <div
      class={classNames(
        `${prefixCls()}-item`,
        mergedStatus() && `${prefixCls()}-item-has-${mergedStatus()}`,
        props.hidden && `${prefixCls()}-item-hidden`,
      )}
      style={props.hidden ? { display: 'none' } : undefined}
      onFocusOut={validateOnBlur}
    >
      <Show when={props.label}>
        <label class={`${prefixCls()}-item-label`}>
          <Show when={props.required || rules().some(isRequiredRule)}>
            <span class={`${prefixCls()}-item-required`}>*</span>
          </Show>
          {props.label}
        </label>
      </Show>
      <div class={`${prefixCls()}-item-control`}>
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
