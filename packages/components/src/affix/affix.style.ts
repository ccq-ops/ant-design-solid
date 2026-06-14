import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useAffixStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Affix', prefixCls] }, () => {
    const affixToken = getComponentToken('Affix', token())

    return {
      [`.${prefixCls}`]: {
        position: 'fixed',
        'z-index': affixToken.zIndexPopup,
      },
      [`.${prefixCls}-wrapper`]: {
        display: 'block',
      },
    }
  })
}
