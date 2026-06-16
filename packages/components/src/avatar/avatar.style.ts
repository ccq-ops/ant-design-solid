import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useAvatarStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Avatar', prefixCls] }, () => {
    const t = token()
    const avatar = getComponentToken('Avatar', t)
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
        'font-size': `${avatar.textFontSize}px`,
        'font-family': t.fontFamily,
        'font-weight': 400,
        'white-space': 'nowrap',
        'text-align': 'center',
        background: t.colorTextPlaceholder,
        border: `${t.lineWidth}px ${t.lineType} transparent`,
        width: `${avatar.containerSize}px`,
        height: `${avatar.containerSize}px`,
        'vertical-align': 'middle',
      },
      [`.${prefixCls}-circle`]: {
        'border-radius': '50%',
      },
      [`.${prefixCls}-square`]: {
        'border-radius': `${t.borderRadius}px`,
      },
      [`.${prefixCls}-sm`]: {
        width: `${avatar.containerSizeSM}px`,
        height: `${avatar.containerSizeSM}px`,
        'font-size': `${avatar.textFontSizeSM}px`,
      },
      [`.${prefixCls}-sm.${prefixCls}-icon`]: {
        'font-size': `${avatar.iconFontSizeSM}px`,
      },
      [`.${prefixCls}-lg`]: {
        width: `${avatar.containerSizeLG}px`,
        height: `${avatar.containerSizeLG}px`,
        'font-size': `${avatar.textFontSizeLG}px`,
      },
      [`.${prefixCls}-lg.${prefixCls}-icon`]: {
        'font-size': `${avatar.iconFontSizeLG}px`,
      },
      [`.${prefixCls}-image`]: {
        background: 'transparent',
      },
      [`.${prefixCls}-icon`]: {
        'font-size': `${avatar.iconFontSize}px`,
      },
      [`.${prefixCls} > img`]: {
        display: 'block',
        width: '100%',
        height: '100%',
        'object-fit': 'cover',
      },
      [`.${prefixCls}-string`]: {
        position: 'absolute',
        left: '50%',
        'transform-origin': '0 center',
      },
      [`.${prefixCls}-string:not([style*="scale"])`]: {
        transform: 'scale(1)',
      },
      [`.${prefixCls}-string`]: {
        'transform-origin': '0 center',
      },
      [`.${prefixCls}-group`]: {
        display: 'inline-flex',
        'align-items': 'center',
      },
      [`.${prefixCls}-group > .${prefixCls}`]: {
        'border-color': avatar.groupBorderColor,
      },
      [`.${prefixCls}-group > *:not(:first-child)`]: {
        'margin-inline-start': `${avatar.groupOverlapping}px`,
      },
      [`.${prefixCls}-group-popover .${prefixCls} + .${prefixCls}`]: {
        'margin-inline-start': `${avatar.groupSpace}px`,
      },
      [`.${prefixCls}-group > .${prefixCls}-overflow`]: {
        color: t.colorText,
        background: t.colorFillAlter,
      },
    }
  })
}
