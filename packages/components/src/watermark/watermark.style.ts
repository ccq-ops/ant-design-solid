import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useWatermarkStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Watermark', prefixCls] },
    () => ({
      [`.${prefixCls}`]: { position: 'relative' },
      [`.${prefixCls}-watermark`]: {
        position: 'absolute',
        inset: '0',
        'pointer-events': 'none',
        overflow: 'hidden',
      },
    }),
  )
}
