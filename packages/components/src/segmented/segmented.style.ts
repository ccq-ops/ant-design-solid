import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useSegmentedStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Segmented', prefixCls] },
    () => ({
      [`.${prefixCls}`]: {
        display: 'inline-flex',
        padding: '2px',
        'border-radius': `${token().borderRadius}px`,
        background: token().colorFillAlter,
        gap: '2px',
      },
      [`.${prefixCls}-block`]: { display: 'flex', width: '100%' },
      [`.${prefixCls}-disabled`]: { opacity: 0.6, cursor: 'not-allowed' },
      [`.${prefixCls}-item`]: {
        border: 0,
        margin: 0,
        background: 'transparent',
        color: token().colorText,
        cursor: 'pointer',
        'border-radius': `${Math.max(token().borderRadius - 2, 2)}px`,
        padding: `${token().paddingXS}px ${token().paddingSM}px`,
        'font-size': `${token().fontSize}px`,
        'line-height': token().lineHeight,
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        gap: `${token().marginXS}px`,
        flex: '0 0 auto',
      },
      [`.${prefixCls}-block .${prefixCls}-item`]: { flex: '1 1 0' },
      [`.${prefixCls}-item:hover`]: { color: token().colorPrimaryHover },
      [`.${prefixCls}-item-selected`]: {
        background: token().colorBgContainer,
        color: token().colorPrimary,
        'box-shadow': token().boxShadow,
      },
      [`.${prefixCls}-item-disabled`]: {
        color: token().colorTextDisabled,
        cursor: 'not-allowed',
      },
      [`.${prefixCls}-item-disabled:hover`]: { color: token().colorTextDisabled },
      [`.${prefixCls}-sm .${prefixCls}-item`]: {
        padding: `0 ${token().paddingXS}px`,
        'font-size': `${token().fontSize - 1}px`,
      },
      [`.${prefixCls}-lg .${prefixCls}-item`]: {
        padding: `${token().paddingSM}px ${token().padding}px`,
        'font-size': `${token().fontSize + 2}px`,
      },
    }),
  )
}
