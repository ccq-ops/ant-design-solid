import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useNotificationStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Notification', prefixCls] },
    () => {
      const t = token()
      const nt = getComponentToken('Notification', t)
      const placementBase = { position: 'fixed', 'z-index': 1010 }
      return {
        [`.${prefixCls}-top-right`]: { ...placementBase, top: 24, right: 24 },
        [`.${prefixCls}-top-left`]: { ...placementBase, top: 24, left: 24 },
        [`.${prefixCls}-bottom-right`]: { ...placementBase, bottom: 24, right: 24 },
        [`.${prefixCls}-bottom-left`]: { ...placementBase, bottom: 24, left: 24 },
        [`.${prefixCls}-notice`]: {
          position: 'relative',
          width: nt.width,
          padding: nt.padding,
          'margin-bottom': t.margin,
          color: t.colorText,
          background: nt.bg,
          'border-radius': nt.borderRadius,
          'box-shadow': nt.boxShadow,
        },
        [`.${prefixCls}-notice-message`]: {
          'font-weight': 600,
          'padding-inline-end': 24,
        },
        [`.${prefixCls}-notice-description`]: {
          color: t.colorTextSecondary,
          'margin-top': t.marginXS,
        },
        [`.${prefixCls}-notice-close`]: {
          position: 'absolute',
          top: t.paddingSM,
          right: t.paddingSM,
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          color: t.colorTextSecondary,
        },
        [`.${prefixCls}-notice-success .${prefixCls}-notice-message`]: { color: t.colorSuccess },
        [`.${prefixCls}-notice-info .${prefixCls}-notice-message`]: { color: t.colorInfo },
        [`.${prefixCls}-notice-warning .${prefixCls}-notice-message`]: { color: t.colorWarning },
        [`.${prefixCls}-notice-error .${prefixCls}-notice-message`]: { color: t.colorError },
        [`.${prefixCls}-icon-success`]: { color: t.colorSuccess },
        [`.${prefixCls}-icon-info`]: { color: t.colorInfo },
        [`.${prefixCls}-icon-warning`]: { color: t.colorWarning },
        [`.${prefixCls}-icon-error`]: { color: t.colorError },
      }
    },
  )
}
