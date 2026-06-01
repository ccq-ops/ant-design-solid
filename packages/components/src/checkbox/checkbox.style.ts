import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useCheckboxStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Checkbox', prefixCls] }, () => {
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
    }
  })
}
