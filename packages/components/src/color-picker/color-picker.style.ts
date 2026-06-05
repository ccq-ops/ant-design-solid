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
        [`.${prefixCls}-popup`]: {
          position: 'fixed',
          'box-sizing': 'border-box',
          minWidth: '180px',
          padding: `${t.paddingSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgElevated,
          'box-shadow': t.boxShadow,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-panel`]: {
          display: 'flex',
          'flex-direction': 'column',
          gap: `${t.marginXS}px`,
        },

        [`.${prefixCls}-saturation`]: {
          position: 'relative',
          width: '220px',
          height: '160px',
          overflow: 'hidden',
          'border-radius': `${t.borderRadius}px`,
          cursor: 'crosshair',
          'touch-action': 'none',
        },
        [`.${prefixCls}-saturation-white`]: {
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, #fff, rgba(255, 255, 255, 0))',
        },
        [`.${prefixCls}-saturation-black`]: {
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #000, rgba(0, 0, 0, 0))',
        },
        [`.${prefixCls}-handler`]: {
          position: 'absolute',
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
          'border-radius': '50%',
          'box-shadow': '0 0 0 1px rgba(0, 0, 0, 0.35)',
          transform: 'translate(-50%, -50%)',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-slider`]: {
          position: 'relative',
          width: '220px',
          height: '12px',
          'border-radius': '999px',
          cursor: 'pointer',
          'touch-action': 'none',
        },
        [`.${prefixCls}-hue`]: {
          background:
            'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
        },
        [`.${prefixCls}-alpha`]: {
          backgroundColor: '#fff',
        },
        [`.${prefixCls}-slider-handler`]: {
          position: 'absolute',
          top: '50%',
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
          'border-radius': '50%',
          'box-shadow': '0 0 0 1px rgba(0, 0, 0, 0.35)',
          transform: 'translate(-50%, -50%)',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-format-row`]: {
          display: 'flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-format-select`]: {
          height: `${t.controlHeightSM}px`,
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-inputs`]: {
          display: 'grid',
          flex: 1,
          gap: `${t.marginXS / 2}px`,
        },
        [`.${prefixCls}-inputs-hex`]: {
          'grid-template-columns': '1fr',
        },
        [`.${prefixCls}-inputs-rgb`]: {
          'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
        },
        [`.${prefixCls}-inputs-hsb`]: {
          'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
        },
        [`.${prefixCls}-input`]: {
          'box-sizing': 'border-box',
          width: '100%',
          height: `${t.controlHeightSM}px`,
          padding: `0 ${t.paddingXS / 2}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-presets`]: {
          display: 'flex',
          'flex-direction': 'column',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-preset`]: {
          display: 'flex',
          'flex-direction': 'column',
          gap: `${t.marginXS / 2}px`,
        },
        [`.${prefixCls}-preset-label`]: {
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
          'line-height': 1.4,
        },
        [`.${prefixCls}-preset-colors`]: {
          display: 'flex',
          'flex-wrap': 'wrap',
          gap: `${t.marginXS / 2}px`,
        },
        [`.${prefixCls}-preset-color`]: {
          width: '20px',
          height: '20px',
          padding: '2px',
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius / 2}px`,
          background:
            'linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)',
          'background-size': '8px 8px',
          'background-position': '0 0, 0 4px, 4px -4px, -4px 0px',
          cursor: 'pointer',
          '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.5,
          },
        },
        [`.${prefixCls}-preset-color-inner`]: {
          display: 'block',
          width: '100%',
          height: '100%',
          'border-radius': `${Math.max(1, t.borderRadius / 2 - 1)}px`,
        },
        [`.${prefixCls}-actions`]: {
          display: 'flex',
          'justify-content': 'flex-end',
        },
        [`.${prefixCls}-clear`]: {
          height: `${t.controlHeightSM}px`,
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          cursor: 'pointer',
          '&:hover': {
            color: t.colorPrimaryHover,
            'border-color': t.colorPrimaryHover,
          },
          '&:disabled': {
            color: t.colorTextDisabled,
            background: t.colorFillAlter,
            cursor: 'not-allowed',
          },
        },
        [`.${prefixCls}-preview`]: {
          display: 'flex',
          'align-items': 'center',
          gap: `${t.marginSM}px`,
        },
        [`.${prefixCls}-preview-color`]: {
          width: '28px',
          height: '28px',
          padding: '2px',
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius}px`,
          background:
            'linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)',
          'background-size': '8px 8px',
          'background-position': '0 0, 0 4px, 4px -4px, -4px 0px',
        },
        [`.${prefixCls}-preview-color-inner`]: {
          display: 'block',
          width: '100%',
          height: '100%',
          'border-radius': `${Math.max(1, t.borderRadius - 2)}px`,
        },
        [`.${prefixCls}-preview-text`]: {
          'white-space': 'nowrap',
          color: t.colorText,
        },
      }
    },
  )
}
