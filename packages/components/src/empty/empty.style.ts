import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useEmptyStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Empty', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: `${t.margin}px 0`,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'text-align': 'center',
      },
      [`.${prefixCls}-image`]: {
        height: 100,
        'margin-bottom': `${t.marginXS}px`,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      },
      [`.${prefixCls}-image > svg`]: {
        height: '100%',
        'max-width': '100%',
      },
      [`.${prefixCls}-image > img`]: {
        height: '100%',
        'max-width': '100%',
        'object-fit': 'contain',
      },
      [`.${prefixCls}-description`]: {
        color: t.colorTextSecondary,
      },
      [`.${prefixCls}-footer`]: {
        'margin-top': `${t.margin}px`,
      },
    }
  })
}
