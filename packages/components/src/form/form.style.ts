import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useFormStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Form', prefixCls] }, () => {
    const t = token()
    const formToken = getComponentToken('Form', t)
    return {
      [`.${prefixCls}`]: {
        'font-family': t.fontFamily,
        'font-size': t.fontSize,
        color: t.colorText,
      },
      [`.${prefixCls}-vertical .${prefixCls}-item`]: {
        display: 'block',
      },
      [`.${prefixCls}-horizontal .${prefixCls}-item`]: {
        display: 'flex',
        gap: 12,
      },
      [`.${prefixCls}-inline`]: {
        display: 'flex',
        'flex-wrap': 'wrap',
        gap: 12,
      },
      [`.${prefixCls}-inline .${prefixCls}-item`]: {
        display: 'flex',
        'margin-bottom': 0,
      },
      [`.${prefixCls}-item`]: { 'margin-bottom': formToken.itemMarginBottom },
      [`.${prefixCls}-item-hidden`]: {
        display: 'none',
      },
      [`.${prefixCls}-item-label`]: {
        color: formToken.labelColor,
        'margin-bottom': formToken.verticalLabelPadding,
        'white-space': 'nowrap',
      },
      [`.${prefixCls}-item-label-left`]: {
        'text-align': 'left',
      },
      [`.${prefixCls}-item-label-right`]: {
        'text-align': 'right',
      },
      [`.${prefixCls}-item-label-colon .${prefixCls}-item-label-content::after`]: {
        content: '":"',
      },
      [`.${prefixCls}-item-required`]: {
        color: formToken.labelRequiredMarkColor,
        'margin-inline-start': 4,
      },
      [`.${prefixCls}-item-optional`]: {
        color: t.colorTextSecondary,
        'font-size': 12,
        'margin-inline-start': 4,
      },
      [`.${prefixCls}-item-control`]: {
        flex: 1,
      },
      [`.${prefixCls}-item-explain`]: {
        'font-size': 12,
        'margin-top': 4,
      },
      [`.${prefixCls}-item-explain-error`]: {
        color: formToken.explainColor,
      },
      [`.${prefixCls}-item-explain-warning`]: {
        color: t.colorWarning,
      },
    }
  })
}
