import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useProgressStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Progress', prefixCls] },
    () => {
      const t = token()
      return {
        '@keyframes adsProgressActive': {
          from: {
            transform: 'translateX(-100%)',
          },
          to: {
            transform: 'translateX(100%)',
          },
        },
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
          width: '100%',
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': `${t.lineHeight}`,
          listStyle: 'none',
        },
        [`.${prefixCls}-outer`]: {
          display: 'inline-block',
          width: '100%',
        },
        [`.${prefixCls}-inner`]: {
          position: 'relative',
          display: 'inline-block',
          width: '100%',
          overflow: 'hidden',
          'vertical-align': 'middle',
          background: t.colorBorderSecondary,
          'border-radius': '100px',
        },
        [`.${prefixCls}-bg`]: {
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
          background: t.colorPrimary,
          'border-radius': '100px',
          transition: `width ${t.motionDurationMid} ${t.motionEaseInOut}, background ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-status-active .${prefixCls}-bg::before`]: {
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.35)',
          animation: `adsProgressActive 2s ${t.motionEaseInOut} infinite`,
          content: '""',
        },
        [`.${prefixCls}-status-success .${prefixCls}-bg`]: {
          background: t.colorSuccess,
        },
        [`.${prefixCls}-status-exception .${prefixCls}-bg`]: {
          background: t.colorError,
        },
        [`.${prefixCls}-text`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'min-width': '2em',
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
          'white-space': 'nowrap',
        },
        [`.${prefixCls}-status-success .${prefixCls}-text`]: {
          color: t.colorSuccess,
        },
        [`.${prefixCls}-status-exception .${prefixCls}-text`]: {
          color: t.colorError,
        },
        [`.${prefixCls}-circle`]: {
          position: 'relative',
          width: 'auto',
          'flex-direction': 'column',
          'align-items': 'center',
        },
        [`.${prefixCls}-circle-outer`]: {
          position: 'relative',
          display: 'inline-block',
          width: '120px',
          height: '120px',
        },
        [`.${prefixCls}-circle svg`]: {
          display: 'block',
        },
        [`.${prefixCls}-circle-trail`]: {
          stroke: t.colorBorderSecondary,
        },
        [`.${prefixCls}-circle-path`]: {
          stroke: t.colorPrimary,
          transition: `stroke-dashoffset ${t.motionDurationMid} ${t.motionEaseInOut}, stroke ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-status-success .${prefixCls}-circle-path`]: {
          stroke: t.colorSuccess,
        },
        [`.${prefixCls}-status-exception .${prefixCls}-circle-path`]: {
          stroke: t.colorError,
        },
        [`.${prefixCls}-circle .${prefixCls}-text`]: {
          position: 'absolute',
          inset: 0,
          'font-size': `${t.fontSize + 2}px`,
        },
      }
    },
  )
}
