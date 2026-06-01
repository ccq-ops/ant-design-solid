import { createEffect, createMemo, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { FormContext } from './context'
import { useForm, setFormCallbacks, setFormInitialValues } from './store'
import { useFormStyle } from './form.style'
import type { FormInstance, FormProps } from './interface'
import type { JSX } from 'solid-js'

export function FormRoot(props: FormProps) {
  const [local, rest] = splitProps(props, [
    'form',
    'initialValues',
    'onFinish',
    'onFinishFailed',
    'onValuesChange',
    'children',
    'class',
    'onSubmit',
    'onReset',
  ])
  const [createdForm] = useForm(local.form)
  const form = createMemo<FormInstance>(() => local.form ?? createdForm)
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-form`
  const [, hashId] = useFormStyle(prefixCls())

  createEffect(() => {
    setFormInitialValues(form(), local.initialValues)
  })

  createEffect(() => {
    setFormCallbacks(form(), {
      onFinish: local.onFinish,
      onFinishFailed: local.onFinishFailed,
      onValuesChange: local.onValuesChange,
    })
  })

  return (
    <FormContext.Provider value={form()}>
      <form
        {...rest}
        class={classNames(prefixCls(), hashId(), local.class)}
        onSubmit={(event) => {
          event.preventDefault()
          ;(local.onSubmit as JSX.EventHandler<HTMLFormElement, SubmitEvent> | undefined)?.(event)
          form().submit()
        }}
        onReset={(event) => {
          event.preventDefault()
          ;(local.onReset as JSX.EventHandler<HTMLFormElement, Event> | undefined)?.(event)
          form().resetFields()
        }}
      >
        {local.children}
      </form>
    </FormContext.Provider>
  )
}
