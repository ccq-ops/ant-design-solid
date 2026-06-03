import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useCalendarStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Calendar', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          background: t.colorBgContainer,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-fullscreen`]: {
          width: '100%',
        },
        [`.${prefixCls}-mini`]: {
          width: '320px',
        },
        [`.${prefixCls}-header`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: `${t.marginXS}px`,
          padding: `${t.paddingSM}px`,
          'border-bottom': `${t.lineWidth}px solid ${t.colorBorder}`,
        },
        [`.${prefixCls}-title`]: {
          'font-weight': '600',
        },
        [`.${prefixCls}-header-actions`]: {
          display: 'inline-flex',
          gap: `${t.marginXS}px`,
          'align-items': 'center',
        },
        [`.${prefixCls}-button`]: {
          height: '28px',
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          color: t.colorText,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
        },
        [`.${prefixCls}-button:hover`]: {
          color: t.colorPrimary,
          'border-color': t.colorPrimary,
        },
        [`.${prefixCls}-button-active`]: {
          color: t.colorBgContainer,
          background: t.colorPrimary,
          'border-color': t.colorPrimary,
        },
        [`.${prefixCls}-body`]: {
          padding: `${t.paddingSM}px`,
        },
        [`.${prefixCls}-weekdays`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(7, 1fr)',
          'margin-bottom': `${t.marginXS}px`,
        },
        [`.${prefixCls}-weekday`]: {
          color: t.colorTextSecondary,
          'text-align': 'center',
          'line-height': '28px',
        },
        [`.${prefixCls}-date-grid`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(7, 1fr)',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-year-grid`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(3, 1fr)',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-cell`]: {
          minHeight: '64px',
          width: '100%',
          padding: `${t.paddingXS}px`,
          border: `${t.lineWidth}px solid transparent`,
          'border-radius': `${t.borderRadius}px`,
          background: 'transparent',
          color: t.colorText,
          cursor: 'pointer',
          'text-align': 'left',
          'font-size': `${t.fontSize}px`,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-mini .${prefixCls}-cell`]: {
          minHeight: '42px',
          'text-align': 'center',
        },
        [`.${prefixCls}-cell:hover`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-cell-selected`]: {
          border: `${t.lineWidth}px solid ${t.colorPrimary}`,
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-cell-today`]: {
          color: t.colorPrimary,
          'font-weight': '600',
        },
        [`.${prefixCls}-cell-disabled`]: {
          color: t.colorTextDisabled,
          background: 'transparent',
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-cell-disabled:hover`]: {
          background: 'transparent',
        },
        [`.${prefixCls}-cell-outside`]: {
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-date-value`]: {
          display: 'block',
          'line-height': '20px',
        },
        [`.${prefixCls}-cell-content`]: {
          'margin-top': `${t.marginXS}px`,
          color: t.colorTextSecondary,
          'font-size': `${Math.max(t.fontSize - 2, 10)}px`,
        },
      }
    },
  )
}
