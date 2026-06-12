import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'
export function useSpaceStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Space', prefixCls] }, () => {
    const st = getComponentToken('Space', token())
    return {
      [`.${prefixCls}`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: `${st.gapSmall}px`,
      },
      [`.${prefixCls}-vertical`]: { 'flex-direction': 'column', 'align-items': 'stretch' },
      [`.${prefixCls}-wrap`]: { 'flex-wrap': 'wrap' },
      [`.${prefixCls}-item`]: { display: 'inline-flex' },
      [`.${prefixCls}-split`]: { color: token().colorTextSecondary },
      [`.${prefixCls}-compact`]: {
        display: 'inline-flex',
        'align-items': 'stretch',
        'vertical-align': 'top',
      },
      [`.${prefixCls}-compact-block`]: {
        display: 'flex',
        width: '100%',
      },
      [`.${prefixCls}-compact-vertical`]: {
        'flex-direction': 'column',
      },
      [`.${prefixCls}-compact > *`]: {
        position: 'relative',
        margin: 0,
      },
      [`.${prefixCls}-compact > *:not(:first-child)`]: {
        'margin-left': '-1px',
      },
      [`.${prefixCls}-compact > *:not(:first-child):not(:last-child)`]: {
        'border-radius': 0,
      },
      [`.${prefixCls}-compact > *:first-child:not(:last-child)`]: {
        'border-top-right-radius': 0,
        'border-bottom-right-radius': 0,
      },
      [`.${prefixCls}-compact > *:last-child:not(:first-child)`]: {
        'border-top-left-radius': 0,
        'border-bottom-left-radius': 0,
      },
      [`.${prefixCls}-compact > *:hover, .${prefixCls}-compact > *:focus, .${prefixCls}-compact > *:focus-within`]:
        {
          'z-index': 1,
        },
      [`.${prefixCls}-compact-vertical > *:not(:first-child)`]: {
        'margin-left': 0,
        'margin-top': '-1px',
      },
      [`.${prefixCls}-compact-vertical > *:first-child:not(:last-child)`]: {
        'border-top-right-radius': `${token().borderRadius}px`,
        'border-bottom-left-radius': 0,
        'border-bottom-right-radius': 0,
      },
      [`.${prefixCls}-compact-vertical > *:last-child:not(:first-child)`]: {
        'border-top-left-radius': 0,
        'border-top-right-radius': 0,
        'border-bottom-left-radius': `${token().borderRadius}px`,
      },
      [`.${prefixCls}-compact-addon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        padding: `0 ${token().paddingSM}px`,
        color: token().colorText,
        background: token().colorFillAlter,
        border: `1px solid ${token().colorBorder}`,
        'font-size': `${token().fontSize}px`,
        'line-height': `${token().lineHeight}`,
        'white-space': 'nowrap',
      },
      [`.${prefixCls}-compact-sm .${prefixCls}-compact-addon`]: {
        padding: `0 ${token().paddingXS}px`,
        'font-size': `${Math.max(12, token().fontSize - 2)}px`,
      },
      [`.${prefixCls}-compact-lg .${prefixCls}-compact-addon`]: {
        padding: `0 ${token().padding}px`,
        'font-size': `${token().fontSize + 2}px`,
      },
    }
  })
}
