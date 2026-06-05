import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useImageStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Image', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        position: 'relative',
        display: 'inline-block',
        'box-sizing': 'border-box',
        color: t.colorText,
        'font-family': t.fontFamily,
      },
      [`.${prefixCls}-img`]: {
        display: 'block',
        'max-width': '100%',
        cursor: 'zoom-in',
      },
      [`.${prefixCls}-img-no-preview`]: {
        cursor: 'default',
      },
      [`.${prefixCls}-placeholder`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        background: t.colorFillAlter,
        color: t.colorTextSecondary,
        'font-size': `${t.fontSize}px`,
      },
      [`.${prefixCls}-preview`]: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        background: 'rgba(0, 0, 0, 0.72)',
      },
      [`.${prefixCls}-preview-img`]: {
        'max-width': '90vw',
        'max-height': '90vh',
        'object-fit': 'contain',
      },
      [`.${prefixCls}-preview-close`]: {
        position: 'absolute',
        top: `${t.margin}px`,
        right: `${t.margin}px`,
        width: '32px',
        height: '32px',
        border: 0,
        'border-radius': '50%',
        background: 'rgba(255, 255, 255, 0.2)',
        color: '#fff',
        cursor: 'pointer',
        'font-size': '20px',
      },
    }
  })
}
