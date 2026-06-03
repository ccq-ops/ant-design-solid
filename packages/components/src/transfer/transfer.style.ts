import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useTransferStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Transfer', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.paddingSM}px`,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-disabled`]: { color: t.colorTextDisabled },
        [`.${prefixCls}-panel`]: {
          width: '200px',
          height: '260px',
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          display: 'flex',
          'flex-direction': 'column',
        },
        [`.${prefixCls}-header`]: {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          'border-bottom': `${t.lineWidth}px solid ${t.colorBorder}`,
          'font-weight': '600',
        },
        [`.${prefixCls}-search`]: {
          margin: `${t.marginXS}px`,
          padding: `${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-list`]: {
          flex: '1',
          margin: '0',
          padding: `${t.paddingXS}px 0`,
          'list-style': 'none',
          overflow: 'auto',
        },
        [`.${prefixCls}-item`]: {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          cursor: 'pointer',
        },
        [`.${prefixCls}-item:hover`]: { background: t.colorFillAlter },
        [`.${prefixCls}-item-selected`]: { color: t.colorPrimary, background: t.colorFillAlter },
        [`.${prefixCls}-item-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
        [`.${prefixCls}-item-disabled:hover`]: { background: 'transparent' },
        [`.${prefixCls}-item-title`]: { display: 'block' },
        [`.${prefixCls}-item-description`]: {
          display: 'block',
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize - 2}px`,
        },
        [`.${prefixCls}-operations`]: {
          display: 'inline-flex',
          'flex-direction': 'column',
          gap: `${t.paddingXS}px`,
        },
        [`.${prefixCls}-operation`]: {
          border: '0',
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorPrimary,
          color: '#fff',
          cursor: 'pointer',
        },
        [`.${prefixCls}-operation:disabled`]: {
          background: t.colorFillAlter,
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
        },
      }
    },
  )
}
