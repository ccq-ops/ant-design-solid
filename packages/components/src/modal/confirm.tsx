import { Show, createSignal } from 'solid-js'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design-solid/icons'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { ModalFuncProps } from './interface'
import { ModalBase } from './modal'

export interface ConfirmDialogProps {
  config: ModalFuncProps
  close: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const [loading, setLoading] = createSignal(false)
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-modal`
  const type = () => (props.config.type === 'warn' ? 'warning' : (props.config.type ?? 'confirm'))
  const isConfirm = () => type() === 'confirm'
  const defaultIcon = () => {
    switch (type()) {
      case 'success':
        return <CheckCircleFilled />
      case 'info':
        return <InfoCircleFilled />
      case 'error':
        return <CloseCircleFilled />
      case 'warning':
      case 'confirm':
        return <ExclamationCircleFilled />
      default:
        return null
    }
  }
  const icon = () => {
    if (props.config.icon === null || props.config.icon === false) return null
    return props.config.icon ?? defaultIcon()
  }
  const handleOk = async () => {
    let result: void | Promise<void>
    try {
      result = props.config.onOk?.(props.close)
    } catch {
      return
    }
    if (result && typeof (result as Promise<void>).then === 'function') {
      setLoading(true)
      try {
        await result
        props.close()
      } catch {
        setLoading(false)
      }
      return
    }
    props.close()
  }
  const handleCancel = async () => {
    let result: void | Promise<void>
    try {
      result = props.config.onCancel?.(props.close)
    } catch {
      return
    }
    if (result && typeof (result as Promise<void>).then === 'function') {
      try {
        await result
        props.close()
      } catch {
        return
      }
      return
    }
    props.close()
  }

  const defaultFooter = () => (
    <>
      {isConfirm() && (
        <Button {...props.config.cancelButtonProps} onClick={handleCancel}>
          {props.config.cancelText ?? 'Cancel'}
        </Button>
      )}
      <Button
        {...props.config.okButtonProps}
        type={props.config.okType ?? 'primary'}
        loading={loading() || props.config.okButtonProps?.loading}
        onClick={handleOk}
      >
        {props.config.okText ?? 'OK'}
      </Button>
    </>
  )

  return (
    <ModalBase
      open
      width={props.config.width}
      zIndex={props.config.zIndex}
      style={props.config.style}
      rootStyle={props.config.rootStyle}
      class={classNames(
        `${prefixCls()}-confirm`,
        `${prefixCls()}-confirm-${type()}`,
        props.config.class,
      )}
      rootClass={props.config.rootClass}
      rootClassName={props.config.rootClassName}
      wrapClass={props.config.wrapClass}
      className={props.config.className}
      wrapClassName={props.config.wrapClassName}
      classNames={props.config.classNames}
      styles={props.config.styles}
      bodyStyle={props.config.bodyStyle}
      maskStyle={props.config.maskStyle}
      centered={props.config.centered}
      closable={props.config.closable ?? false}
      closeIcon={props.config.closeIcon}
      mask={props.config.mask}
      maskClosable={props.config.maskClosable ?? false}
      keyboard={props.config.keyboard}
      confirmLoading={loading()}
      okText={props.config.okText}
      cancelText={props.config.cancelText}
      okType={props.config.okType}
      okButtonProps={props.config.okButtonProps}
      cancelButtonProps={props.config.cancelButtonProps}
      footer={props.config.footer ?? defaultFooter()}
      afterClose={props.config.afterClose}
      getContainer={props.config.getContainer}
      modalRender={props.config.modalRender}
      destroyOnClose={props.config.destroyOnClose}
      destroyOnHidden={props.config.destroyOnHidden}
      forceRender={props.config.forceRender}
      prefixCls={props.config.prefixCls}
      focusTriggerAfterClose={props.config.focusTriggerAfterClose}
      focusable={{
        ...props.config.focusable,
        autoFocusButton:
          props.config.focusable?.autoFocusButton ?? props.config.autoFocusButton ?? 'ok',
      }}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div class={`${prefixCls()}-confirm-body`}>
        <Show when={icon()}>
          {(icon) => <span class={`${prefixCls()}-confirm-icon`}>{icon()}</span>}
        </Show>
        <div class={`${prefixCls()}-confirm-message`}>
          <Show when={props.config.title}>
            <div class={`${prefixCls()}-confirm-title`}>{props.config.title}</div>
          </Show>
          <div class={`${prefixCls()}-confirm-content`}>{props.config.content}</div>
        </div>
      </div>
    </ModalBase>
  )
}
