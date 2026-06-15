import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useNotificationStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Notification', prefixCls] },
    () => {
      const t = token()
      const nt = getComponentToken('Notification', t)
      const edge = nt.notificationMarginEdge
      const placementBase = { position: 'fixed', 'z-index': nt.zIndexPopup, 'margin-inline': edge }
      return {
        [`.${prefixCls}-top`]: {
          ...placementBase,
          top: edge,
          left: '50%',
          transform: 'translateX(-50%)',
        },
        [`.${prefixCls}-top-right`]: { ...placementBase, top: edge, right: 0 },
        [`.${prefixCls}-top-left`]: { ...placementBase, top: edge, left: 0 },
        [`.${prefixCls}-bottom`]: {
          ...placementBase,
          bottom: edge,
          left: '50%',
          transform: 'translateX(-50%)',
        },
        [`.${prefixCls}-bottom-right`]: { ...placementBase, bottom: edge, right: 0 },
        [`.${prefixCls}-bottom-left`]: { ...placementBase, bottom: edge, left: 0 },
        [`.${prefixCls}-notice`]: {
          position: 'relative',
          width: nt.width,
          padding: nt.notificationPadding,
          'margin-bottom': nt.notificationMarginBottom,
          color: t.colorText,
          background: nt.notificationBg,
          'border-radius': t.borderRadiusLG,
          'box-shadow': t.boxShadow,
          'overflow-wrap': 'break-word',
        },
        [`.${prefixCls}-notice-wrapper`]: {
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-stack .${prefixCls}-notice-wrapper:not(:last-child)`]: {
          'margin-bottom': -48,
        },
        [`.${prefixCls}-notice-stacked`]: { transform: 'scale(0.96)', opacity: 0.88 },
        [`.${prefixCls}-stack .${prefixCls}-notice-wrapper:last-child .${prefixCls}-notice`]: {
          transform: 'scale(1)',
          opacity: 1,
        },
        [`.${prefixCls}-notice-title`]: {
          display: 'flex',
          'align-items': 'center',
          gap: t.marginXS,
          'font-weight': 600,
          'font-size': t.fontSizeLG,
          'line-height': t.lineHeightLG,
        },
        [`.${prefixCls}-notice-closable .${prefixCls}-notice-title`]: {
          'padding-inline-end': nt.notificationCloseButtonSize,
        },
        [`.${prefixCls}-notice-description`]: {
          color: t.colorTextSecondary,
          'margin-top': t.marginXS,
        },
        [`.${prefixCls}-notice-actions`]: { 'margin-top': t.marginSM },
        [`.${prefixCls}-notice-progress`]: {
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: nt.notificationProgressHeight,
          width: '100%',
          background: nt.notificationProgressBg,
          'transform-origin': 'left center',
          animation: `${prefixCls}-progress linear forwards`,
        },
        [`@keyframes ${prefixCls}-progress`]: {
          from: { transform: 'scaleX(1)' },
          to: { transform: 'scaleX(0)' },
        },
        [`.${prefixCls}-notice-close`]: {
          position: 'absolute',
          top: nt.notificationPaddingVertical,
          right: nt.notificationPaddingHorizontal,
          width: nt.notificationCloseButtonSize,
          height: nt.notificationCloseButtonSize,
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          color: t.colorTextSecondary,
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: 0,
        },
        [`.${prefixCls}-notice-icon`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'font-size': nt.notificationIconSize,
          'line-height': 1,
          'flex-shrink': 0,
        },
        [`.${prefixCls}-notice-success`]: { background: nt.colorSuccessBg },
        [`.${prefixCls}-notice-info`]: { background: nt.colorInfoBg },
        [`.${prefixCls}-notice-warning`]: { background: nt.colorWarningBg },
        [`.${prefixCls}-notice-error`]: { background: nt.colorErrorBg },
        [`.${prefixCls}-notice-icon-success`]: { color: t.colorSuccess },
        [`.${prefixCls}-notice-icon-info`]: { color: t.colorInfo },
        [`.${prefixCls}-notice-icon-warning`]: { color: t.colorWarning },
        [`.${prefixCls}-notice-icon-error`]: { color: t.colorError },
      }
    },
  )
}
