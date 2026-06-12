import { getComponentToken } from '@ant-design-solid/theme'
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useInputNumberStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['InputNumber', prefixCls] },
    () => {
      const t = token()
      const inputNumber = getComponentToken('InputNumber', t)
      return {
        [`.${prefixCls}`]: {
          display: 'inline-flex',
          'align-items': 'stretch',
          width: '120px',
          color: t.colorText,
          'font-size': `${inputNumber.inputFontSize}px`,
          'font-family': t.fontFamily,
          background: t.colorBgContainer,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          transition: `border-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
          '&:hover': { 'border-color': inputNumber.hoverBorderColor },
        },
        [`.${prefixCls}-group-wrapper`]: {
          display: 'inline-flex',
          'align-items': 'stretch',
        },
        [`.${prefixCls}-group-wrapper .${prefixCls}`]: {
          width: 'auto',
          'border-radius': 0,
        },
        [`.${prefixCls}-group-wrapper .${prefixCls}:first-child`]: {
          'border-start-start-radius': `${t.borderRadius}px`,
          'border-end-start-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-group-wrapper .${prefixCls}:last-child`]: {
          'border-start-end-radius': `${t.borderRadius}px`,
          'border-end-end-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-group-addon`]: {
          display: 'inline-flex',
          'align-items': 'center',
          padding: `0 ${inputNumber.paddingInline}px`,
          color: t.colorText,
          background: inputNumber.addonBg,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
        },
        [`.${prefixCls}-group-addon:first-child`]: {
          'border-inline-end': 0,
          'border-start-start-radius': `${t.borderRadius}px`,
          'border-end-start-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-group-addon:last-child`]: {
          'border-inline-start': 0,
          'border-start-end-radius': `${t.borderRadius}px`,
          'border-end-end-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-variant-borderless`]: {
          border: 0,
          background: 'transparent',
        },
        [`.${prefixCls}-variant-filled`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-variant-filled .${prefixCls}-handler`]: {
          background: inputNumber.filledHandleBg,
        },
        [`.${prefixCls}-variant-underlined`]: {
          'border-top': 0,
          'border-left': 0,
          'border-right': 0,
          'border-radius': 0,
        },
        [`.${prefixCls}-focused`]: {
          'border-color': inputNumber.activeBorderColor,
          'box-shadow': inputNumber.activeShadow,
        },
        [`.${prefixCls}-disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
          '&:hover': { 'border-color': t.colorBorder },
        },
        [`.${prefixCls}-status-error`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-status-warning`]: {
          'border-color': t.colorWarning,
        },
        [`.${prefixCls}-prefix, .${prefixCls}-suffix`]: {
          display: 'inline-flex',
          'align-items': 'center',
          padding: `0 ${t.paddingXS}px`,
          color: t.colorTextSecondary,
        },
        [`.${prefixCls}-input`]: {
          flex: '1 1 auto',
          width: '100%',
          minWidth: 0,
          padding: `${inputNumber.paddingBlock}px ${inputNumber.paddingInline}px`,
          color: 'inherit',
          'font-size': 'inherit',
          'font-family': 'inherit',
          'line-height': String(t.lineHeight),
          background: 'transparent',
          border: 0,
          outline: 0,
          appearance: 'textfield',
        },
        [`.${prefixCls}-input::-webkit-outer-spin-button, .${prefixCls}-input::-webkit-inner-spin-button`]:
          {
            margin: 0,
            appearance: 'none',
          },
        [`.${prefixCls}-without-controls .${prefixCls}-input`]: {
          'padding-right': `${t.paddingXS}px`,
        },
        [`.${prefixCls}-controls`]: {
          display: 'inline-flex',
          'flex-direction': 'column',
          width: `${inputNumber.handleWidth}px`,
          'border-left': `${t.lineWidth}px solid ${inputNumber.handleBorderColor}`,
          overflow: 'hidden',
          'border-start-end-radius': `${t.borderRadius}px`,
          'border-end-end-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-handler`]: {
          flex: '1 1 0',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: 0,
          color: t.colorTextSecondary,
          'font-size': `${inputNumber.handleFontSize}px`,
          'line-height': '1',
          background: inputNumber.handleBg,
          border: 0,
          cursor: 'pointer',
          opacity: inputNumber.handleVisible ? 1 : 0,
          '&:hover': {
            color: inputNumber.handleHoverColor,
            background: inputNumber.handleActiveBg,
          },
          '&:disabled': {
            color: t.colorTextDisabled,
            cursor: 'not-allowed',
          },
        },
        [`.${prefixCls}-readonly .${prefixCls}-handler`]: {
          cursor: 'default',
        },
        [`.${prefixCls}-handler svg`]: {
          display: 'block',
        },
        [`.${prefixCls}-handler-up`]: {
          'border-bottom': `${t.lineWidth}px solid ${inputNumber.handleBorderColor}`,
          'border-start-end-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-handler-down`]: {
          'border-end-end-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-mode-spinner`]: {
          width: 'auto',
        },
        [`.${prefixCls}-mode-spinner .${prefixCls}-controls`]: {
          display: 'contents',
          width: 'auto',
          border: 0,
          overflow: 'visible',
        },
        [`.${prefixCls}-mode-spinner .${prefixCls}-input`]: {
          order: 2,
          'text-align': 'center',
          width: '72px',
        },
        [`.${prefixCls}-mode-spinner .${prefixCls}-handler`]: {
          flex: '0 0 auto',
          width: `${inputNumber.handleWidth}px`,
          padding: `0 ${inputNumber.paddingInlineSM}px`,
        },
        [`.${prefixCls}-mode-spinner .${prefixCls}-handler-down`]: {
          order: 1,
          'border-inline-end': `${t.lineWidth}px solid ${inputNumber.handleBorderColor}`,
          'border-start-start-radius': `${t.borderRadius}px`,
          'border-end-start-radius': `${t.borderRadius}px`,
          'border-start-end-radius': 0,
          'border-end-end-radius': 0,
        },
        [`.${prefixCls}-mode-spinner .${prefixCls}-handler-up`]: {
          order: 3,
          'border-bottom': 0,
          'border-inline-start': `${t.lineWidth}px solid ${inputNumber.handleBorderColor}`,
          'border-start-end-radius': `${t.borderRadius}px`,
          'border-end-end-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-sm`]: {
          width: '100px',
          'font-size': `${inputNumber.inputFontSizeSM}px`,
        },
        [`.${prefixCls}-sm .${prefixCls}-input`]: {
          padding: `${inputNumber.paddingBlockSM}px ${inputNumber.paddingInlineSM}px`,
        },
        [`.${prefixCls}-lg`]: {
          width: '140px',
          'font-size': `${inputNumber.inputFontSizeLG}px`,
        },
        [`.${prefixCls}-lg .${prefixCls}-input`]: {
          padding: `${inputNumber.paddingBlockLG}px ${inputNumber.paddingInlineLG}px`,
        },
      }
    },
  )
}
