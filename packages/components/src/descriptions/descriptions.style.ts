import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useDescriptionsStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Descriptions', prefixCls] },
    () => {
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
        },
        [`.${prefixCls}-header`]: {
          display: 'flex',
          'align-items': 'center',
          'margin-bottom': `${t.margin}px`,
        },
        [`.${prefixCls}-title`]: {
          flex: 1,
          color: t.colorText,
          'font-weight': 600,
          'font-size': `${t.fontSize + 2}px`,
        },
        [`.${prefixCls}-extra`]: {
          'margin-inline-start': `${t.margin}px`,
          color: t.colorText,
        },
        [`.${prefixCls}-view`]: {
          width: '100%',
          overflow: 'hidden',
        },
        [`.${prefixCls}-table`]: {
          width: '100%',
          'table-layout': 'fixed',
          'border-collapse': 'collapse',
        },
        [`.${prefixCls}-item`]: {
          'padding-bottom': `${t.padding}px`,
          'vertical-align': 'top',
        },
        [`.${prefixCls}-item-label`]: {
          color: t.colorTextSecondary,
          'font-weight': 400,
          'white-space': 'nowrap',
        },
        [`.${prefixCls}-item-label::after`]: {
          content: '":"',
          position: 'relative',
          top: '-0.5px',
          margin: '0 8px 0 2px',
        },
        [`.${prefixCls}-item-content`]: {
          display: 'inline-block',
          color: t.colorText,
        },
        [`.${prefixCls}-vertical .${prefixCls}-item-label`]: {
          display: 'table-cell',
          'padding-bottom': `${t.paddingXS}px`,
        },
        [`.${prefixCls}-vertical .${prefixCls}-item-label::after`]: {
          display: 'none',
        },
        [`.${prefixCls}-vertical .${prefixCls}-item-content`]: {
          display: 'table-cell',
        },
        [`.${prefixCls}-middle .${prefixCls}-item`]: {
          'padding-bottom': `${t.paddingSM}px`,
        },
        [`.${prefixCls}-small .${prefixCls}-item`]: {
          'padding-bottom': `${t.paddingXS}px`,
        },
        [`.${prefixCls}-bordered .${prefixCls}-view`]: {
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-bordered .${prefixCls}-item`]: {
          padding: 0,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-bordered .${prefixCls}-item-label`]: {
          display: 'table-cell',
          padding: `${t.paddingSM}px ${t.padding}px`,
          color: t.colorTextSecondary,
          background: t.colorFillAlter,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-bordered .${prefixCls}-item-label::after`]: {
          display: 'none',
        },
        [`.${prefixCls}-bordered .${prefixCls}-item-content`]: {
          display: 'table-cell',
          padding: `${t.paddingSM}px ${t.padding}px`,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-bordered.${prefixCls}-middle .${prefixCls}-item-label, .${prefixCls}-bordered.${prefixCls}-middle .${prefixCls}-item-content`]:
          {
            padding: `${t.paddingXS}px ${t.paddingSM}px`,
          },
        [`.${prefixCls}-bordered.${prefixCls}-small .${prefixCls}-item-label, .${prefixCls}-bordered.${prefixCls}-small .${prefixCls}-item-content`]:
          {
            padding: `${Math.max(2, Math.floor(t.paddingXS / 2))}px ${t.paddingXS}px`,
          },
      }
    },
  )
}
