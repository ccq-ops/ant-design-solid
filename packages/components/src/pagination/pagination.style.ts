import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function usePaginationStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Pagination', prefixCls] },
    () => {
      const t = token()
      const itemSize = t.controlHeightSM
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          display: 'flex',
          'align-items': 'center',
          'flex-wrap': 'wrap',
          gap: `${t.marginXS}px`,
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
        },
        [`.${prefixCls}-disabled`]: {
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-list`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
          margin: 0,
          padding: 0,
          'list-style': 'none',
        },
        [`.${prefixCls}-item-button`]: {
          'box-sizing': 'border-box',
          'min-width': `${itemSize}px`,
          height: `${itemSize}px`,
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': t.borderRadius,
          color: t.colorText,
          background: t.colorBgContainer,
          cursor: 'pointer',
          font: 'inherit',
          'text-align': 'center',
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-item-button:hover:not(:disabled)`]: {
          color: t.colorPrimaryHover,
          'border-color': t.colorPrimaryHover,
        },
        [`.${prefixCls}-item-active .${prefixCls}-item-button`]: {
          color: t.colorPrimary,
          'border-color': t.colorPrimary,
          'font-weight': 600,
        },
        [`.${prefixCls}-item-button:disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          'border-color': t.colorBorder,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-ellipsis`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'min-width': `${itemSize}px`,
          height: `${itemSize}px`,
          color: t.colorTextSecondary,
        },
        [`.${prefixCls}-simple`]: {
          gap: `${t.marginSM}px`,
        },
        [`.${prefixCls}-simple-pager`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-input`]: {
          'box-sizing': 'border-box',
          width: '56px',
          height: `${itemSize}px`,
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': t.borderRadius,
          color: t.colorText,
          background: t.colorBgContainer,
          font: 'inherit',
          'text-align': 'center',
        },
        [`.${prefixCls}-input:focus`]: {
          outline: 'none',
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorPrimaryHover}`,
        },
        [`.${prefixCls}-input:disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-select`]: {
          height: `${itemSize}px`,
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': t.borderRadius,
          color: t.colorText,
          background: t.colorBgContainer,
          font: 'inherit',
        },
        [`.${prefixCls}-select:disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-quick-jumper`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-total-text`]: {
          'margin-inline-end': `${t.marginXS}px`,
          color: t.colorTextSecondary,
        },
      }
    },
  )
}
