import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useRadioStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Radio', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        display: 'inline-flex',
        'align-items': 'center',
        gap: '8px',
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        cursor: 'pointer',
      },
      [`.${prefixCls}-input`]: { cursor: 'pointer' },
      [`.${prefixCls}-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
      [`.${prefixCls}-disabled .${prefixCls}-input`]: { cursor: 'not-allowed' },
      [`.${prefixCls}-group`]: { display: 'inline-flex', gap: '12px', 'align-items': 'center' },
      [`.${prefixCls}-group-button`]: { gap: 0 },
      [`.${prefixCls}-button-wrapper`]: {
        padding: `0 ${t.padding}px`,
        height: t.controlHeight,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-inline-start-width': 0,
        'line-height': t.controlHeight,
        background: t.colorBgContainer,
      },
      [`.${prefixCls}-button-wrapper:first-child`]: {
        'border-inline-start-width': `${t.lineWidth}px`,
        'border-start-start-radius': t.borderRadius,
        'border-end-start-radius': t.borderRadius,
      },
      [`.${prefixCls}-button-wrapper:last-child`]: {
        'border-start-end-radius': t.borderRadius,
        'border-end-end-radius': t.borderRadius,
      },
      [`.${prefixCls}-button-wrapper-checked`]: {
        color: t.colorPrimary,
        borderColor: t.colorPrimary,
      },
    }
  })
}
