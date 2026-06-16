import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useBreadcrumbStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Breadcrumb', prefixCls] },
    () => {
      const t = token()
      const bt = getComponentToken('Breadcrumb', t) ?? {
        itemColor: t.colorTextDescription,
        lastItemColor: t.colorText,
        iconFontSize: t.fontSize,
        linkColor: t.colorTextDescription,
        linkHoverColor: t.colorText,
        separatorColor: t.colorTextDescription,
        separatorMargin: t.marginXS,
      }
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: bt.itemColor,
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
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXXS}px`,
          color: bt.linkColor,
          'text-decoration': 'none',
          transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-link[href], .${prefixCls}-link-clickable`]: {
          cursor: 'pointer',
        },
        [`.${prefixCls}-link[href]:hover, .${prefixCls}-link-clickable:hover`]: {
          color: bt.linkHoverColor,
        },
        [`.${prefixCls}-link-clickable`]: {
          background: 'transparent',
          border: 0,
          padding: 0,
          'font-size': 'inherit',
          'font-family': 'inherit',
          'line-height': 'inherit',
        },
        [`.${prefixCls}-overlay-link`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXXS}px`,
        },
        [`.${prefixCls}-dropdown-icon`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'line-height': 1,
          color: bt.itemColor,
          'font-size': `${bt.iconFontSize}px`,
        },
        [`.${prefixCls}-overlay-link:hover .${prefixCls}-link, .${prefixCls}-overlay-link:hover .${prefixCls}-dropdown-icon`]:
          {
            color: bt.linkHoverColor,
          },
        [`.${prefixCls}-link-clickable:focus-visible, .${prefixCls}-link[href]:focus-visible`]: {
          outline: `${t.lineWidth}px solid ${t.colorPrimary}`,
          'outline-offset': '2px',
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-link[aria-current="page"]`]: {
          color: bt.lastItemColor,
          cursor: 'default',
          '&:hover': {
            color: bt.lastItemColor,
          },
        },
        [`.${prefixCls}-item:last-child .${prefixCls}-link`]: {
          color: bt.lastItemColor,
        },
        [`.${prefixCls}-separator`]: {
          margin: `0 ${bt.separatorMargin}px`,
          color: bt.separatorColor,
        },
        [`.${prefixCls}-item:last-child > .${prefixCls}-separator`]: {
          display: 'none',
        },
      }
    },
  )
}
