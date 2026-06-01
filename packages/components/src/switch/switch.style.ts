import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useSwitchStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Switch', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        minWidth: 44,
        height: 22,
        padding: `0 ${t.paddingXS}px`,
        border: 0,
        'border-radius': 999,
        color: t.colorBgContainer,
        background: t.colorTextDisabled,
        cursor: 'pointer',
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-checked`]: { background: t.colorPrimary },
      [`.${prefixCls}-disabled`]: { cursor: 'not-allowed', opacity: 0.65 },
      [`.${prefixCls}-loading`]: { cursor: 'not-allowed' },
      [`.${prefixCls}-sm`]: { minWidth: 28, height: 16, 'font-size': `${t.fontSize}px` },
      [`.${prefixCls}-inner`]: { display: 'inline-flex', 'align-items': 'center' },
    }
  })
}
