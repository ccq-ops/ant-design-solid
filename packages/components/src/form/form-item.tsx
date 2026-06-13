import { createEffect, createMemo, createSignal, For, on, onCleanup, Show, untrack } from 'solid-js'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
} from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { Tooltip } from '../tooltip'
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
  FormItemHasFeedback,
  FormItemProps,
  FormTooltipConfig,
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

function isTooltipConfig(value: FormItemProps['tooltip']): value is FormTooltipConfig {
  if (typeof Node !== 'undefined' && value instanceof Node) return false
  return Boolean(
    value &&
    typeof value === 'object' &&
    !('t' in value) &&
    ('title' in value || 'icon' in value || 'placement' in value),
  )
}

function renderTooltip(tooltip: FormItemProps['tooltip']) {
  if (!tooltip) return undefined
  if (!isTooltipConfig(tooltip)) return tooltip
  const { icon, title, ...rest } = tooltip
  return (
    <Tooltip title={title} {...rest}>
      <span>{icon ?? '?'}</span>
    </Tooltip>
  )
}

function resolveFeedbackIcons(
  icons: FormItemHasFeedback,
  formIcons: ReturnType<ReturnType<typeof useFormLayoutContext>['feedbackIcons']>,
  info: { status: ValidateStatus; errors: JSX.Element[]; warnings: JSX.Element[] },
) {
  const itemIcons = typeof icons === 'object' ? icons.icons : undefined
  const source = itemIcons ?? formIcons
  if (typeof source === 'function') return source(info)
  return source
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
  const mergedLayout = () => props.layout ?? layout.layout()
  const mergedLabelWrap = () => props.labelWrap ?? layout.labelWrap()
  const mergedTooltip = () => props.tooltip ?? layout.tooltip()
  const labelCol = () => serializeLayoutValue(props.labelCol ?? layout.labelCol())
  const wrapperCol = () => serializeLayoutValue(props.wrapperCol ?? layout.wrapperCol())
  const semanticClassNames = createMemo(() =>
    typeof props.classNames === 'function' ? props.classNames({ props }) : (props.classNames ?? {}),
  )
  const semanticStyles = createMemo(() =>
    typeof props.styles === 'function' ? props.styles({ props }) : (props.styles ?? {}),
  )

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
  const feedbackIcon = () => {
    const status = mergedStatus()
    if (!props.hasFeedback || !status) return undefined
    const info = {
      status,
      errors: errors() as JSX.Element[],
      warnings: warnings() as JSX.Element[],
    }
    const icons = resolveFeedbackIcons(props.hasFeedback, layout.feedbackIcons(), info)
    return (
      icons?.[status] ??
      {
        success: <CheckCircleFilled />,
        warning: <ExclamationCircleFilled />,
        error: <CloseCircleFilled />,
        validating: <LoadingOutlined />,
      }[status]
    )
  }
  const requiredMark = () => layout.requiredMark()
  const labelContent = () => {
    const mark = requiredMark()
    if (typeof mark === 'function') return mark(props.label, { required: isRequired() })
    return props.label
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
          label: props.label,
          messageVariables: props.messageVariables,
          validateMessages: layout.validateMessages(),
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
    registeredMeta.label = props.label
    registeredMeta.messageVariables = props.messageVariables
    registeredMeta.validateMessages = layout.validateMessages()
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
      disabled: () => layout.disabled(),
      size: () => layout.size(),
      variant: () => layout.variant(),
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
        `${prefixCls()}-item-${mergedLayout()}`,
        `${prefixCls()}-item-label-${mergedLabelAlign()}`,
        mergedStatus() && `${prefixCls()}-item-has-${mergedStatus()}`,
        props.hidden && `${prefixCls()}-item-hidden`,
        semanticClassNames().root,
      )}
      style={{ ...(semanticStyles().root ?? {}), ...(props.hidden ? { display: 'none' } : {}) }}
      onFocusOut={validateOnBlur}
    >
      <Show when={props.label || props.label === null}>
        <label
          for={props.htmlFor}
          data-label-col={labelCol()}
          class={classNames(
            `${prefixCls()}-item-label`,
            `${prefixCls()}-item-label-${mergedLabelAlign()}`,
            mergedLabelWrap() && `${prefixCls()}-item-label-wrap`,
            mergedColon() && `${prefixCls()}-item-label-colon`,
            isRequired() && `${prefixCls()}-item-required`,
            requiredMark() === false && `${prefixCls()}-item-required-mark-hidden`,
            requiredMark() === 'optional' && `${prefixCls()}-item-required-mark-optional`,
            typeof requiredMark() === 'function' && `${prefixCls()}-item-required-mark-custom`,
            semanticClassNames().label,
          )}
          style={semanticStyles().label}
        >
          <span class={`${prefixCls()}-item-label-content`}>{labelContent()}</span>
          <Show when={mergedTooltip()}>
            <span class={`${prefixCls()}-item-tooltip`}>{renderTooltip(mergedTooltip())}</span>
          </Show>
          <Show when={showOptionalMark()}>
            <span class={`${prefixCls()}-item-optional`}>(optional)</span>
          </Show>
        </label>
      </Show>
      <div
        class={classNames(`${prefixCls()}-item-control`, semanticClassNames().content)}
        style={semanticStyles().content}
        data-wrapper-col={wrapperCol()}
      >
        <div class={`${prefixCls()}-item-control-input`}>
          {providers()}
          <Show when={feedbackIcon()}>
            <span
              class={classNames(
                `${prefixCls()}-item-feedback-icon`,
                `${prefixCls()}-item-feedback-icon-${mergedStatus()}`,
                semanticClassNames().feedbackIcon,
              )}
              style={semanticStyles().feedbackIcon}
            >
              {feedbackIcon()}
            </span>
          </Show>
        </div>
        <Show when={props.help ?? errors()[0] ?? warnings()[0]}>
          <div
            class={classNames(
              `${prefixCls()}-item-explain`,
              mergedStatus() === 'error' && `${prefixCls()}-item-explain-error`,
              mergedStatus() === 'warning' && `${prefixCls()}-item-explain-warning`,
              semanticClassNames().help,
            )}
            style={semanticStyles().help}
          >
            <Show
              when={props.help}
              fallback={
                <For each={errors().length > 0 ? errors() : warnings()}>
                  {(message) => (
                    <div
                      class={classNames(
                        `${prefixCls()}-item-explain-item`,
                        semanticClassNames().helpItem,
                      )}
                      style={semanticStyles().helpItem}
                    >
                      {message}
                    </div>
                  )}
                </For>
              }
            >
              <div
                class={classNames(
                  `${prefixCls()}-item-explain-item`,
                  semanticClassNames().helpItem,
                )}
                style={semanticStyles().helpItem}
              >
                {props.help}
              </div>
            </Show>
          </div>
        </Show>
        <Show when={props.extra}>
          <div
            class={classNames(`${prefixCls()}-item-extra`, semanticClassNames().extra)}
            style={semanticStyles().extra}
          >
            {props.extra}
          </div>
        </Show>
      </div>
    </div>
  )
}
