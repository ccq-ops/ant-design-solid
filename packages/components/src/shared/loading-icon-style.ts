import type { StyleObject } from '@ant-design-solid/cssinjs'

export const loadingIconRotateKeyframes: StyleObject = {
  '@keyframes adsIconRotate': {
    to: {
      transform: 'rotate(360deg)',
    },
  },
}

export function loadingIconRotateStyle(selector: string): StyleObject {
  return {
    [selector]: {
      animation: 'adsIconRotate 1s linear infinite',
    },
  }
}
