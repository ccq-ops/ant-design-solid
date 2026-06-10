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
      [`.${prefixCls}-container`]: {
        width: '100%',
      },
      [`.${prefixCls}-title, .${prefixCls}-footer`]: {
        padding: table.cellPadding,
        background: t.colorBgContainer,
        borderBottom: `${t.lineWidth}px solid ${table.borderColor}`,
      },
      [`.${prefixCls}-footer`]: {
        borderBottom: 0,
      },
      [`.${prefixCls} th`]: {
        padding: table.cellPadding,
        color: table.headerColor,
        'font-weight': 600,
        'text-align': 'start',
        background: table.headerBg,
        borderBottom: `${t.lineWidth}px solid ${table.borderColor}`,
      },
      [`.${prefixCls}-column-title`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'vertical-align': 'middle',
      },
      [`.${prefixCls}-column-actions`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: 4,
        'margin-inline-start': 6,
        'vertical-align': 'middle',
      },
      [`.${prefixCls}-column-action`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        width: 18,
        height: 18,
        padding: 0,
        border: 0,
        color: t.colorTextSecondary,
        background: 'transparent',
        cursor: 'pointer',
        'line-height': 1,
        transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-column-action:hover`]: {
        color: t.colorText,
      },
      [`.${prefixCls}-sorter`]: {
        'flex-direction': 'column',
        gap: 0,
      },
      [`.${prefixCls}-sorter-icon`]: {
        display: 'block',
        height: 7,
        'font-size': 8,
        'line-height': '7px',
        transform: 'scaleX(0.9)',
      },
      [`.${prefixCls}-sorter-icon-active, .${prefixCls}-sorter-active`]: {
        color: t.colorPrimary,
      },
      [`.${prefixCls}-filter-trigger`]: {
        width: 'auto',
        'min-width': 18,
        padding: '0 4px',
        'font-size': t.fontSize,
      },
      [`.${prefixCls}-filter-trigger-active`]: {
        color: t.colorPrimary,
      },
      [`.${prefixCls}-filter-dropdown`]: {
        position: 'absolute',
        'z-index': 1,
        'margin-top': 4,
        padding: 8,
        color: t.colorText,
        background: t.colorBgElevated,
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        'border-radius': t.borderRadius,
        'box-shadow': t.boxShadow,
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
      [`.${prefixCls}-selection-column, .${prefixCls}-expand-column`]: {
        width: 48,
        'text-align': 'center !important',
      },
      [`.${prefixCls}-expand-icon`]: {
        width: 22,
        height: 22,
        padding: 0,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
        color: t.colorText,
        background: t.colorBgContainer,
        cursor: 'pointer',
        'line-height': 1,
      },
      [`.${prefixCls}-expanded-row td`]: {
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-cell-center`]: { 'text-align': 'center !important' },
      [`.${prefixCls}-cell-right`]: { 'text-align': 'right !important' },
      [`.${prefixCls}-cell-ellipsis`]: {
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
      },
      [`.${prefixCls}-empty`]: { color: table.emptyColor, 'text-align': 'center' },
      [`.${prefixCls}-pagination`]: {
        display: 'flex',
        'justify-content': 'flex-end',
        'margin-top': t.marginSM,
      },
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
