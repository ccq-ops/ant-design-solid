import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useFormStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Form', prefixCls] }, () => {
    const formToken = getComponentToken('Form', token())
    return {
      [`.${prefixCls}`]: {
        'font-family': token().fontFamily,
        'font-size': token().fontSize,
        color: token().colorText,
      },
      [`.${prefixCls}-item`]: { 'margin-bottom': formToken.itemMarginBottom },
      [`.${prefixCls}-item-label`]: {
        color: formToken.labelColor,
        'margin-bottom': formToken.verticalLabelPadding,
      },
      [`.${prefixCls}-item-required`]: {
        color: formToken.labelRequiredMarkColor,
        'margin-inline-end': 4,
      },
      [`.${prefixCls}-item-explain-error`]: {
        color: formToken.explainColor,
        'font-size': 12,
        'margin-top': 4,
      },
    }
  })
}
