import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function usePopconfirmStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Popconfirm', prefixCls] },
    () => {
      const t = token()
      const pt = getComponentToken('Popconfirm', t)
      return {
        [`.${prefixCls}`]: {
          position: 'fixed',
          width: pt.width,
          padding: pt.padding,
          color: t.colorText,
          background: pt.bg,
          'border-radius': pt.borderRadius,
          'box-shadow': pt.boxShadow,
        },
        [`.${prefixCls}-title`]: { 'font-weight': 600 },
        [`.${prefixCls}-description`]: { color: t.colorTextSecondary, 'margin-top': t.marginXS },
        [`.${prefixCls}-buttons`]: {
          display: 'flex',
          'justify-content': 'flex-end',
          gap: t.marginSM,
          'margin-top': t.margin,
        },
      }
    },
  )
}
