import { createSignal } from 'solid-js'
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
      result = props.config.onOk?.()
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
  const handleCancel = () => {
    props.config.onCancel?.()
    props.close()
  }

  return (
    <ModalBase
      open
      title={props.config.title}
      width={props.config.width}
      closable={props.config.closable ?? false}
      maskClosable={props.config.maskClosable ?? false}
      keyboard={props.config.keyboard}
      confirmLoading={loading()}
      okText={props.config.okText}
      cancelText={props.config.cancelText}
      class={classNames(`${prefixCls()}-confirm`, `${prefixCls()}-confirm-${type()}`)}
      footer={
        <>
          {isConfirm() && (
            <Button onClick={handleCancel}>{props.config.cancelText ?? 'Cancel'}</Button>
          )}
          <Button type="primary" loading={loading()} onClick={handleOk}>
            {props.config.okText ?? 'OK'}
          </Button>
        </>
      }
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div class={`${prefixCls()}-confirm-content`}>{props.config.content}</div>
    </ModalBase>
  )
}
