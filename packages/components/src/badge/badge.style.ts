import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useBadgeStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Badge', prefixCls] }, () => {
    const t = token()
    const badge = getComponentToken('Badge', t)
    return {
      [`.${prefixCls}`]: { position: 'relative', display: 'inline-block', 'line-height': 1 },
      [`.${prefixCls}-count`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'min-width': badge.overflowIndicatorHeight,
        height: badge.overflowIndicatorHeight,
        padding: '0 6px',
        color: badge.colorText,
        'font-size': badge.textFontSize,
        'line-height': 1,
        'white-space': 'nowrap',
        background: badge.colorBg,
        'border-radius': badge.overflowIndicatorHeight / 2,
        'box-shadow': `0 0 0 1px ${t.colorBgContainer}`,
      },
      [`.${prefixCls}-with-children .${prefixCls}-count, .${prefixCls}-with-children .${prefixCls}-dot`]:
        {
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'translate(50%, -50%)',
          'transform-origin': '100% 0%',
        },
      [`.${prefixCls}-dot`]: {
        display: 'inline-block',
        width: badge.dotSize,
        height: badge.dotSize,
        background: badge.colorBg,
        'border-radius': '50%',
        'box-shadow': `0 0 0 1px ${t.colorBgContainer}`,
      },
      [`.${prefixCls}-status`]: { display: 'inline-flex', 'align-items': 'center', gap: 6 },
      [`.${prefixCls}-status-dot`]: {
        display: 'inline-block',
        width: badge.statusSize,
        height: badge.statusSize,
        'border-radius': '50%',
      },
      [`.${prefixCls}-status-success`]: { background: t.colorSuccess },
      [`.${prefixCls}-status-processing`]: {
        background: t.colorInfo,
        animation: 'ads-badge-pulse 1.2s infinite ease-in-out',
      },
      [`.${prefixCls}-status-default`]: { background: t.colorTextDisabled },
      [`.${prefixCls}-status-error`]: { background: t.colorError },
      [`.${prefixCls}-status-warning`]: { background: t.colorWarning },
      [`.${prefixCls}-status-text`]: {
        color: t.colorText,
        'font-size': t.fontSize,
        'line-height': t.lineHeight,
      },
      '@keyframes ads-badge-pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.45 },
        '100%': { opacity: 1 },
      },
    }
  })
}
