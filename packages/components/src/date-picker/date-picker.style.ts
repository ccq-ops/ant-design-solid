import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useDatePickerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['DatePicker', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          position: 'relative',
          display: 'inline-block',
          width: '160px',
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-selector`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: `${t.paddingXS}px`,
          width: '100%',
          height: `${t.controlHeight}px`,
          padding: `0 ${t.paddingSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          cursor: 'pointer',
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-open .${prefixCls}-selector`]: {
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorFillAlter}`,
        },
        [`.${prefixCls}-disabled .${prefixCls}-selector`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-input`]: {
          flex: '1 1 auto',
          minWidth: '0',
          border: '0',
          outline: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          cursor: 'inherit',
        },
        [`.${prefixCls}-input::placeholder`]: {
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-input:disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-placeholder`]: {
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-selection-item`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-clear`]: {
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorTextDisabled,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-clear:hover`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-dropdown`]: {
          width: '280px',
          marginTop: `${t.marginXS}px`,
          padding: `${t.paddingSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          'box-shadow': t.boxShadow,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-header`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          'margin-bottom': `${t.marginXS}px`,
        },
        [`.${prefixCls}-month-label`]: {
          'font-weight': '600',
          'line-height': '1.5',
        },
        [`.${prefixCls}-month-button`]: {
          width: '28px',
          height: '28px',
          border: '0',
          'border-radius': `${t.borderRadius}px`,
          background: 'transparent',
          color: t.colorText,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-month-button:hover`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-weekdays`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(7, 1fr)',
          'margin-bottom': `${t.marginXS}px`,
        },
        [`.${prefixCls}-weekday`]: {
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
          'line-height': '28px',
          'text-align': 'center',
        },
        [`.${prefixCls}-grid`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(7, 1fr)',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-cell`]: {
          width: '100%',
          height: '32px',
          border: '0',
          'border-radius': `${t.borderRadius}px`,
          background: 'transparent',
          color: t.colorText,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-cell:hover`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-cell-selected`]: {
          color: t.colorBgContainer,
          background: t.colorPrimary,
          'font-weight': '600',
        },
        [`.${prefixCls}-cell-selected:hover`]: {
          background: t.colorPrimary,
        },
        [`.${prefixCls}-cell-today`]: {
          border: `${t.lineWidth}px solid ${t.colorPrimary}`,
        },
        [`.${prefixCls}-cell-disabled`]: {
          color: t.colorTextDisabled,
          background: 'transparent',
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-cell-disabled:hover`]: {
          background: 'transparent',
        },
        [`.${prefixCls}-empty-cell`]: {
          minHeight: '32px',
        },
      }
    },
  )
}
