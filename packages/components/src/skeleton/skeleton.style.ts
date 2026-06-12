import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useSkeletonStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Skeleton', prefixCls] },
    () => {
      const t = token()
      return {
        '@keyframes adsSkeletonLoading': {
          from: {
            transform: 'translateX(-100%)',
          },
          to: {
            transform: 'translateX(100%)',
          },
        },
        [`.${prefixCls}`]: {
          display: 'flex',
          width: '100%',
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': `${t.lineHeight}`,
        },
        [`.${prefixCls}-header`]: {
          flex: '0 0 auto',
          'margin-inline-end': `${t.margin}px`,
        },
        [`.${prefixCls}-section`]: {
          flex: '1',
          width: '100%',
          'min-width': 0,
        },
        [`.${prefixCls}-title, .${prefixCls}-paragraph > li, .${prefixCls}-avatar, .${prefixCls}-button, .${prefixCls}-input, .${prefixCls}-image, .${prefixCls}-node`]:
          {
            position: 'relative',
            overflow: 'hidden',
            background: t.colorFillAlter,
          },
        [`.${prefixCls}-element`]: {
          display: 'inline-block',
          width: 'auto',
        },
        [`.${prefixCls}-element .${prefixCls}-button, .${prefixCls}-element .${prefixCls}-input, .${prefixCls}-element .${prefixCls}-avatar, .${prefixCls}-element .${prefixCls}-image, .${prefixCls}-element .${prefixCls}-node`]:
          {
            display: 'inline-block',
            'vertical-align': 'top',
          },
        [`.${prefixCls}-block`]: {
          width: '100%',
        },
        [`.${prefixCls}-block .${prefixCls}-button, .${prefixCls}-block .${prefixCls}-input`]: {
          width: '100%',
        },
        [`.${prefixCls}-button`]: {
          width: '64px',
          height: '32px',
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-button-sm`]: {
          width: '48px',
          height: '24px',
        },
        [`.${prefixCls}-button-lg`]: {
          width: '80px',
          height: '40px',
        },
        [`.${prefixCls}-button-circle`]: {
          width: '32px',
          'border-radius': '50%',
        },
        [`.${prefixCls}-button-sm.${prefixCls}-button-circle`]: {
          width: '24px',
        },
        [`.${prefixCls}-button-lg.${prefixCls}-button-circle`]: {
          width: '40px',
        },
        [`.${prefixCls}-button-round`]: {
          'border-radius': '100px',
        },
        [`.${prefixCls}-button-square`]: {
          width: '32px',
        },
        [`.${prefixCls}-button-sm.${prefixCls}-button-square`]: {
          width: '24px',
        },
        [`.${prefixCls}-button-lg.${prefixCls}-button-square`]: {
          width: '40px',
        },
        [`.${prefixCls}-input`]: {
          width: '160px',
          height: '32px',
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-input-sm`]: {
          height: '24px',
        },
        [`.${prefixCls}-input-lg`]: {
          height: '40px',
        },
        [`.${prefixCls}-element .${prefixCls}-avatar`]: {
          'margin-inline-end': 0,
        },
        [`.${prefixCls}-image, .${prefixCls}-node`]: {
          width: '96px',
          height: '96px',
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-image-svg`]: {
          width: '48px',
          height: '48px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fill: t.colorTextDisabled,
        },
        [`.${prefixCls}-image-path`]: {
          fill: t.colorTextDisabled,
        },
        [`.${prefixCls}-node`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        [`.${prefixCls}-title, .${prefixCls}-paragraph > li, .${prefixCls}-avatar`]: {
          position: 'relative',
          overflow: 'hidden',
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-title`]: {
          width: '38%',
          height: '16px',
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-title + .${prefixCls}-paragraph`]: {
          'margin-top': `${t.marginLG}px`,
        },
        [`.${prefixCls}-paragraph`]: {
          margin: 0,
          padding: 0,
          'list-style': 'none',
        },
        [`.${prefixCls}-paragraph > li`]: {
          width: '100%',
          height: '16px',
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-paragraph > li + li`]: {
          'margin-top': `${t.margin}px`,
        },
        [`.${prefixCls}-paragraph > li:last-child:not(:first-child)`]: {
          width: '61%',
        },
        [`.${prefixCls}-avatar`]: {
          flex: '0 0 auto',
          width: '32px',
          height: '32px',
          'border-radius': '50%',
        },
        [`.${prefixCls}-avatar-square`]: {
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-avatar-circle`]: {
          'border-radius': '50%',
        },
        [`.${prefixCls}-avatar-sm`]: {
          width: '24px',
          height: '24px',
        },
        [`.${prefixCls}-avatar-lg`]: {
          width: '40px',
          height: '40px',
        },
        [`.${prefixCls}-round .${prefixCls}-title, .${prefixCls}-round .${prefixCls}-paragraph > li`]:
          {
            'border-radius': '100px',
          },
        [`.${prefixCls}-active .${prefixCls}-title::after, .${prefixCls}-active .${prefixCls}-paragraph > li::after, .${prefixCls}-active .${prefixCls}-avatar::after, .${prefixCls}-active .${prefixCls}-button::after, .${prefixCls}-active .${prefixCls}-input::after, .${prefixCls}-active .${prefixCls}-image::after, .${prefixCls}-active .${prefixCls}-node::after`]:
          {
            position: 'absolute',
            inset: 0,
            transform: 'translateX(-100%)',
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0))',
            animation: `adsSkeletonLoading 1.4s ${t.motionEaseInOut} infinite`,
            content: '""',
          },
      }
    },
  )
}
