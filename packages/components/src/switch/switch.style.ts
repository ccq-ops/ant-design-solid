import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useSwitchStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Switch', prefixCls] }, () => {
    const t = token()
    const switchToken = getComponentToken('Switch', t)
    const trackPadding = (switchToken.trackHeight - switchToken.handleSize) / 2
    const smallTrackHeight = 16
    const smallTrackMinWidth = 28
    const smallHandleSize = 12
    const smallTrackPadding = (smallTrackHeight - smallHandleSize) / 2

    return {
      [`.${prefixCls}`]: {
        position: 'relative',
        'box-sizing': 'border-box',
        display: 'inline-flex',
        'align-items': 'center',
        minWidth: switchToken.trackMinWidth,
        height: switchToken.trackHeight,
        margin: 0,
        padding: 0,
        border: 0,
        'border-radius': 999,
        color: t.colorBgContainer,
        background: t.colorTextDisabled,
        cursor: 'pointer',
        outline: 'none',
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': `${switchToken.trackHeight}px`,
        'vertical-align': 'middle',
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:focus-visible': {
          'box-shadow': `0 0 0 2px ${t.colorPrimaryHover}`,
        },
      },
      [`.${prefixCls}-checked`]: {
        background: t.colorPrimary,
        [`.${prefixCls}-handle`]: {
          left: `calc(100% - ${switchToken.handleSize + trackPadding}px)`,
        },
      },
      [`.${prefixCls}-disabled`]: { cursor: 'not-allowed', opacity: 0.65 },
      [`.${prefixCls}-loading`]: { cursor: 'not-allowed' },
      [`.${prefixCls}-sm`]: {
        minWidth: smallTrackMinWidth,
        height: smallTrackHeight,
        'font-size': `${t.fontSize - 2}px`,
        'line-height': `${smallTrackHeight}px`,
        [`.${prefixCls}-handle`]: {
          top: smallTrackPadding,
          left: smallTrackPadding,
          width: smallHandleSize,
          height: smallHandleSize,
        },
      },
      [`.${prefixCls}-sm.${prefixCls}-checked .${prefixCls}-handle`]: {
        left: `calc(100% - ${smallHandleSize + smallTrackPadding}px)`,
      },
      [`.${prefixCls}-handle`]: {
        position: 'absolute',
        top: trackPadding,
        left: trackPadding,
        width: switchToken.handleSize,
        height: switchToken.handleSize,
        'border-radius': '50%',
        background: t.colorBgContainer,
        'box-shadow': '0 2px 4px 0 rgba(0, 35, 11, 0.2)',
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        'pointer-events': 'none',
      },
      [`.${prefixCls}-inner`]: {
        display: 'block',
        'min-width': 0,
        'margin-inline-start': `${switchToken.handleSize + trackPadding * 2}px`,
        'margin-inline-end': `${trackPadding * 3}px`,
        overflow: 'hidden',
        'text-align': 'center',
        'white-space': 'nowrap',
        transition: `margin ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-checked .${prefixCls}-inner`]: {
        'margin-inline-start': `${trackPadding * 3}px`,
        'margin-inline-end': `${switchToken.handleSize + trackPadding * 2}px`,
      },
      [`.${prefixCls}-sm .${prefixCls}-inner`]: {
        'margin-inline-start': `${smallHandleSize + smallTrackPadding * 2}px`,
        'margin-inline-end': `${smallTrackPadding * 3}px`,
      },
      [`.${prefixCls}-sm.${prefixCls}-checked .${prefixCls}-inner`]: {
        'margin-inline-start': `${smallTrackPadding * 3}px`,
        'margin-inline-end': `${smallHandleSize + smallTrackPadding * 2}px`,
      },
    }
  })
}
