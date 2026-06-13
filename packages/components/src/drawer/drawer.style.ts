import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useDrawerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Drawer', prefixCls] }, () => {
    const t = token()
    const drawerToken = getComponentToken('Drawer', t)
    const motion = `${t.motionDurationSlow} ${t.motionEaseInOut}`
    const panelMotionStyle = (direction: 'left' | 'right' | 'top' | 'bottom') => {
      const transform =
        direction === 'left'
          ? 'translateX(-100%)'
          : direction === 'right'
            ? 'translateX(100%)'
            : direction === 'top'
              ? 'translateY(-100%)'
              : 'translateY(100%)'
      return {
        [`.${prefixCls}-panel-motion-${direction}-enter, .${prefixCls}-panel-motion-${direction}-appear`]:
          {
            opacity: 0.7,
            transform,
          },
        [`.${prefixCls}-panel-motion-${direction}-enter-active, .${prefixCls}-panel-motion-${direction}-appear-active`]:
          {
            opacity: 1,
            transform: 'none',
            transition: `all ${t.motionDurationSlow}`,
          },
        [`.${prefixCls}-panel-motion-${direction}-leave`]: {
          opacity: 1,
          transform: 'none',
        },
        [`.${prefixCls}-panel-motion-${direction}-leave-active`]: {
          opacity: 0.7,
          transform,
          transition: `all ${t.motionDurationSlow}`,
        },
      }
    }
    return {
      [`.${prefixCls}-root`]: {
        position: 'fixed',
        inset: 0,
        'pointer-events': 'none',
        color: t.colorText,
      },
      [`.${prefixCls}-root.${prefixCls}-inline`]: {
        position: 'absolute',
      },
      [`.${prefixCls}-mask`]: {
        position: 'absolute',
        inset: 0,
        background: t.colorBgMask,
        'pointer-events': 'auto',
      },
      [`.${prefixCls}-mask-blur`]: {
        'backdrop-filter': 'blur(4px)',
      },
      [`.${prefixCls}-mask-motion-enter, .${prefixCls}-mask-motion-appear`]: {
        opacity: 0,
      },
      [`.${prefixCls}-mask-motion-enter-active, .${prefixCls}-mask-motion-appear-active`]: {
        opacity: 1,
        transition: `all ${t.motionDurationSlow}`,
      },
      [`.${prefixCls}-mask-motion-leave`]: {
        opacity: 1,
      },
      [`.${prefixCls}-mask-motion-leave-active`]: {
        opacity: 0,
        transition: `all ${t.motionDurationSlow}`,
      },
      [`.${prefixCls}-content-wrapper`]: {
        position: 'absolute',
        'box-sizing': 'border-box',
        'max-width': '100vw',
        transition: `all ${motion}`,
        outline: 0,
      },
      [`.${prefixCls}-left > .${prefixCls}-content-wrapper`]: {
        top: 0,
        bottom: 0,
        left: 0,
        'box-shadow': t.boxShadowDrawerLeft,
      },
      [`.${prefixCls}-right > .${prefixCls}-content-wrapper`]: {
        top: 0,
        right: 0,
        bottom: 0,
        'box-shadow': t.boxShadowDrawerRight,
      },
      [`.${prefixCls}-top > .${prefixCls}-content-wrapper`]: {
        top: 0,
        left: 0,
        right: 0,
        'box-shadow': t.boxShadowDrawerUp,
      },
      [`.${prefixCls}-bottom > .${prefixCls}-content-wrapper`]: {
        right: 0,
        bottom: 0,
        left: 0,
        'box-shadow': t.boxShadowDrawerDown,
      },
      ...panelMotionStyle('left'),
      ...panelMotionStyle('right'),
      ...panelMotionStyle('top'),
      ...panelMotionStyle('bottom'),
      [`.${prefixCls}-section`]: {
        display: 'flex',
        'flex-direction': 'column',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: t.colorBgElevated,
        'pointer-events': 'auto',
        'font-family': t.fontFamily,
        'font-size': `${t.fontSize}px`,
        'line-height': `${t.lineHeight}`,
      },
      [`.${prefixCls}-header`]: {
        display: 'flex',
        flex: 0,
        'align-items': 'center',
        padding: `${t.padding}px ${t.paddingLG}px`,
        'font-size': `${t.fontSizeLG}px`,
        'line-height': `${t.lineHeightLG}`,
        'border-bottom': `${t.lineWidth}px ${t.lineType} ${t.colorSplit}`,
      },
      [`.${prefixCls}-header-title`]: {
        display: 'flex',
        flex: 1,
        'align-items': 'center',
        'min-width': 0,
        'min-height': 0,
      },
      [`.${prefixCls}-title`]: {
        flex: 1,
        margin: 0,
        color: t.colorTextHeading,
        'font-size': `${t.fontSizeLG}px`,
        'font-weight': t.fontWeightStrong,
        'line-height': `${t.lineHeightLG}`,
      },
      [`.${prefixCls}-extra`]: {
        flex: 'none',
      },
      [`.${prefixCls}-body`]: {
        flex: 1,
        padding: `${t.paddingLG}px`,
        overflow: 'auto',
        'min-width': 0,
        'min-height': 0,
      },
      [`.${prefixCls}-footer`]: {
        flex: 0,
        padding: `${drawerToken.footerPaddingBlock}px ${drawerToken.footerPaddingInline}px`,
        'border-top': `${t.lineWidth}px ${t.lineType} ${t.colorSplit}`,
      },
      [`.${prefixCls}-loading`]: {
        width: '100%',
      },
      [`.${prefixCls}-close`]: {
        display: 'inline-flex',
        width: `${t.fontSizeLG + t.paddingXS}px`,
        height: `${t.fontSizeLG + t.paddingXS}px`,
        'border-radius': `${t.borderRadiusSM}px`,
        'justify-content': 'center',
        'align-items': 'center',
        color: t.colorIcon,
        'font-weight': t.fontWeightStrong,
        'font-size': `${t.fontSizeLG}px`,
        'font-style': 'normal',
        'line-height': 1,
        'text-align': 'center',
        'text-transform': 'none',
        'text-decoration': 'none',
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        padding: 0,
        transition: `all ${t.motionDurationMid}`,
      },
      [`.${prefixCls}-close:not(.${prefixCls}-close-end)`]: {
        'margin-inline-end': `${t.marginXS}px`,
      },
      [`.${prefixCls}-close-end`]: {
        'margin-inline-start': `${t.marginXS}px`,
      },
      [`.${prefixCls}-close:hover`]: {
        color: t.colorIconHover,
        'background-color': t.colorBgTextHover,
        'text-decoration': 'none',
      },
      [`.${prefixCls}-close:active`]: {
        'background-color': t.colorBgTextActive,
      },
      [`.${prefixCls}-close:disabled`]: {
        cursor: 'not-allowed',
        opacity: 0.45,
      },
      [`.${prefixCls}-resizable-dragger`]: {
        position: 'absolute',
        'z-index': 1,
      },
      [`.${prefixCls}-resizable-dragger-right`]: {
        top: 0,
        bottom: 0,
        left: `-${drawerToken.draggerSize / 2}px`,
        width: `${drawerToken.draggerSize}px`,
        cursor: 'ew-resize',
      },
      [`.${prefixCls}-resizable-dragger-left`]: {
        top: 0,
        right: `-${drawerToken.draggerSize / 2}px`,
        bottom: 0,
        width: `${drawerToken.draggerSize}px`,
        cursor: 'ew-resize',
      },
      [`.${prefixCls}-resizable-dragger-top`]: {
        right: 0,
        bottom: `-${drawerToken.draggerSize / 2}px`,
        left: 0,
        height: `${drawerToken.draggerSize}px`,
        cursor: 'ns-resize',
      },
      [`.${prefixCls}-resizable-dragger-bottom`]: {
        top: `-${drawerToken.draggerSize / 2}px`,
        right: 0,
        left: 0,
        height: `${drawerToken.draggerSize}px`,
        cursor: 'ns-resize',
      },
    }
  })
}
