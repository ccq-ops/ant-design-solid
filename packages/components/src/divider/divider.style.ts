import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useDividerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Divider', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'border-block-start': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-horizontal`]: {
        display: 'flex',
        clear: 'both',
        width: '100%',
        'min-width': '100%',
        margin: `${t.marginLG}px 0`,
        '&::before, &::after': {
          position: 'relative',
          width: '50%',
          'border-block-start': `${t.lineWidth}px solid transparent`,
          'border-block-start-color': 'inherit',
          transform: 'translateY(50%)',
          content: '""',
        },
      },
      [`.${prefixCls}-horizontal.${prefixCls}-with-text`]: {
        display: 'flex',
        'align-items': 'center',
        margin: `${t.marginLG}px 0`,
        color: t.colorText,
        'font-weight': 500,
        'font-size': `${t.fontSize + 2}px`,
        'white-space': 'nowrap',
        'text-align': 'center',
        border: 0,
      },
      [`.${prefixCls}-inner-text`]: { display: 'inline-block', padding: `0 ${t.padding}px` },
      [`.${prefixCls}-with-text-left::before`]: { width: '5%' },
      [`.${prefixCls}-with-text-left::after`]: { width: '95%' },
      [`.${prefixCls}-with-text-right::before`]: { width: '95%' },
      [`.${prefixCls}-with-text-right::after`]: { width: '5%' },
      [`.${prefixCls}-plain.${prefixCls}-with-text`]: {
        color: t.colorText,
        'font-weight': 400,
        'font-size': `${t.fontSize}px`,
      },
      [`.${prefixCls}-vertical`]: {
        position: 'relative',
        top: '-0.06em',
        display: 'inline-block',
        height: '0.9em',
        margin: `0 ${t.marginXS}px`,
        'vertical-align': 'middle',
        'border-block-start': 0,
        'border-inline-start': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-dashed`]: {
        'border-block-start-style': 'dashed',
        '&::before, &::after': { 'border-block-start-style': 'dashed' },
      },
      [`.${prefixCls}-vertical.${prefixCls}-dashed`]: { 'border-inline-start-style': 'dashed' },
    }
  })
}
