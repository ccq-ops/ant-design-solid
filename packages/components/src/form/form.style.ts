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
        'align-items': 'flex-start',
      },
      [`.${prefixCls}-vertical .${prefixCls}-item-label`]: {
        height: 'auto',
        margin: 0,
        padding: `0 0 ${formToken.verticalLabelPadding}px`,
        'text-align': 'left',
      },
      [`.${prefixCls}-vertical .${prefixCls}-item-label-colon .${prefixCls}-item-label-content::after`]:
        {
          visibility: 'hidden',
        },
      [`.${prefixCls}-item-vertical`]: {
        display: 'block',
        'align-items': 'flex-start',
      },
      [`.${prefixCls}-item-vertical .${prefixCls}-item-label`]: {
        height: 'auto',
        margin: 0,
        padding: `0 0 ${formToken.verticalLabelPadding}px`,
        'text-align': 'left',
      },
      [`.${prefixCls}-horizontal .${prefixCls}-item`]: {
        display: 'flex',
        'align-items': 'flex-start',
        gap: 0,
      },
      [`.${prefixCls}-horizontal .${prefixCls}-item-label`]: {
        display: 'inline-flex',
        'align-items': 'center',
        height: t.controlHeight,
        'margin-bottom': 0,
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
        'white-space': 'nowrap',
      },
      [`.${prefixCls}-item-label-wrap`]: {
        'white-space': 'normal',
      },
      [`.${prefixCls}-item-label.${prefixCls}-item-required::before`]: {
        display: 'inline-block',
        'margin-inline-end': t.marginXS / 2,
        color: formToken.labelRequiredMarkColor,
        'font-size': t.fontSize,
        'font-family': 'sans-serif',
        'line-height': 1,
        content: '"*"',
      },
      [`.${prefixCls}-item-label.${prefixCls}-item-required.${prefixCls}-item-required-mark-hidden::before, .${prefixCls}-item-label.${prefixCls}-item-required.${prefixCls}-item-required-mark-optional::before`]:
        {
          display: 'none',
        },
      [`.${prefixCls}-item-label-left`]: {
        'text-align': 'left',
      },
      [`.${prefixCls}-item-label-right`]: {
        'text-align': 'right',
      },
      [`.${prefixCls}-item-label-colon .${prefixCls}-item-label-content::after`]: {
        content: '":"',
        'margin-inline-start': t.marginXS / 4,
        'margin-inline-end': t.marginXS,
      },
      [`.${prefixCls}-item-optional`]: {
        color: t.colorTextSecondary,
        'font-size': 12,
        'margin-inline-start': 4,
      },
      [`.${prefixCls}-item-control`]: {
        flex: 1,
      },
      [`.${prefixCls}-item-control-input`]: {
        display: 'flex',
        'align-items': 'center',
        gap: t.marginXS,
      },
      [`.${prefixCls}-item-feedback-icon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'line-height': 1,
      },
      [`.${prefixCls}-item-feedback-icon-success`]: {
        color: t.colorSuccess,
      },
      [`.${prefixCls}-item-feedback-icon-warning`]: {
        color: t.colorWarning,
      },
      [`.${prefixCls}-item-feedback-icon-error`]: {
        color: t.colorError,
      },
      [`.${prefixCls}-item-feedback-icon-validating`]: {
        color: t.colorPrimary,
      },
      [`.${prefixCls}-item-explain`]: {
        'font-size': 12,
        'margin-top': 4,
      },
      [`.${prefixCls}-item-explain-item + .${prefixCls}-item-explain-item`]: {
        'margin-top': 2,
      },
      [`.${prefixCls}-item-explain-error`]: {
        color: formToken.explainColor,
      },
      [`.${prefixCls}-item-explain-warning`]: {
        color: t.colorWarning,
      },
      [`.${prefixCls}-item-extra`]: {
        color: t.colorTextDescription,
        'font-size': 12,
        'margin-top': 4,
      },
    }
  })
}
