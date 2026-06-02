import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useSliderStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Slider', prefixCls] }, () => {
    const t = token()
    const railSize = 4
    const handleSize = 14
    const verticalHeight = 160
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        position: 'relative',
        width: '100%',
        height: `${t.controlHeight}px`,
        margin: `${t.marginXS}px ${t.marginSM}px`,
        padding: `${(t.controlHeight - railSize) / 2}px 0`,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': `${t.lineHeight}`,
        cursor: 'pointer',
        'touch-action': 'none',
      },
      [`.${prefixCls}-vertical`]: {
        width: `${t.controlHeight}px`,
        height: `${verticalHeight}px`,
        margin: `${t.marginSM}px ${t.marginXS}px`,
        padding: `0 ${(t.controlHeight - railSize) / 2}px`,
      },
      [`.${prefixCls}-disabled`]: {
        cursor: 'not-allowed',
        opacity: '0.65',
      },
      [`.${prefixCls}-rail`]: {
        position: 'absolute',
        inset: `${(t.controlHeight - railSize) / 2}px 0 auto 0`,
        height: `${railSize}px`,
        'border-radius': `${railSize}px`,
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-vertical .${prefixCls}-rail`]: {
        inset: `0 auto 0 ${(t.controlHeight - railSize) / 2}px`,
        width: `${railSize}px`,
        height: '100%',
      },
      [`.${prefixCls}-track`]: {
        position: 'absolute',
        top: `${(t.controlHeight - railSize) / 2}px`,
        height: `${railSize}px`,
        'border-radius': `${railSize}px`,
        background: t.colorPrimary,
        transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-vertical .${prefixCls}-track`]: {
        top: 'auto',
        left: `${(t.controlHeight - railSize) / 2}px`,
        width: `${railSize}px`,
        height: 'auto',
      },
      [`.${prefixCls}-handle`]: {
        position: 'absolute',
        top: '50%',
        width: `${handleSize}px`,
        height: `${handleSize}px`,
        padding: 0,
        border: `${t.lineWidth + 1}px solid ${t.colorPrimary}`,
        'border-radius': '50%',
        background: t.colorBgContainer,
        cursor: 'grab',
        outline: 'none',
        transform: 'translate(-50%, -50%)',
        transition: `border-color ${t.motionDurationMid} ${t.motionEaseInOut}, box-shadow ${t.motionDurationMid} ${t.motionEaseInOut}`,
        'touch-action': 'none',
      },
      [`.${prefixCls}-vertical .${prefixCls}-handle`]: {
        top: 'auto',
        left: '50%',
        transform: 'translate(-50%, 50%)',
      },
      [`.${prefixCls}-handle:hover`]: {
        'border-color': t.colorPrimaryHover,
      },
      [`.${prefixCls}-handle:focus-visible`]: {
        'box-shadow': `0 0 0 3px ${t.colorPrimaryHover}`,
      },
      [`.${prefixCls}-handle-dragging`]: {
        cursor: 'grabbing',
        'box-shadow': `0 0 0 4px ${t.colorPrimaryHover}`,
      },
      [`.${prefixCls}-disabled .${prefixCls}-handle`]: {
        border: `${t.lineWidth + 1}px solid ${t.colorTextDisabled}`,
        cursor: 'not-allowed',
        'box-shadow': 'none',
      },
      [`.${prefixCls}-disabled .${prefixCls}-track`]: {
        background: t.colorTextDisabled,
      },
      [`.${prefixCls}-marks`]: {
        position: 'absolute',
        inset: `${t.controlHeight}px 0 auto 0`,
      },
      [`.${prefixCls}-vertical .${prefixCls}-marks`]: {
        inset: '0 auto 0 100%',
        width: 'max-content',
        'margin-inline-start': `${t.marginXS}px`,
      },
      [`.${prefixCls}-mark-text`]: {
        position: 'absolute',
        color: t.colorTextSecondary,
        transform: 'translateX(-50%)',
        'white-space': 'nowrap',
      },
      [`.${prefixCls}-vertical .${prefixCls}-mark-text`]: {
        transform: 'translateY(50%)',
      },
      [`.${prefixCls}-tooltip`]: {
        position: 'absolute',
        bottom: `calc(100% + ${t.marginXS}px)`,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: `${Math.max(2, Math.floor(t.paddingXS / 2))}px ${t.paddingXS}px`,
        'border-radius': `${t.borderRadius}px`,
        color: t.colorBgContainer,
        background: t.colorText,
        'font-size': `${t.fontSize}px`,
        'line-height': '1.4',
        'white-space': 'nowrap',
        'pointer-events': 'none',
      },
      [`.${prefixCls}-vertical .${prefixCls}-tooltip`]: {
        bottom: '50%',
        left: `calc(100% + ${t.marginXS}px)`,
        transform: 'translateY(50%)',
      },
    }
  })
}
