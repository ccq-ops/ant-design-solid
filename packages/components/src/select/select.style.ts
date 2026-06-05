import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useSelectStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Select', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        position: 'relative',
        display: 'inline-block',
        width: 160,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
      },
      [`.${prefixCls}-selector`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        width: '100%',
        height: t.controlHeight,
        padding: `0 ${t.paddingSM}px`,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
        background: t.colorBgContainer,
        cursor: 'pointer',
      },
      [`.${prefixCls}-disabled .${prefixCls}-selector`]: {
        color: t.colorTextDisabled,
        background: t.colorFillAlter,
        cursor: 'not-allowed',
      },
      [`.${prefixCls}-placeholder`]: { color: t.colorTextDisabled },
      [`.${prefixCls}-clear`]: {
        border: 0,
        padding: 0,
        background: 'transparent',
        color: t.colorTextDisabled,
        cursor: 'pointer',
      },
      [`.${prefixCls}-dropdown`]: {
        marginTop: 4,
        padding: `${t.paddingXS}px 0`,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
        background: t.colorBgContainer,
        'box-shadow': '0 6px 16px rgba(0, 0, 0, 0.08)',
      },
      [`.${prefixCls}-item`]: { padding: `${t.paddingXS}px ${t.paddingSM}px`, cursor: 'pointer' },
      [`.${prefixCls}-item-option-selected`]: {
        color: t.colorPrimary,
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-item-option-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
    }
  })
}
