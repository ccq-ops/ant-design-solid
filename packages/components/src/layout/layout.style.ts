import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useLayoutStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Layout', prefixCls] }, () => {
    const t = token()
    const layout = getComponentToken('Layout', t)
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
        background: layout.bodyBg,
      },
      [`.${prefixCls}, .${prefixCls} *`]: {
        'box-sizing': 'border-box',
      },
      [`.${prefixCls}-has-sider`]: {
        'flex-direction': 'row',
      },
      [`.${prefixCls}-header`]: {
        flex: '0 0 auto',
        height: `${layout.headerHeight}px`,
        padding: layout.headerPadding,
        color: layout.headerColor,
        'line-height': `${layout.headerHeight}px`,
        background: layout.headerBg,
      },
      [`.${prefixCls}-footer`]: {
        flex: '0 0 auto',
        padding: layout.footerPadding,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        background: layout.footerBg,
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
        flex: '0 0 var(--ads-layout-sider-width, 80px)',
        width: 'var(--ads-layout-sider-width, 80px)',
        'min-width': 'var(--ads-layout-sider-width, 80px)',
        'max-width': 'var(--ads-layout-sider-width, 80px)',
      },
      [`.${prefixCls}-sider-dark`]: {
        color: layout.triggerColor,
        background: layout.siderBg,
      },
      [`.${prefixCls}-sider-light`]: {
        color: t.colorText,
        background: layout.lightSiderBg,
        'border-inline-end': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-sider-children`]: {
        height: '100%',
        'margin-top': 0,
        'padding-top': 0,
      },
      [`.${prefixCls}-sider-has-trigger`]: {
        'padding-bottom': `${layout.triggerHeight}px`,
      },
      [`.${prefixCls}-sider-trigger`]: {
        position: 'absolute',
        bottom: 0,
        insetInlineStart: 0,
        zIndex: 1,
        height: `${layout.triggerHeight}px`,
        color: layout.triggerColor,
        'line-height': `${layout.triggerHeight}px`,
        'text-align': 'center',
        background: layout.triggerBg,
        cursor: 'pointer',
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-sider-light .${prefixCls}-sider-trigger`]: {
        color: layout.lightTriggerColor,
        background: layout.lightTriggerBg,
      },
      [`.${prefixCls}-sider-zero-width`]: {
        overflow: 'visible',
      },
      [`.${prefixCls}-sider-zero-width .${prefixCls}-sider-children`]: {
        overflow: 'hidden',
      },
      [`.${prefixCls}-sider-zero-width-trigger`]: {
        position: 'absolute',
        top: `${layout.headerHeight}px`,
        zIndex: 1,
        width: `${layout.zeroTriggerWidth}px`,
        height: `${layout.zeroTriggerHeight}px`,
        color: layout.triggerColor,
        'font-size': `${t.fontSizeLG}px`,
        'line-height': `${layout.zeroTriggerHeight}px`,
        'text-align': 'center',
        background: layout.siderBg,
        'border-radius': `0 ${t.borderRadius}px ${t.borderRadius}px 0`,
        cursor: 'pointer',
        transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-sider-zero-width-trigger-left`]: {
        insetInlineEnd: `-${layout.zeroTriggerWidth}px`,
      },
      [`.${prefixCls}-sider-zero-width-trigger-right`]: {
        insetInlineStart: `-${layout.zeroTriggerWidth}px`,
        'border-radius': `${t.borderRadius}px 0 0 ${t.borderRadius}px`,
      },
      [`.${prefixCls}-sider-light .${prefixCls}-sider-zero-width-trigger`]: {
        color: layout.lightTriggerColor,
        background: layout.lightTriggerBg,
        'border-inline-end': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
    }
  })
}
