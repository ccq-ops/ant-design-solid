import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useListyStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Listy', prefixCls] }, () => {
    const t = token()
    const listy = getComponentToken('Listy', t)
    return {
      [`.${prefixCls}`]: {
        position: 'relative',
        color: t.colorText,
        'font-size': t.fontSize,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'box-sizing': 'border-box',
        'overflow-anchor': 'none',
      },
      [`.${prefixCls}-item`]: {
        padding: `${listy.itemPaddingBlock}px ${listy.itemPaddingInline}px`,
        'border-bottom': `${t.lineWidth}px ${t.lineType} ${t.colorSplit}`,
        'box-sizing': 'border-box',
        transition: `background-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:hover': {
          background: t.controlItemBgHover,
        },
      },
      [`.${prefixCls}-group-header`]: {
        padding: `${t.paddingXS}px ${listy.itemPaddingInline}px`,
        color: t.colorTextDescription,
        'font-weight': t.fontWeightStrong,
        background: t.colorBgContainer,
        'background-image': `linear-gradient(${t.colorFillAlter}, ${t.colorFillAlter})`,
        'box-sizing': 'border-box',
      },
      [`.${prefixCls}-group-header-sticky`]: {
        position: 'sticky',
        top: 0,
        'z-index': 1,
      },
      [`.${prefixCls}-group-header-holder`]: {
        position: 'sticky',
        top: 0,
        'z-index': 2,
        height: 0,
        overflow: 'visible',
      },
      [`.${prefixCls}-group-section`]: {
        position: 'relative',
      },
      [`.${prefixCls}-virtual-holder`]: {
        position: 'relative',
        width: '100%',
      },
      [`.${prefixCls}-virtual-row`]: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      },
      [`.${prefixCls}-rtl`]: {
        direction: 'rtl',
      },
    }
  })
}
