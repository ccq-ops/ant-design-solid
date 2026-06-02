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
        [`.${prefixCls}-content`]: {
          flex: '1',
          width: '100%',
          'min-width': 0,
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
          'margin-inline-end': `${t.margin}px`,
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
        [`.${prefixCls}-active .${prefixCls}-title::after, .${prefixCls}-active .${prefixCls}-paragraph > li::after, .${prefixCls}-active .${prefixCls}-avatar::after`]:
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
