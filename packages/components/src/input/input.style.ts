import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'
export function useInputStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Input', prefixCls] }, () => {
    const t = token()
    const it = getComponentToken('Input', t)
    return {
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
      [`.${prefixCls}-prefix`]: { 'margin-inline-end': 8 },
      [`.${prefixCls}-suffix`]: { 'margin-inline-start': 8 },
      [`.${prefixCls}-clear`]: {
        border: 0,
        padding: 0,
        color: it.clearIconColor,
        background: 'transparent',
        cursor: 'pointer',
        'margin-inline-start': 8,
        [`.${prefixCls}-textarea-wrapper`]: { display: 'inline-block', width: '100%' },
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
        [`.${prefixCls}-textarea-count`]: {
          display: 'block',
          'text-align': 'end',
          color: t.colorTextDisabled,
          'font-size': t.fontSize,
        },
        [`.${prefixCls}-disabled .${prefixCls}-textarea`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
        },
      },
    }
  })
}
