import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useColorPickerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['ColorPicker', prefixCls] },
    () => {
      const t = token()
      const colorPickerToken = getComponentToken('ColorPicker', t)
      const transparentBlockBg = {
        'background-image': `conic-gradient(${t.colorFillSecondary} 25%, transparent 25% 50%, ${t.colorFillSecondary} 50% 75%, transparent 75% 100%)`,
        'background-size': '50% 50%',
      }
      const colorBlockInnerStyle = {
        display: 'block',
        width: '100%',
        height: '100%',
        'border-radius': 'inherit',
        'box-shadow': `inset 0 0 0 ${t.lineWidth}px ${t.colorFillSecondary}`,
      }
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
          position: 'relative',
          flex: 'none',
          width: '20px',
          height: '20px',
          'border-radius': `${t.borderRadius / 2}px`,
          'box-shadow': colorPickerToken.colorPickerInsetShadow,
          ...transparentBlockBg,
        },
        [`.${prefixCls}-color-block-inner`]: {
          ...colorBlockInnerStyle,
        },
        [`.${prefixCls}-text`]: {
          'line-height': 1,
        },
        [`.${prefixCls}-popup`]: {
          position: 'fixed',
          'box-sizing': 'border-box',
          minWidth: `${colorPickerToken.colorPickerWidth}px`,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgElevated,
          'box-shadow': t.boxShadow,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-popup-hidden`]: {
          opacity: 0,
          visibility: 'hidden',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-popup-inner`]: {
          position: 'relative',
          'z-index': 1,
          padding: `${t.paddingSM}px`,
          'border-radius': `${t.borderRadius}px`,
          background: 'inherit',
        },
        [`.${prefixCls}-arrow`]: {
          position: 'absolute',
          width: 8,
          height: 8,
          background: 'inherit',
          transform: 'rotate(45deg)',
        },
        [`.${prefixCls}-top .${prefixCls}-arrow, .${prefixCls}-topLeft .${prefixCls}-arrow, .${prefixCls}-topRight .${prefixCls}-arrow`]:
          {
            bottom: -4,
          },
        [`.${prefixCls}-bottom .${prefixCls}-arrow, .${prefixCls}-bottomLeft .${prefixCls}-arrow, .${prefixCls}-bottomRight .${prefixCls}-arrow`]:
          {
            top: -4,
          },
        [`.${prefixCls}-left .${prefixCls}-arrow, .${prefixCls}-leftTop .${prefixCls}-arrow, .${prefixCls}-leftBottom .${prefixCls}-arrow`]:
          {
            right: -4,
          },
        [`.${prefixCls}-right .${prefixCls}-arrow, .${prefixCls}-rightTop .${prefixCls}-arrow, .${prefixCls}-rightBottom .${prefixCls}-arrow`]:
          {
            left: -4,
          },
        [`.${prefixCls}-top .${prefixCls}-arrow, .${prefixCls}-bottom .${prefixCls}-arrow`]: {
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
        },
        [`.${prefixCls}-topLeft .${prefixCls}-arrow, .${prefixCls}-bottomLeft .${prefixCls}-arrow`]:
          {
            left: 12,
          },
        [`.${prefixCls}-topRight .${prefixCls}-arrow, .${prefixCls}-bottomRight .${prefixCls}-arrow`]:
          {
            right: 12,
          },
        [`.${prefixCls}-left .${prefixCls}-arrow, .${prefixCls}-right .${prefixCls}-arrow`]: {
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
        },
        [`.${prefixCls}-leftTop .${prefixCls}-arrow, .${prefixCls}-rightTop .${prefixCls}-arrow`]: {
          top: 12,
        },
        [`.${prefixCls}-leftBottom .${prefixCls}-arrow, .${prefixCls}-rightBottom .${prefixCls}-arrow`]:
          {
            bottom: 12,
          },
        [`.${prefixCls}-arrow-point-at-center .${prefixCls}-arrow`]: {
          left: '50%',
          top: '50%',
        },
        [`.${prefixCls}-panel`]: {
          display: 'flex',
          'flex-direction': 'column',
          gap: `${t.marginXS}px`,
        },

        [`.${prefixCls}-saturation`]: {
          position: 'relative',
          width: `${colorPickerToken.colorPickerWidth}px`,
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
          width: `${colorPickerToken.colorPickerHandlerSize}px`,
          height: `${colorPickerToken.colorPickerHandlerSize}px`,
          border: '2px solid #fff',
          'border-radius': '50%',
          'box-shadow': colorPickerToken.colorPickerInsetShadow,
          transform: 'translate(-50%, -50%)',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-slider`]: {
          position: 'relative',
          width: `${colorPickerToken.colorPickerWidth}px`,
          height: `${colorPickerToken.colorPickerSliderHeight}px`,
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
          width: `${colorPickerToken.colorPickerHandlerSizeSM}px`,
          height: `${colorPickerToken.colorPickerHandlerSizeSM}px`,
          border: '2px solid #fff',
          'border-radius': '50%',
          'box-shadow': colorPickerToken.colorPickerInsetShadow,
          transform: 'translate(-50%, -50%)',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-format-row`]: {
          display: 'flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-mode-switch`]: {
          display: 'inline-flex',
          'align-self': 'flex-start',
          padding: 2,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorFillQuaternary,
        },
        [`.${prefixCls}-mode-button`]: {
          height: `${t.controlHeightSM - 4}px`,
          padding: `0 ${t.paddingXS}px`,
          border: 0,
          'border-radius': `${Math.max(1, t.borderRadius - 2)}px`,
          background: 'transparent',
          color: t.colorTextSecondary,
          'font-size': `${t.fontSizeSM}px`,
          'font-family': t.fontFamily,
          cursor: 'pointer',
        },
        [`.${prefixCls}-mode-button-active`]: {
          background: t.colorBgContainer,
          color: t.colorText,
          'box-shadow': t.boxShadowTertiary,
        },
        [`.${prefixCls}-mode-button:disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-gradient-slider`]: {
          position: 'relative',
          width: `${colorPickerToken.colorPickerWidth}px`,
          height: `${colorPickerToken.colorPickerSliderHeight}px`,
          'border-radius': '999px',
          cursor: 'copy',
          'touch-action': 'none',
        },
        [`.${prefixCls}-gradient-stop`]: {
          position: 'absolute',
          top: '50%',
          width: `${colorPickerToken.colorPickerHandlerSize}px`,
          height: `${colorPickerToken.colorPickerHandlerSize}px`,
          padding: 0,
          border: '2px solid #fff',
          'border-radius': '50%',
          'box-shadow': colorPickerToken.colorPickerInsetShadow,
          transform: 'translate(-50%, -50%)',
          cursor: 'grab',
        },
        [`.${prefixCls}-gradient-stop-active`]: {
          'box-shadow': `0 0 0 2px ${t.colorPrimary}`,
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
          width: `${colorPickerToken.colorPickerPresetColorSize}px`,
          height: `${colorPickerToken.colorPickerPresetColorSize}px`,
          'border-radius': `${t.borderRadius / 2}px`,
          'box-shadow': colorPickerToken.colorPickerInsetShadow,
          ...transparentBlockBg,
          cursor: 'pointer',
          '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.5,
          },
        },
        [`.${prefixCls}-preset-color-inner`]: {
          ...colorBlockInnerStyle,
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
          width: `${colorPickerToken.colorPickerPreviewSize}px`,
          height: `${colorPickerToken.colorPickerPreviewSize}px`,
          'border-radius': `${t.borderRadius}px`,
          'box-shadow': colorPickerToken.colorPickerInsetShadow,
          ...transparentBlockBg,
        },
        [`.${prefixCls}-preview-color-inner`]: {
          ...colorBlockInnerStyle,
        },
        [`.${prefixCls}-preview-text`]: {
          'white-space': 'nowrap',
          color: t.colorText,
        },
      }
    },
  )
}
