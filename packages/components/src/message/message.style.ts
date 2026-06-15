import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'
import { loadingIconRotateKeyframes, loadingIconRotateStyle } from '../shared/loading-icon-style'

export function useMessageStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Message', prefixCls] },
    () => {
      const t = token()
      const mt = getComponentToken('Message', t)
      return {
        ...loadingIconRotateKeyframes,
        [`.${prefixCls}`]: {
          position: 'fixed',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          'z-index': mt.zIndexPopup,
          'pointer-events': 'none',
        },
        [`.${prefixCls}-notice`]: {
          padding: `${t.paddingXS}px 0`,
          'text-align': 'center',
        },
        [`.${prefixCls}-stack .${prefixCls}-notice-stacked`]: {
          transform: 'scale(0.96)',
          opacity: 0.72,
        },
        [`.${prefixCls}-stack .${prefixCls}-notice:not(:first-child)`]: {
          'margin-top': -t.margin,
        },
        [`.${prefixCls}-notice-content`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: t.marginXS,
          padding: mt.contentPadding,
          color: t.colorText,
          background: mt.contentBg,
          'border-radius': t.borderRadiusLG,
          'box-shadow': t.boxShadow,
          'pointer-events': 'auto',
        },
        [`.${prefixCls}-icon-success`]: { color: t.colorSuccess },
        [`.${prefixCls}-icon-info`]: { color: t.colorInfo },
        [`.${prefixCls}-icon-error`]: { color: t.colorError },
        [`.${prefixCls}-icon-warning`]: { color: t.colorWarning },
        [`.${prefixCls}-icon-loading`]: { color: t.colorInfo },
        ...loadingIconRotateStyle(`.${prefixCls}-icon-loading svg`),
      }
    },
  )
}
