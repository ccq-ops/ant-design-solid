import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useRadioStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Radio', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        display: 'inline-flex',
        'align-items': 'center',
        gap: '8px',
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        cursor: 'pointer',
      },
      [`.${prefixCls}-input`]: { cursor: 'pointer' },
      [`.${prefixCls}-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
      [`.${prefixCls}-disabled .${prefixCls}-input`]: { cursor: 'not-allowed' },
      [`.${prefixCls}-group`]: { display: 'inline-flex', gap: '12px', 'align-items': 'center' },
      [`.${prefixCls}-group-vertical`]: {
        'flex-direction': 'column',
        'align-items': 'flex-start',
      },
      [`.${prefixCls}-group-horizontal`]: { 'flex-direction': 'row' },
      [`.${prefixCls}-group-block`]: { display: 'flex', width: '100%' },
      [`.${prefixCls}-group-button`]: { gap: 0 },
      [`.${prefixCls}-group-button-compact .${prefixCls}-button-wrapper + .${prefixCls}-button-wrapper`]:
        {
          'margin-inline-start': `-${t.lineWidth}px`,
        },
      [`.${prefixCls}-group-button.${prefixCls}-group-block .${prefixCls}-button-wrapper`]: {
        flex: 1,
        'justify-content': 'center',
      },
      [`.${prefixCls}-group-small .${prefixCls}-button-wrapper`]: {
        height: t.controlHeightSM,
        'line-height': t.controlHeightSM,
        padding: `0 ${t.paddingXS}px`,
      },
      [`.${prefixCls}-group-large .${prefixCls}-button-wrapper`]: {
        height: t.controlHeightLG,
        'line-height': t.controlHeightLG,
        padding: `0 ${t.paddingLG}px`,
      },
      [`.${prefixCls}-button-wrapper`]: {
        padding: `0 ${t.padding}px`,
        height: t.controlHeight,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-inline-start-width': 0,
        'line-height': t.controlHeight,
        background: t.colorBgContainer,
      },
      [`.${prefixCls}-button-wrapper:first-child`]: {
        'border-inline-start-width': `${t.lineWidth}px`,
        'border-start-start-radius': t.borderRadius,
        'border-end-start-radius': t.borderRadius,
      },
      [`.${prefixCls}-button-wrapper:last-child`]: {
        'border-start-end-radius': t.borderRadius,
        'border-end-end-radius': t.borderRadius,
      },
      [`.${prefixCls}-button-wrapper-checked`]: {
        color: t.colorPrimary,
        borderColor: t.colorPrimary,
        'border-inline-start-width': `${t.lineWidth}px`,
        'z-index': 1,
      },
      [`.${prefixCls}-group-solid .${prefixCls}-button-wrapper-checked`]: {
        color: '#fff',
        background: t.colorPrimary,
        borderColor: t.colorPrimary,
      },
    }
  })
}
