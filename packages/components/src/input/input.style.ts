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
        padding: `0 ${it.paddingInline}px`,
        color: t.colorText,
        'font-size': t.fontSize,
        'font-family': t.fontFamily,
        background: t.colorBgContainer,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:hover': { borderColor: it.hoverBorderColor },
      },
      [`.${prefixCls}`]: {
        flex: 1,
        width: '100%',
        minWidth: 0,
        height: t.controlHeight,
        padding: 0,
        color: 'inherit',
        'font-size': 'inherit',
        border: 0,
        outline: 0,
        background: 'transparent',
      },
      [`.${prefixCls}-sm`]: { height: t.controlHeightSM },
      [`.${prefixCls}-lg`]: { height: t.controlHeightLG },
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
        cursor: 'pointer',
        'margin-inline-start': 8,
      },
      [`.${prefixCls}-suffix > .${prefixCls}-search-icon, .${prefixCls}-suffix > .${prefixCls}-password-icon`]:
        {
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
        padding: `${t.paddingXS}px ${it.paddingInline}px`,
        color: t.colorText,
        'font-size': t.fontSize,
        'font-family': t.fontFamily,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': t.borderRadius,
        background: t.colorBgContainer,
        resize: 'vertical',
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
