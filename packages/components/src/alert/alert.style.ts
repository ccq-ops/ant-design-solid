import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useAlertStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Alert', prefixCls] }, () => {
    const t = token()
    const at = getComponentToken('Alert', t)
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        display: 'flex',
        gap: t.marginSM,
        width: '100%',
        padding: at.padding,
        color: t.colorText,
        'font-size': t.fontSize,
        'line-height': t.lineHeight,
        'border-radius': at.borderRadius,
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-with-description`]: { padding: at.withDescriptionPadding },
      [`.${prefixCls}-success`]: { background: at.successBg, borderColor: at.successBorderColor },
      [`.${prefixCls}-info`]: { background: at.infoBg, borderColor: at.infoBorderColor },
      [`.${prefixCls}-warning`]: { background: at.warningBg, borderColor: at.warningBorderColor },
      [`.${prefixCls}-error`]: { background: at.errorBg, borderColor: at.errorBorderColor },
      [`.${prefixCls}-icon`]: { 'font-size': at.iconSize, 'line-height': t.lineHeight },
      [`.${prefixCls}-content`]: { flex: 1, 'min-width': 0 },
      [`.${prefixCls}-message`]: { color: t.colorText },
      [`.${prefixCls}-description`]: { color: t.colorTextSecondary, 'margin-top': t.marginXS },
      [`.${prefixCls}-action`]: { 'margin-inline-start': t.marginSM },
      [`.${prefixCls}-close`]: {
        border: 0,
        padding: 0,
        background: 'transparent',
        color: t.colorTextSecondary,
        cursor: 'pointer',
      },
    }
  })
}
