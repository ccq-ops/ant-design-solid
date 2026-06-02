import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useTableStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Table', prefixCls] }, () => {
    const t = token()
    const table = getComponentToken('Table', t)
    return {
      [`.${prefixCls}-wrapper`]: {
        position: 'relative',
        width: '100%',
        color: t.colorText,
        'font-size': t.fontSize,
        'font-family': t.fontFamily,
      },
      [`.${prefixCls}`]: {
        width: '100%',
        'border-collapse': 'separate',
        'border-spacing': 0,
        background: t.colorBgContainer,
      },
      [`.${prefixCls} th`]: {
        padding: table.cellPadding,
        color: table.headerColor,
        'font-weight': 600,
        'text-align': 'start',
        background: table.headerBg,
        borderBottom: `${t.lineWidth}px solid ${table.borderColor}`,
      },
      [`.${prefixCls} td`]: {
        padding: table.cellPadding,
        borderBottom: `${t.lineWidth}px solid ${table.borderColor}`,
        transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls} tbody tr:hover td`]: { background: table.rowHoverBg },
      [`.${prefixCls}-small th, .${prefixCls}-small td`]: { padding: table.cellPaddingSm },
      [`.${prefixCls}-large th, .${prefixCls}-large td`]: { padding: table.cellPaddingLg },
      [`.${prefixCls}-bordered .${prefixCls}`]: {
        border: `${t.lineWidth}px solid ${table.borderColor}`,
        'border-radius': table.borderRadius,
        overflow: 'hidden',
      },
      [`.${prefixCls}-bordered th, .${prefixCls}-bordered td`]: {
        borderInlineEnd: `${t.lineWidth}px solid ${table.borderColor}`,
      },
      [`.${prefixCls}-bordered th:last-child, .${prefixCls}-bordered td:last-child`]: {
        borderInlineEnd: 0,
      },
      [`.${prefixCls}-cell-center`]: { 'text-align': 'center !important' },
      [`.${prefixCls}-cell-right`]: { 'text-align': 'right !important' },
      [`.${prefixCls}-empty`]: { color: table.emptyColor, 'text-align': 'center' },
      [`.${prefixCls}-loading-indicator`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        color: t.colorTextSecondary,
        background: 'rgba(255, 255, 255, 0.65)',
      },
    }
  })
}
