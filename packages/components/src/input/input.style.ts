import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'
import { loadingIconRotateKeyframes, loadingIconRotateStyle } from '../shared/loading-icon-style'
export function useInputStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Input', prefixCls] }, () => {
    const t = token()
    const it = getComponentToken('Input', t)
    return {
      ...loadingIconRotateKeyframes,
      [`.${prefixCls}-affix-wrapper`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'box-sizing': 'border-box',
        width: '100%',
        height: t.controlHeight,
        padding: `${it.paddingBlock}px ${it.paddingInline}px`,
        color: t.colorText,
        'font-size': it.inputFontSize,
        'font-family': t.fontFamily,
        background: t.colorBgContainer,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:hover': { borderColor: it.hoverBorderColor, background: it.hoverBg },
        '&:focus-within': {
          borderColor: it.activeBorderColor,
          background: it.activeBg,
          'box-shadow': it.activeShadow,
        },
      },
      [`.${prefixCls}`]: {
        flex: 1,
        width: '100%',
        minWidth: 0,
        height: '100%',
        padding: 0,
        color: 'inherit',
        'font-size': 'inherit',
        border: 0,
        outline: 0,
        background: 'transparent',
      },
      [`.${prefixCls}-sm`]: {
        height: t.controlHeightSM,
        padding: `${it.paddingBlockSM}px ${it.paddingInlineSM}px`,
        'font-size': it.inputFontSizeSM,
      },
      [`.${prefixCls}-lg`]: {
        height: t.controlHeightLG,
        padding: `${it.paddingBlockLG}px ${it.paddingInlineLG}px`,
        'font-size': it.inputFontSizeLG,
      },
      [`.${prefixCls}-status-error`]: { borderColor: t.colorError },
      [`.${prefixCls}-status-warning`]: { borderColor: t.colorWarning },
      [`.${prefixCls}-disabled`]: { color: t.colorTextDisabled, background: t.colorFillAlter },
      [`.${prefixCls}-variant-borderless`]: { borderColor: 'transparent', 'box-shadow': 'none' },
      [`.${prefixCls}-variant-filled`]: { background: t.colorFillAlter },
      [`.${prefixCls}-variant-underlined`]: {
        'border-top': 0,
        'border-inline-start': 0,
        'border-inline-end': 0,
        'border-radius': 0,
      },
      [`.${prefixCls}-prefix`]: { 'margin-inline-end': 8 },
      [`.${prefixCls}-suffix`]: { 'margin-inline-start': 8 },
      [`.${prefixCls}-suffix-wrapper`]: {
        display: 'inline-grid',
        'align-items': 'center',
        'justify-items': 'center',
        'margin-inline-start': 8,
      },
      [`.${prefixCls}-suffix-wrapper > .${prefixCls}-suffix, .${prefixCls}-suffix-wrapper > .${prefixCls}-clear`]:
        {
          'grid-area': '1 / 1',
          'margin-inline-start': 0,
        },
      [`.${prefixCls}-suffix-wrapper > .${prefixCls}-clear`]: {
        opacity: 0,
        'pointer-events': 'none',
      },
      [`.${prefixCls}-affix-wrapper:hover .${prefixCls}-suffix-wrapper > .${prefixCls}-suffix, .${prefixCls}-suffix-wrapper:focus-within > .${prefixCls}-suffix`]:
        {
          opacity: 0,
          'pointer-events': 'none',
        },
      [`.${prefixCls}-affix-wrapper:hover .${prefixCls}-suffix-wrapper > .${prefixCls}-clear, .${prefixCls}-suffix-wrapper:focus-within > .${prefixCls}-clear`]:
        {
          opacity: 1,
          'pointer-events': 'auto',
        },
      [`.${prefixCls}-clear, .${prefixCls}-search-icon, .${prefixCls}-password-icon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        width: 16,
        height: 16,
        border: 0,
        padding: 0,
        color: it.clearIconColor,
        'font-size': t.fontSize,
        'line-height': 1,
        background: 'transparent',
        'border-radius': '50%',
        cursor: 'pointer',
        'margin-inline-start': 8,
      },
      [`.${prefixCls}-clear:hover`]: { background: it.clearBg },
      [`.${prefixCls}-suffix > .${prefixCls}-search-icon, .${prefixCls}-suffix > .${prefixCls}-password-icon`]:
        {
          'margin-inline-start': 0,
        },
      [`.${prefixCls}-password-suffix`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: 8,
      },
      [`.${prefixCls}-password-suffix > .${prefixCls}-password-icon`]: {
        'margin-inline-start': 0,
      },
      [`.${prefixCls}-count, .${prefixCls}-textarea-count`]: {
        color: t.colorTextDisabled,
        'font-size': t.fontSize,
        'margin-inline-start': 8,
      },
      [`.${prefixCls}-count-exceed`]: { borderColor: t.colorError },
      [`.${prefixCls}-textarea-wrapper`]: {
        display: 'inline-block',
        width: '100%',
        position: 'relative',
      },
      [`.${prefixCls}-textarea`]: {
        'box-sizing': 'border-box',
        width: '100%',
        minHeight: t.controlHeight,
        padding: `${it.paddingBlock}px ${it.paddingInline}px`,
        color: t.colorText,
        'font-size': it.inputFontSize,
        'font-family': t.fontFamily,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
        background: t.colorBgContainer,
        resize: 'vertical',
        '&:hover': { borderColor: it.hoverBorderColor, background: it.hoverBg },
        '&:focus': {
          borderColor: it.activeBorderColor,
          background: it.activeBg,
          'box-shadow': it.activeShadow,
          outline: 0,
        },
      },
      [`.${prefixCls}-textarea-wrapper-sm .${prefixCls}-textarea`]: {
        padding: `${it.paddingBlockSM}px ${it.paddingInlineSM}px`,
        'font-size': it.inputFontSizeSM,
      },
      [`.${prefixCls}-textarea-wrapper-lg .${prefixCls}-textarea`]: {
        padding: `${it.paddingBlockLG}px ${it.paddingInlineLG}px`,
        'font-size': it.inputFontSizeLG,
      },
      [`.${prefixCls}-textarea-wrapper.${prefixCls}-variant-borderless .${prefixCls}-textarea`]: {
        borderColor: 'transparent',
      },
      [`.${prefixCls}-textarea-wrapper.${prefixCls}-variant-filled .${prefixCls}-textarea`]: {
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-textarea-wrapper.${prefixCls}-variant-underlined .${prefixCls}-textarea`]: {
        'border-top': 0,
        'border-inline-start': 0,
        'border-inline-end': 0,
        'border-radius': 0,
      },
      [`.${prefixCls}-textarea-count`]: {
        display: 'block',
        'text-align': 'end',
      },
      [`.${prefixCls}-disabled .${prefixCls}-textarea`]: {
        color: t.colorTextDisabled,
        background: t.colorFillAlter,
        cursor: 'not-allowed',
      },
      [`.${prefixCls}-search-button`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        gap: 8,
        border: 0,
        padding: `0 ${it.paddingInline}px`,
        height: t.controlHeight,
        cursor: 'pointer',
      },
      [`.${prefixCls}-group-wrapper`]: {
        display: 'inline-block',
        width: '100%',
      },
      [`.${prefixCls}-wrapper`]: {
        display: 'inline-flex',
        width: '100%',
        'align-items': 'stretch',
      },
      [`.${prefixCls}-group-addon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: 0,
        padding: `0 ${it.paddingInline}px`,
        color: t.colorText,
        background: it.addonBg,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
      },
      [`.${prefixCls}-wrapper > .${prefixCls}-group-addon:first-child`]: {
        'border-start-end-radius': 0,
        'border-end-end-radius': 0,
        'border-inline-end': 0,
      },
      [`.${prefixCls}-wrapper > .${prefixCls}-group-addon:last-child`]: {
        'border-start-start-radius': 0,
        'border-end-start-radius': 0,
        'border-inline-start': 0,
      },
      [`.${prefixCls}-wrapper > .${prefixCls}-affix-wrapper`]: {
        flex: 1,
        width: 'auto',
      },
      [`.${prefixCls}-wrapper > .${prefixCls}-affix-wrapper:not(:first-child):not(:last-child)`]: {
        'border-radius': 0,
      },
      [`.${prefixCls}-wrapper > .${prefixCls}-affix-wrapper:not(:first-child)`]: {
        'border-start-start-radius': 0,
        'border-end-start-radius': 0,
      },
      [`.${prefixCls}-wrapper > .${prefixCls}-affix-wrapper:not(:last-child)`]: {
        'border-start-end-radius': 0,
        'border-end-end-radius': 0,
      },
      [`.${prefixCls}-search-btn`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
      },
      [`.${prefixCls}-group`]: {
        display: 'inline-flex',
        width: '100%',
      },
      [`.${prefixCls}-group-compact`]: {
        display: 'inline-flex',
      },
      [`.${prefixCls}-group-compact > *`]: {
        display: 'inline-flex',
        'vertical-align': 'top',
      },
      [`.${prefixCls}-group-compact > .${prefixCls}-affix-wrapper:not(:first-child)`]: {
        'border-start-start-radius': 0,
        'border-end-start-radius': 0,
      },
      [`.${prefixCls}-group-compact > *:not(:first-child):not(:last-child)`]: {
        'border-radius': 0,
      },
      [`.${prefixCls}-group-compact > *:not(:first-child)`]: {
        'border-start-start-radius': 0,
        'border-end-start-radius': 0,
      },
      [`.${prefixCls}-group-compact > *:not(:last-child)`]: {
        'border-start-end-radius': 0,
        'border-end-end-radius': 0,
        'margin-inline-end': -t.lineWidth,
        'border-inline-end-width': t.lineWidth,
      },
      [`.${prefixCls}-group-compact > *:hover, .${prefixCls}-group-compact > *:focus, .${prefixCls}-group-compact > .${prefixCls}-affix-wrapper:focus-within`]:
        {
          'z-index': 1,
        },
      [`.${prefixCls}-group-sm`]: { 'font-size': it.inputFontSizeSM },
      [`.${prefixCls}-group-lg`]: { 'font-size': it.inputFontSizeLG },
      [`.${prefixCls}-search-loading`]: { opacity: 0.7 },
      ...loadingIconRotateStyle(`.${prefixCls}-search-loading svg`),
      [`.${prefixCls}-otp`]: { display: 'inline-flex', gap: 8, 'align-items': 'center' },
      [`.${prefixCls}-otp-input`]: {
        width: t.controlHeight,
        height: t.controlHeight,
        'text-align': 'center',
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
      },
      [`.${prefixCls}-otp-sm .${prefixCls}-otp-input`]: {
        width: t.controlHeightSM,
        height: t.controlHeightSM,
      },
      [`.${prefixCls}-otp-lg .${prefixCls}-otp-input`]: {
        width: t.controlHeightLG,
        height: t.controlHeightLG,
      },
    }
  })
}
