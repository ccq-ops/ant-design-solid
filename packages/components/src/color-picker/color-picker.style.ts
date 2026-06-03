import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useColorPickerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['ColorPicker', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
          height: `${t.controlHeight}px`,
          padding: `4px ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          cursor: 'pointer',
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}:hover`]: {
          'border-color': t.colorPrimaryHover,
        },
        [`.${prefixCls}-sm`]: {
          height: `${t.controlHeightSM}px`,
          padding: `2px ${t.paddingXS}px`,
        },
        [`.${prefixCls}-lg`]: {
          height: `${t.controlHeightLG}px`,
          padding: `6px ${t.paddingSM}px`,
        },
        [`.${prefixCls}-disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
          '&:hover': { 'border-color': t.colorBorder },
        },
        [`.${prefixCls}-color-block`]: {
          width: '20px',
          height: '20px',
          padding: '2px',
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius / 2}px`,
          background:
            'linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)',
          'background-size': '8px 8px',
          'background-position': '0 0, 0 4px, 4px -4px, -4px 0px',
        },
        [`.${prefixCls}-color-block-inner`]: {
          display: 'block',
          width: '100%',
          height: '100%',
          'border-radius': `${Math.max(1, t.borderRadius / 2 - 1)}px`,
        },
        [`.${prefixCls}-text`]: {
          'line-height': 1,
        },
      }
    },
  )
}
