import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useResultStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Result', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        padding: `${t.paddingLG * 2}px ${t.padding}px`,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'text-align': 'center',
      },
      [`.${prefixCls}-icon`]: {
        display: 'flex',
        'justify-content': 'center',
        'margin-bottom': `${t.margin}px`,
        'font-size': '48px',
        'line-height': 1,
      },
      [`.${prefixCls}-success .${prefixCls}-icon`]: { color: t.colorSuccess },
      [`.${prefixCls}-error .${prefixCls}-icon`]: { color: t.colorError },
      [`.${prefixCls}-warning .${prefixCls}-icon`]: { color: t.colorWarning },
      [`.${prefixCls}-info .${prefixCls}-icon`]: { color: t.colorPrimary },
      [`.${prefixCls}-404 .${prefixCls}-icon, .${prefixCls}-403 .${prefixCls}-icon, .${prefixCls}-500 .${prefixCls}-icon`]:
        {
          color: t.colorTextSecondary,
        },
      [`.${prefixCls}-image`]: {
        'font-size': 0,
      },
      [`.${prefixCls}-image svg`]: {
        'max-width': '100%',
        height: 'auto',
      },
      [`.${prefixCls}-title`]: {
        color: t.colorText,
        'font-size': '24px',
        'line-height': 1.4,
      },
      [`.${prefixCls}-subtitle`]: {
        'margin-top': `${t.marginXS}px`,
        color: t.colorTextSecondary,
      },
      [`.${prefixCls}-extra`]: {
        'margin-top': `${t.marginLG}px`,
      },
      [`.${prefixCls}-body, .${prefixCls}-content`]: {
        'margin-top': `${t.marginLG}px`,
        padding: `${t.padding}px`,
        background: t.colorFillAlter,
        'border-radius': `${t.borderRadius}px`,
        'text-align': 'start',
      },
    }
  })
}
