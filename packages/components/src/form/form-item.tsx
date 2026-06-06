import { createEffect, createMemo, onCleanup, Show, untrack } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { FormItemContext, useFormContext } from './context'
import type { FieldValue, FormItemControl, FormItemProps, Rule } from './interface'
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

export function FormItem(props: FormItemProps) {
  const form = useFormContext()
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-form`
  const valuePropName = () => props.valuePropName ?? 'value'
  const trigger = () => props.trigger ?? 'onChange'
  const rules = () =>
    props.required ? [{ required: true }, ...(props.rules ?? [])] : (props.rules ?? [])
  const errors = () =>
    props.name !== undefined && form ? form.getFieldErrorAccessor(props.name)() : []
  const mergedStatus = () => props.validateStatus ?? (errors().length > 0 ? 'error' : undefined)

  let unregisterField: (() => void) | undefined
  createEffect(() => {
    unregisterField?.()
    unregisterField = undefined
    if (props.name === undefined || !form) return
    const meta = {
      name: props.name,
      rules: rules(),
      initialValue: props.initialValue,
    }
    unregisterField = untrack(() => form.registerField(meta))
  })
  onCleanup(() => unregisterField?.())

  const control = createMemo<FormItemControl | undefined>(() => {
    if (props.name === undefined || !form) return undefined
    const name = props.name
    return {
      name,
      value: () => form.getFieldValue(name),
      valuePropName,
      trigger,
      onChange: (nextOrEvent) =>
        form.setFieldValue(name, getValueFromControl(valuePropName(), nextOrEvent)),
      setFieldValueFromControl: (nextOrEvent) =>
        form.setFieldValue(name, getValueFromControl(valuePropName(), nextOrEvent)),
      errors,
      status: mergedStatus,
    }
  })

  const content = () => {
    const itemControl = control()
    if (itemControl && isRenderProp(props.children)) return props.children(itemControl)
    return props.children as JSX.Element
  }

  return (
    <div
      class={classNames(
        `${prefixCls()}-item`,
        mergedStatus() && `${prefixCls()}-item-has-${mergedStatus()}`,
      )}
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
        <FormItemContext.Provider value={control()}>{content()}</FormItemContext.Provider>
        <Show when={props.help ?? errors()[0]}>
          <div
            class={classNames(
              `${prefixCls()}-item-explain`,
              mergedStatus() === 'error' && `${prefixCls()}-item-explain-error`,
            )}
          >
            {props.help ?? errors()[0]}
          </div>
        </Show>
      </div>
    </div>
  )
}
