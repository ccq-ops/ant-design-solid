import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
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
        display: 'flex',
        'justify-content': 'flex-start',
        height: 'auto',
        margin: formToken.verticalLabelMargin,
        padding: `0 0 ${formToken.verticalLabelPadding}px`,
        'text-align': 'left',
        'white-space': 'initial',
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
        display: 'flex',
        'justify-content': 'flex-start',
        height: 'auto',
        margin: formToken.verticalLabelMargin,
        padding: `0 0 ${formToken.verticalLabelPadding}px`,
        'text-align': 'left',
        'white-space': 'initial',
      },
      [`.${prefixCls}-horizontal .${prefixCls}-item`]: {
        display: 'flex',
        'align-items': 'flex-start',
        gap: 0,
      },
      [`.${prefixCls}-horizontal .${prefixCls}-item-label`]: {
        display: 'inline-flex',
        'align-items': 'center',
        height: formToken.labelHeight,
        'margin-bottom': 0,
      },
      [`.${prefixCls}-inline`]: {
        display: 'flex',
        'flex-wrap': 'wrap',
        gap: 12,
      },
      [`.${prefixCls}-inline .${prefixCls}-item`]: {
        display: 'flex',
        'align-items': 'flex-start',
        'margin-bottom': formToken.inlineItemMarginBottom,
      },
      [`.${prefixCls}-inline .${prefixCls}-item-label`]: {
        display: 'inline-flex',
        'align-items': 'center',
        height: formToken.labelHeight,
        'margin-bottom': 0,
      },
      [`.${prefixCls}-item`]: { 'margin-bottom': formToken.itemMarginBottom },
      [`.${prefixCls}-item-hidden`]: {
        display: 'none',
      },
      [`.${prefixCls}-item-label`]: {
        color: formToken.labelColor,
        'font-size': formToken.labelFontSize,
        'white-space': 'nowrap',
      },
      [`.${prefixCls}-item-label-wrap`]: {
        'white-space': 'normal',
      },
      [`.${prefixCls}-item-label-wrap .${prefixCls}-item-label-content`]: {
        'vertical-align': 'middle',
        'text-wrap': 'balance',
      },
      [`.${prefixCls}-item-label.${prefixCls}-item-required::before`]: {
        display: 'inline-block',
        'margin-inline-end': t.marginXS / 2,
        color: formToken.labelRequiredMarkColor,
        'font-size': formToken.labelFontSize,
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
        'margin-inline-start': formToken.labelColonMarginInlineStart,
        'margin-inline-end': formToken.labelColonMarginInlineEnd,
      },
      [`.${prefixCls}-item-optional`]: {
        color: t.colorTextDescription,
        'font-size': formToken.labelFontSize,
        'margin-inline-start': t.marginXXS,
      },
      [`.${prefixCls}-item-tooltip`]: {
        color: t.colorTextDescription,
        cursor: 'help',
        'margin-inline-start': t.marginXXS,
      },
      [`.${prefixCls}-item-control`]: {
        flex: 1,
      },
      [`.${prefixCls}-item-control-input`]: {
        display: 'flex',
        'align-items': 'center',
        'min-height': t.controlHeight,
      },
      [`.${prefixCls}-item-feedback-icon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'font-size': formToken.feedbackIconSize,
        'margin-inline-start': formToken.feedbackIconMarginInlineStart,
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
        color: formToken.extraColor,
        'font-size': 12,
        'margin-top': 4,
      },
    }
  })
}
