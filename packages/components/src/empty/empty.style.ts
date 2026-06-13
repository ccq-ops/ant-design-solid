import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useEmptyStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Empty', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        'margin-inline': `${t.marginXS}px`,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'text-align': 'center',
      },
      [`.${prefixCls}-image`]: {
        height: `${t.controlHeightLG * 2.5}px`,
        'margin-bottom': `${t.marginXS}px`,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        opacity: t.opacityImage,
      },
      [`.${prefixCls}-image > svg`]: {
        height: '100%',
        'max-width': '100%',
        margin: 'auto',
      },
      [`.${prefixCls}-image > img`]: {
        height: '100%',
        'max-width': '100%',
        'object-fit': 'contain',
      },
      [`.${prefixCls}-description`]: {
        color: t.colorTextDescription,
      },
      [`.${prefixCls}-footer`]: {
        'margin-top': `${t.margin}px`,
      },
      [`.${prefixCls}-normal`]: {
        'margin-block': `${t.marginXL}px`,
        color: t.colorTextDescription,
      },
      [`.${prefixCls}-normal .${prefixCls}-description`]: {
        color: t.colorTextDescription,
      },
      [`.${prefixCls}-normal .${prefixCls}-image`]: {
        height: `${t.controlHeightLG}px`,
      },
      [`.${prefixCls}-small`]: {
        'margin-block': `${t.marginXS}px`,
        color: t.colorTextDescription,
      },
      [`.${prefixCls}-small .${prefixCls}-image`]: {
        height: `${t.controlHeightLG * 0.875}px`,
      },
    }
  })
}
