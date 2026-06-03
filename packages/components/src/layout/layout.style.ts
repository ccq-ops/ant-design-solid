import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useLayoutStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Layout', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        display: 'flex',
        flex: 'auto',
        'flex-direction': 'column',
        'min-height': 0,
        'box-sizing': 'border-box',
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        background: t.colorFillAlter,
      },
      [`.${prefixCls}, .${prefixCls} *`]: {
        'box-sizing': 'border-box',
      },
      [`.${prefixCls}-has-sider`]: {
        'flex-direction': 'row',
      },
      [`.${prefixCls}-header`]: {
        flex: '0 0 auto',
        height: '64px',
        padding: `0 ${t.paddingLG}px`,
        color: '#fff',
        'line-height': '64px',
        background: '#001529',
      },
      [`.${prefixCls}-footer`]: {
        flex: '0 0 auto',
        padding: `${t.padding}px ${t.paddingLG}px`,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-content`]: {
        flex: 'auto',
        'min-height': 0,
      },
      [`.${prefixCls}-sider`]: {
        position: 'relative',
        flex: '0 0 var(--ads-layout-sider-width, 200px)',
        width: 'var(--ads-layout-sider-width, 200px)',
        'min-width': 'var(--ads-layout-sider-width, 200px)',
        'max-width': 'var(--ads-layout-sider-width, 200px)',
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-sider-collapsed`]: {
        flex: '0 0 var(--ads-layout-sider-collapsed-width, 80px)',
        width: 'var(--ads-layout-sider-collapsed-width, 80px)',
        'min-width': 'var(--ads-layout-sider-collapsed-width, 80px)',
        'max-width': 'var(--ads-layout-sider-collapsed-width, 80px)',
      },
      [`.${prefixCls}-sider-dark`]: {
        color: '#fff',
        background: '#001529',
      },
      [`.${prefixCls}-sider-light`]: {
        color: t.colorText,
        background: t.colorBgContainer,
        'border-inline-end': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
    }
  })
}
