import { createEffect, createMemo, onCleanup, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { FormContext, FormLayoutContext, useFormProviderContext } from './context'
import {
  destroyForm,
  registerFormOwner,
  setFormCallbacks,
  setFormControlledFields,
  setFormInitialValues,
  setFormProviderCallbacks,
  useForm,
} from './store'
import { useFormStyle } from './form.style'
import type { FormInstance, FormProps } from './interface'
import type { JSX } from 'solid-js'

function mergeStyle(...values: Array<JSX.CSSProperties | string | undefined>) {
  if (values.length === 1 && typeof values[0] === 'string') return values[0]
  const objects = values.filter(
    (value): value is JSX.CSSProperties => !!value && typeof value === 'object',
  )
  return objects.length > 0 ? Object.assign({}, ...objects) : undefined
}

export function FormRoot(props: FormProps) {
  const [local, rest] = splitProps(props, [
    'form',
    'component',
    'name',
    'fields',
    'initialValues',
    'onFinish',
    'onFinishFailed',
    'onValuesChange',
    'onFieldsChange',
    'children',
    'layout',
    'labelAlign',
    'colon',
    'requiredMark',
    'validateTrigger',
    'labelCol',
    'wrapperCol',
    'classNames',
    'styles',
    'clearOnDestroy',
    'scrollToFirstError',
    'disabled',
    'size',
    'variant',
    'feedbackIcons',
    'labelWrap',
    'tooltip',
    'preserve',
    'validateMessages',
    'class',
    'style',
    'onSubmit',
    'onReset',
  ])
  const [createdForm] = useForm(local.form)
  const form = createMemo<FormInstance>(() => local.form ?? createdForm)
  const provider = useFormProviderContext()
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-form`
  const [, hashId] = useFormStyle(prefixCls())
  const semanticClassNames = createMemo(() =>
    typeof local.classNames === 'function' ? local.classNames({ props }) : (local.classNames ?? {}),
  )
  const semanticStyles = createMemo(() =>
    typeof local.styles === 'function' ? local.styles({ props }) : (local.styles ?? {}),
  )

  createEffect(() => {
    setFormInitialValues(form(), local.initialValues)
  })

  createEffect(() => {
    if (!local.fields) return
    setFormControlledFields(form(), local.fields)
  })

  const layout = () => local.layout ?? 'horizontal'
  const requiredMark = () => local.requiredMark ?? true
  const colon = () => local.colon ?? true
  const labelAlign = () => local.labelAlign ?? 'right'
  const labelCol = () => local.labelCol
  const wrapperCol = () => local.wrapperCol
  const validateTrigger = () => local.validateTrigger
  const feedbackIcons = () => local.feedbackIcons
  const labelWrap = () => local.labelWrap
  const tooltip = () => local.tooltip
  const validateMessages = () => local.validateMessages
  const disabled = () => local.disabled
  const size = () => local.size
  const variant = () => local.variant
  const layoutContext = {
    layout,
    requiredMark,
    colon,
    labelAlign,
    labelCol,
    wrapperCol,
    validateTrigger,
    feedbackIcons,
    labelWrap,
    tooltip,
    validateMessages,
    disabled,
    size,
    variant,
  }

  let unregisterCallbacks: (() => void) | undefined
  createEffect(() => {
    unregisterCallbacks?.()
    unregisterCallbacks = setFormCallbacks(form(), {
      clearOnDestroy: local.clearOnDestroy,
      onFinish: local.onFinish,
      onFinishFailed: (errorInfo) => {
        local.onFinishFailed?.(errorInfo)
        const target = errorInfo.errorFields[0]
        if (!target || !local.scrollToFirstError) return
        form().scrollToField?.(
          target.name,
          typeof local.scrollToFirstError === 'object' ? local.scrollToFirstError : undefined,
        )
      },
      onValuesChange: local.onValuesChange,
      onFieldsChange: local.onFieldsChange,
    })
  })
  onCleanup(() => unregisterCallbacks?.())

  let unregisterProviderCallbacks: (() => void) | undefined
  createEffect(() => {
    unregisterProviderCallbacks?.()
    unregisterProviderCallbacks = setFormProviderCallbacks(form(), {
      name: local.name,
      onFieldsChange:
        provider && local.name
          ? (changedFields) => provider.triggerFormChange(local.name as string, changedFields)
          : undefined,
      onFinish:
        provider && local.name
          ? (values) => provider.triggerFormFinish(local.name as string, values)
          : undefined,
    })
  })
  onCleanup(() => unregisterProviderCallbacks?.())

  let unregisterProviderForm: (() => void) | undefined
  createEffect(() => {
    unregisterProviderForm?.()
    if (!provider || !local.name) return
    unregisterProviderForm = provider.registerForm(local.name, form())
  })
  onCleanup(() => unregisterProviderForm?.())

  let unregisterOwner: (() => void) | undefined
  createEffect(() => {
    unregisterOwner?.()
    unregisterOwner = registerFormOwner(form())
  })
  onCleanup(() => {
    unregisterOwner?.()
    destroyForm(form(), local.clearOnDestroy)
  })

  const rootClass = () =>
    classNames(
      prefixCls(),
      `${prefixCls()}-${layout()}`,
      hashId(),
      semanticClassNames().root,
      local.class,
    )
  const rootStyle = () => {
    const semanticStyle = semanticStyles().root
    if (!semanticStyle) return mergeStyle(local.style as JSX.CSSProperties | string | undefined)
    return mergeStyle(semanticStyle, local.style as JSX.CSSProperties | string | undefined)
  }

  const rootProps = () => ({
    ...rest,
    class: rootClass(),
    style: rootStyle(),
  })

  const renderContent = () => local.children

  const renderRoot = () => {
    if (local.component === false) return renderContent()
    const component = local.component ?? 'form'
    const props = rootProps()
    return (
      <Dynamic
        component={component}
        {...props}
        onSubmit={(event: SubmitEvent) => {
          event.preventDefault()
          ;(local.onSubmit as JSX.EventHandler<HTMLFormElement, SubmitEvent> | undefined)?.(
            event as SubmitEvent & { currentTarget: HTMLFormElement; target: Element },
          )
          form().submit()
        }}
        onReset={(event: Event) => {
          event.preventDefault()
          ;(local.onReset as JSX.EventHandler<HTMLFormElement, Event> | undefined)?.(
            event as Event & { currentTarget: HTMLFormElement; target: Element },
          )
          form().resetFields()
        }}
      >
        {renderContent()}
      </Dynamic>
    )
  }

  return (
    <FormContext.Provider value={form()}>
      <FormLayoutContext.Provider value={layoutContext}>{renderRoot()}</FormLayoutContext.Provider>
    </FormContext.Provider>
  )
}
