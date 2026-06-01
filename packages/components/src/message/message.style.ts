import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useMessageStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Message', prefixCls] },
    () => {
      const t = token()
      const mt = getComponentToken('Message', t)
      return {
        [`.${prefixCls}`]: {
          position: 'fixed',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          'z-index': 1000,
          'pointer-events': 'none',
        },
        [`.${prefixCls}-notice`]: {
          padding: `${t.paddingXS}px 0`,
          'text-align': 'center',
        },
        [`.${prefixCls}-notice-content`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: t.marginXS,
          padding: `${mt.noticePadding}px`,
          color: t.colorText,
          background: mt.contentBg,
          'border-radius': mt.noticeBorderRadius,
          'box-shadow': mt.contentShadow,
          'pointer-events': 'auto',
        },
        [`.${prefixCls}-icon-success`]: { color: t.colorSuccess },
        [`.${prefixCls}-icon-info`]: { color: t.colorInfo },
        [`.${prefixCls}-icon-error`]: { color: t.colorError },
        [`.${prefixCls}-icon-warning`]: { color: t.colorWarning },
        [`.${prefixCls}-icon-loading`]: { color: t.colorInfo },
      }
    },
  )
}
