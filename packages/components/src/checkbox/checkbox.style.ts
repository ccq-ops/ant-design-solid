import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'
import { getComponentToken } from '@ant-design-solid/theme'

export function useCheckboxStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Checkbox', prefixCls] },
    () => {
      const t = token()
      const checkbox = getComponentToken('Checkbox', t)
      const size = checkbox.size
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.paddingXS}px`,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
          cursor: 'pointer',
          'vertical-align': 'middle',
        },
        [`.${prefixCls}-input`]: {
          appearance: 'none',
          '-webkit-appearance': 'none',
          'box-sizing': 'border-box',
          display: 'inline-block',
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          margin: 0,
          padding: 0,
          background: t.colorBgContainer,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${checkbox.borderRadius}px`,
          cursor: 'pointer',
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
          'vertical-align': 'middle',
          'flex-shrink': 0,
        },
        [`.${prefixCls}:hover .${prefixCls}-input`]: {
          'border-color': t.colorPrimary,
        },
        [`.${prefixCls}-input:focus-visible`]: {
          outline: `${t.controlOutlineWidth}px solid ${t.controlOutline}`,
          'outline-offset': `${t.lineWidth}px`,
        },
        [`.${prefixCls}-input::after`]: {
          'box-sizing': 'border-box',
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '21.5%',
          display: 'table',
          width: `${size * 0.35714286}px`,
          height: `${size * 0.57142857}px`,
          border: `${t.lineWidthBold}px solid ${checkbox.checkColor}`,
          'border-top': 0,
          'border-left': 0,
          opacity: 0,
          transform: 'rotate(45deg) scale(0) translate(-50%, -50%)',
          transition: `all ${t.motionDurationFast} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-checked .${prefixCls}-input`]: {
          background: t.colorPrimary,
          'border-color': t.colorPrimary,
        },
        [`.${prefixCls}-checked .${prefixCls}-input::after`]: {
          opacity: 1,
          transform: 'rotate(45deg) scale(1) translate(-50%, -50%)',
        },
        [`.${prefixCls}-checked:hover .${prefixCls}-input`]: {
          background: t.colorPrimaryHover,
          'border-color': t.colorPrimaryHover,
        },
        [`.${prefixCls}-indeterminate .${prefixCls}-input`]: {
          background: t.colorPrimary,
          'border-color': t.colorPrimary,
        },
        [`.${prefixCls}-indeterminate .${prefixCls}-input::after`]: {
          top: '50%',
          left: '50%',
          width: `${size * 0.5}px`,
          height: `${t.lineWidthBold}px`,
          background: checkbox.checkColor,
          border: 0,
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)',
        },
        [`.${prefixCls}-label`]: {
          display: 'inline-block',
          'padding-inline-start': 0,
          'padding-inline-end': `${t.paddingXS}px`,
        },
        [`.${prefixCls}-disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-disabled .${prefixCls}-input`]: {
          background: t.colorBgContainerDisabled,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-disabled.${prefixCls}-checked .${prefixCls}-input::after`]: {
          'border-color': t.colorTextDisabled,
        },
        [`.${prefixCls}-disabled.${prefixCls}-indeterminate .${prefixCls}-input::after`]: {
          background: t.colorTextDisabled,
        },
        [`.${prefixCls}-group`]: {
          display: 'inline-flex',
          gap: `${t.marginXS}px`,
          'align-items': 'center',
          'flex-wrap': 'wrap',
        },
      }
    },
  )
}
