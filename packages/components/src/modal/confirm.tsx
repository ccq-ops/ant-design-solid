import { Show, createSignal } from 'solid-js'
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
  const type = () => props.config.type ?? 'confirm'
  const isConfirm = () => type() === 'confirm'
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
      title={props.config.title}
      width={props.config.width}
      zIndex={props.config.zIndex}
      style={props.config.style}
      class={classNames(`${prefixCls()}-confirm`, `${prefixCls()}-confirm-${type()}`)}
      className={props.config.className}
      wrapClassName={props.config.wrapClassName}
      classNames={props.config.classNames}
      styles={props.config.styles}
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
      destroyOnHidden={props.config.destroyOnHidden}
      forceRender={props.config.forceRender}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div class={`${prefixCls()}-confirm-body`}>
        <Show when={props.config.icon}>
          {(icon) => <span class={`${prefixCls()}-confirm-icon`}>{icon()}</span>}
        </Show>
        <div class={`${prefixCls()}-confirm-message`}>
          <div class={`${prefixCls()}-confirm-content`}>{props.config.content}</div>
        </div>
      </div>
    </ModalBase>
  )
}
