import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useFlexStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Flex', prefixCls] }, () => ({
    [`.${prefixCls}`]: {
      display: 'flex',
    },
    [`.${prefixCls}-inline`]: {
      display: 'inline-flex',
    },
    [`.${prefixCls}-vertical`]: {
      'flex-direction': 'column',
    },
    [`.${prefixCls}-wrap`]: {
      'flex-wrap': 'wrap',
    },
    [`.${prefixCls}-wrap-reverse`]: {
      'flex-wrap': 'wrap-reverse',
    },
    [`.${prefixCls}-nowrap`]: {
      'flex-wrap': 'nowrap',
    },
  }))
}
