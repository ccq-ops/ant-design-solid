import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useTreeStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Tree', prefixCls] }, () => {
    const t = token()
    const tree = getComponentToken('Tree', t)
    return {
      [`.${prefixCls}`]: {
        margin: '0',
        padding: '0',
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'list-style': 'none',
      },
      [`.${prefixCls}-node`]: {
        display: 'flex',
        'align-items': 'center',
        gap: `${t.paddingXS}px`,
        'min-height': `${t.controlHeightSM}px`,
        padding: `${t.paddingXS / 2}px ${t.paddingXS}px`,
        'border-radius': `${t.borderRadius}px`,
        cursor: 'pointer',
        transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-block-node .${prefixCls}-node`]: { width: '100%' },
      [`.${prefixCls}-node:not(.${prefixCls}-node-selected):not(.${prefixCls}-node-disabled):hover`]:
        { background: t.colorFillAlter },
      [`.${prefixCls}-node-selected`]: { background: tree.nodeSelectedBg, color: t.colorPrimary },
      [`.${prefixCls}-node-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
      [`.${prefixCls}-node-disabled:hover`]: { background: 'transparent' },
      [`.${prefixCls}-node-filtered .${prefixCls}-title`]: {
        color: t.colorPrimary,
        'font-weight': 600,
      },
      [`.${prefixCls}-switcher`]: {
        border: '0',
        padding: '0',
        width: '16px',
        height: '16px',
        color: 'inherit',
        background: 'transparent',
        cursor: 'pointer',
        'line-height': '16px',
      },
      [`.${prefixCls}-switcher-disabled`]: { cursor: 'not-allowed' },
      [`.${prefixCls}-indent`]: { display: 'inline-block', width: '16px', 'flex-shrink': 0 },
      [`.${prefixCls}-checkbox`]: { margin: '0', cursor: 'pointer' },
      [`.${prefixCls}-checkbox:disabled`]: { cursor: 'not-allowed' },
      [`.${prefixCls}-icon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        color: t.colorTextSecondary,
      },
      [`.${prefixCls}-title`]: { 'user-select': 'none' },
      [`.${prefixCls}-line .${prefixCls}-node`]: {
        'border-left': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-directory`]: {
        [`& .${prefixCls}-node-selected, & .${prefixCls}-node-selected:hover`]: {
          background: t.colorPrimary,
          color: '#fff',
        },
        [`& .${prefixCls}-node-selected .${prefixCls}-icon, & .${prefixCls}-node-selected:hover .${prefixCls}-icon`]:
          {
            color: 'inherit',
          },
      },
    }
  })
}
