import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useSplitterStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Splitter', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          display: 'flex',
          width: '100%',
          height: '100%',
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-horizontal`]: {
          'flex-direction': 'row',
        },
        [`.${prefixCls}-vertical`]: {
          'flex-direction': 'column',
        },
        [`.${prefixCls}-panel`]: {
          position: 'relative',
          overflow: 'auto',
          'box-sizing': 'border-box',
          'min-width': 0,
          'min-height': 0,
        },
        [`.${prefixCls}-motion .${prefixCls}-panel`]: {
          transition: `flex-basis ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-panel-hidden`]: {
          overflow: 'hidden',
        },
        [`.${prefixCls}-bar`]: {
          position: 'relative',
          flex: '0 0 0',
          border: 0,
          padding: 0,
          margin: 0,
          background: 'transparent',
          outline: 'none',
          'touch-action': 'none',
          'box-sizing': 'border-box',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: t.colorTextSecondary,
          transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-bar::before`]: {
          content: '""',
          position: 'absolute',
          background: t.colorBorderSecondary,
          transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-bar:hover::before, .${prefixCls}-bar-active::before`]: {
          background: t.colorPrimary,
        },
        [`.${prefixCls}-bar:hover`]: {
          color: t.colorPrimary,
        },
        [`.${prefixCls}-bar-icon`]: {
          position: 'absolute',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'pointer-events': 'none',
          'z-index': 1,
        },
        [`.${prefixCls}-collapse`]: {
          position: 'absolute',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'z-index': 2,
          border: `1px solid ${t.colorBorderSecondary}`,
          background: t.colorBgContainer,
          color: t.colorTextSecondary,
          'font-size': '10px',
          'line-height': 1,
          cursor: 'pointer',
          'user-select': 'none',
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-collapse:hover`]: {
          border: `1px solid ${t.colorPrimary}`,
          color: t.colorPrimary,
        },
        [`.${prefixCls}-horizontal > .${prefixCls}-bar`]: {
          width: 0,
          cursor: 'col-resize',
        },
        [`.${prefixCls}-horizontal > .${prefixCls}-bar .${prefixCls}-bar-icon`]: {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
        [`.${prefixCls}-horizontal > .${prefixCls}-bar .${prefixCls}-collapse`]: {
          left: '50%',
          width: '16px',
          height: '24px',
          transform: 'translateX(-50%)',
        },
        [`.${prefixCls}-horizontal > .${prefixCls}-bar .${prefixCls}-collapse-start`]: {
          top: 'calc(50% - 28px)',
        },
        [`.${prefixCls}-horizontal > .${prefixCls}-bar .${prefixCls}-collapse-end`]: {
          top: 'calc(50% + 4px)',
        },
        [`.${prefixCls}-horizontal > .${prefixCls}-bar::before`]: {
          top: 0,
          bottom: 0,
          left: '-1px',
          width: '2px',
        },
        [`.${prefixCls}-horizontal > .${prefixCls}-bar::after`]: {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '-4px',
          width: '8px',
        },
        [`.${prefixCls}-vertical > .${prefixCls}-bar`]: {
          height: 0,
          cursor: 'row-resize',
        },
        [`.${prefixCls}-vertical > .${prefixCls}-bar .${prefixCls}-bar-icon`]: {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
        [`.${prefixCls}-vertical > .${prefixCls}-bar .${prefixCls}-collapse`]: {
          top: '50%',
          width: '24px',
          height: '16px',
          transform: 'translateY(-50%)',
        },
        [`.${prefixCls}-vertical > .${prefixCls}-bar .${prefixCls}-collapse-start`]: {
          left: 'calc(50% - 28px)',
        },
        [`.${prefixCls}-vertical > .${prefixCls}-bar .${prefixCls}-collapse-end`]: {
          left: 'calc(50% + 4px)',
        },
        [`.${prefixCls}-vertical > .${prefixCls}-bar::before`]: {
          left: 0,
          right: 0,
          top: '-1px',
          height: '2px',
        },
        [`.${prefixCls}-vertical > .${prefixCls}-bar::after`]: {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          top: '-4px',
          height: '8px',
        },
      }
    },
  )
}
