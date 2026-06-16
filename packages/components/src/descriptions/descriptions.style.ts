import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'
import { getComponentToken } from '@solid-ant-design/theme'

export function useDescriptionsStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Descriptions', prefixCls] },
    () => {
      const t = token()
      const componentToken = getComponentToken('Descriptions', t)
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
          'margin-bottom': `${componentToken.titleMarginBottom}px`,
        },
        [`.${prefixCls}-title`]: {
          flex: 1,
          color: t.colorText,
          'font-weight': 600,
          'font-size': `${t.fontSize + 2}px`,
        },
        [`.${prefixCls}-extra`]: {
          'margin-inline-start': `${t.margin}px`,
          color: componentToken.extraColor,
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
          'padding-bottom': `${componentToken.itemPaddingBottom}px`,
          'vertical-align': 'top',
        },
        [`.${prefixCls}-item-label`]: {
          color: componentToken.labelColor,
          'font-weight': 400,
          'white-space': 'nowrap',
        },
        [`.${prefixCls}-item-label::after`]: {
          content: '":"',
          position: 'relative',
          top: '-0.5px',
          'margin-inline-start': `${componentToken.colonMarginInlineStart}px`,
          'margin-inline-end': `${componentToken.colonMarginInlineEnd}px`,
        },
        [`.${prefixCls}-item-no-colon::after`]: {
          content: '""',
          margin: 0,
        },
        [`.${prefixCls}-item-content`]: {
          display: 'inline-block',
          color: componentToken.contentColor,
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
        [`.${prefixCls}-medium .${prefixCls}-item`]: {
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
          padding: `${componentToken.cellPaddingBlock}px ${componentToken.cellPaddingInline}px`,
          color: componentToken.labelColor,
          background: componentToken.labelBg,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-bordered .${prefixCls}-item-label::after`]: {
          display: 'none',
        },
        [`.${prefixCls}-bordered .${prefixCls}-item-content`]: {
          display: 'table-cell',
          padding: `${componentToken.cellPaddingBlock}px ${componentToken.cellPaddingInline}px`,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-bordered.${prefixCls}-medium .${prefixCls}-item-label, .${prefixCls}-bordered.${prefixCls}-medium .${prefixCls}-item-content`]:
          {
            padding: `${componentToken.cellPaddingBlockMD}px ${componentToken.cellPaddingInlineMD}px`,
          },
        [`.${prefixCls}-bordered.${prefixCls}-small .${prefixCls}-item-label, .${prefixCls}-bordered.${prefixCls}-small .${prefixCls}-item-content`]:
          {
            padding: `${componentToken.cellPaddingBlockSM}px ${componentToken.cellPaddingInlineSM}px`,
          },
      }
    },
  )
}
