import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'
export function useSpaceStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Space', prefixCls] }, () => {
    const st = getComponentToken('Space', token())
    return {
      [`.${prefixCls}`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: `${st.gapMiddle}px`,
      },
      [`.${prefixCls}-vertical`]: { 'flex-direction': 'column', 'align-items': 'stretch' },
      [`.${prefixCls}-wrap`]: { 'flex-wrap': 'wrap' },
      [`.${prefixCls}-item`]: { display: 'inline-flex' },
      [`.${prefixCls}-split`]: { color: token().colorTextSecondary },
    }
  })
}
