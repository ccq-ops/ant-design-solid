import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useAffixStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Affix', prefixCls] }, () => ({
    [`.${prefixCls}-wrapper`]: {
      display: 'block',
    },
    [`.${prefixCls}`]: {
      'z-index': 10,
    },
  }))
}
