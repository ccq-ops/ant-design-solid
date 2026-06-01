import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'
export function useButtonStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Button', prefixCls] }, () => {
    const t = token(); const bt = getComponentToken('Button', t)
    return {
      [`.${prefixCls}`]: { 'box-sizing': 'border-box', margin: 0, padding: `4px ${bt.paddingInline}px`, color: t.colorText, 'font-size': `${t.fontSize}px`, 'font-family': t.fontFamily, 'line-height': t.lineHeight, height: t.controlHeight, border: `${t.lineWidth}px solid ${bt.defaultBorderColor}`, 'border-radius': bt.borderRadius, background: t.colorBgContainer, cursor: 'pointer', transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`, '&:hover': { color: t.colorPrimaryHover, borderColor: t.colorPrimaryHover }, '&[disabled]': { color: t.colorTextDisabled, cursor: 'not-allowed', background: t.colorFillAlter, borderColor: t.colorBorder } },
      [`.${prefixCls}-primary`]: { color: bt.primaryColor, background: t.colorPrimary, borderColor: t.colorPrimary, '&:hover': { color: bt.primaryColor, background: t.colorPrimaryHover, borderColor: t.colorPrimaryHover } },
      [`.${prefixCls}-dashed`]: { borderStyle: 'dashed' }, [`.${prefixCls}-text`]: { borderColor: 'transparent', background: 'transparent' }, [`.${prefixCls}-link`]: { borderColor: 'transparent', background: 'transparent', color: t.colorPrimary },
      [`.${prefixCls}-sm`]: { height: t.controlHeightSM, padding: `0 ${t.paddingSM}px` }, [`.${prefixCls}-lg`]: { height: t.controlHeightLG, padding: `6px ${t.paddingLG}px` }, [`.${prefixCls}-dangerous`]: { color: t.colorError, borderColor: t.colorError }, [`.${prefixCls}-block`]: { width: '100%' }, [`.${prefixCls}-loading`]: { cursor: 'default' }, [`.${prefixCls}-icon`]: { display: 'inline-flex', 'margin-inline-end': 8 },
    }
  })
}
