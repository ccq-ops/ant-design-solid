import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useBreadcrumbStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Breadcrumb', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
        },
        [`.${prefixCls}-list`]: {
          display: 'flex',
          'flex-wrap': 'wrap',
          margin: 0,
          padding: 0,
          'list-style': 'none',
        },
        [`.${prefixCls}-item`]: {
          display: 'inline-flex',
          'align-items': 'center',
        },
        [`.${prefixCls}-link`]: {
          color: t.colorTextSecondary,
          'text-decoration': 'none',
          transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-link[href], .${prefixCls}-link-clickable`]: {
          cursor: 'pointer',
          '&:hover': {
            color: t.colorPrimaryHover,
          },
        },
        [`.${prefixCls}-link-clickable`]: {
          background: 'transparent',
          border: 0,
          padding: 0,
          'font-size': 'inherit',
          'font-family': 'inherit',
          'line-height': 'inherit',
        },
        [`.${prefixCls}-link-clickable:focus-visible, .${prefixCls}-link[href]:focus-visible`]: {
          outline: `${t.lineWidth}px solid ${t.colorPrimary}`,
          'outline-offset': '2px',
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-link[aria-current="page"]`]: {
          color: t.colorText,
          cursor: 'default',
          '&:hover': {
            color: t.colorText,
          },
        },
        [`.${prefixCls}-separator`]: {
          margin: `0 ${t.marginXS}px`,
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-item:last-child > .${prefixCls}-separator`]: {
          display: 'none',
        },
      }
    },
  )
}
