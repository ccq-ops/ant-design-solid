import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useAvatarStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Avatar', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        position: 'relative',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        color: '#ffffff',
        'font-size': `${t.fontSize + 2}px`,
        'font-family': t.fontFamily,
        'font-weight': 400,
        'line-height': '32px',
        'white-space': 'nowrap',
        'text-align': 'center',
        background: t.colorTextDisabled,
        width: '32px',
        height: '32px',
        'vertical-align': 'middle',
      },
      [`.${prefixCls}-circle`]: {
        'border-radius': '50%',
      },
      [`.${prefixCls}-square`]: {
        'border-radius': `${t.borderRadius}px`,
      },
      [`.${prefixCls}-sm`]: {
        width: '24px',
        height: '24px',
        'font-size': `${t.fontSize}px`,
        'line-height': '24px',
      },
      [`.${prefixCls}-lg`]: {
        width: '40px',
        height: '40px',
        'font-size': `${t.fontSize + 4}px`,
        'line-height': '40px',
      },
      [`.${prefixCls}-image`]: {
        background: 'transparent',
      },
      [`.${prefixCls} > img`]: {
        display: 'block',
        width: '100%',
        height: '100%',
        'object-fit': 'cover',
      },
      [`.${prefixCls}-icon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        width: '100%',
        height: '100%',
        'font-size': 'inherit',
        'line-height': 1,
      },
      [`.${prefixCls}-string`]: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        'transform-origin': '0 center',
      },
      [`.${prefixCls}-group`]: {
        display: 'inline-flex',
        'align-items': 'center',
      },
      [`.${prefixCls}-group > .${prefixCls}`]: {
        'border-inline-start': `${t.lineWidth}px solid ${t.colorBgContainer}`,
      },
      [`.${prefixCls}-group > .${prefixCls}:not(:first-child)`]: {
        'margin-inline-start': '-8px',
      },
      [`.${prefixCls}-group > .${prefixCls}-overflow`]: {
        color: t.colorText,
        background: t.colorFillAlter,
      },
    }
  })
}
