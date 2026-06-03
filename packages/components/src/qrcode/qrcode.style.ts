import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useQRCodeStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['QRCode', prefixCls] },
    () => ({
      [`.${prefixCls}`]: {
        position: 'relative',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        padding: `${token().paddingXS}px`,
        'border-radius': `${token().borderRadius}px`,
        overflow: 'hidden',
      },
      [`.${prefixCls}-bordered`]: {
        border: `${token().lineWidth}px solid ${token().colorBorderSecondary}`,
      },
      [`.${prefixCls}-svg`]: {
        display: 'block',
      },
      [`.${prefixCls}-status`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        background: 'rgba(255, 255, 255, 0.88)',
        color: token().colorText,
        'font-size': `${token().fontSize}px`,
        'text-align': 'center',
      },
    }),
  )
}
