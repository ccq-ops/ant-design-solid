import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useAnchorStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Anchor', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
      },
      [`.${prefixCls}-list`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-list .${prefixCls}-list`]: {
        'padding-inline-start': `${t.padding}px`,
      },
      [`.${prefixCls}-link`]: {
        margin: 0,
        padding: `${t.paddingXS}px 0`,
      },
      [`.${prefixCls}-link-title`]: {
        position: 'relative',
        display: 'block',
        color: t.colorTextSecondary,
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
        transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:hover': {
          color: t.colorPrimary,
        },
      },
      [`.${prefixCls}-link-title-active`]: {
        color: t.colorPrimary,
        'font-weight': 500,
      },
      [`.${prefixCls}-link-title-active::before`]: {
        content: '""',
        position: 'absolute',
        inset: `0 auto 0 -${t.paddingXS}px`,
        width: `${t.lineWidth * 2}px`,
        background: t.colorPrimary,
      },
    }
  })
}
