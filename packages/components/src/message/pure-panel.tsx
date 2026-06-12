import { createMemo } from 'solid-js'
import { ConfigProvider, useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { MessageHolder } from './holder'
import type { MessageNotice, MessagePureListProps, MessagePurePanelProps } from './interface'

function PurePanelContent(props: MessagePurePanelProps) {
  const context = useConfig()
  const prefixCls = () => props.prefixCls ?? `${context.prefixCls()}-message`
  const notice = createMemo<MessageNotice>(() => ({
    ...props,
    key: 'pure-panel',
    type: props.type ?? 'info',
    class: classNames(`${prefixCls()}-notice-pure-panel`, props.class),
    duration: 0,
  }))

  return (
    <MessageHolder
      notices={() => [notice()]}
      config={() => ({
        prefixCls: prefixCls(),
        classNames: props.classNames,
        styles: props.styles,
      })}
    />
  )
}

export function PurePanel(props: MessagePurePanelProps) {
  return (
    <ConfigProvider>
      <PurePanelContent {...props} />
    </ConfigProvider>
  )
}

export function PureList(props: MessagePureListProps) {
  return (
    <ConfigProvider>
      <MessageHolder notices={() => props.notices} config={() => props.config ?? {}} />
    </ConfigProvider>
  )
}
