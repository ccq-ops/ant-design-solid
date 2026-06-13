import { getComponentToken } from '@ant-design-solid/theme'
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useAnchorStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Anchor', prefixCls] }, () => {
    const t = token()
    const anchor = getComponentToken('Anchor', t)
    const holderOffsetBlock = t.paddingXXS
    const secondaryPaddingBlock = t.paddingXXS / 2
    const titleBlock = (t.fontSize / 14) * 3

    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        position: 'relative',
        margin: 0,
        padding: 0,
        'padding-inline-start': `${t.lineWidthBold}px`,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        '&::before': {
          content: '" "',
          position: 'absolute',
          'inset-inline-start': 0,
          top: 0,
          height: '100%',
          'border-inline-start': `${t.lineWidthBold}px ${t.lineType} ${t.colorSplit}`,
        },
      },
      [`.${prefixCls}-wrapper`]: {
        'margin-block-start': `-${holderOffsetBlock}px`,
        'padding-block-start': `${holderOffsetBlock}px`,
      },
      [`.${prefixCls}-list`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-link`]: {
        margin: 0,
        'padding-block': `${anchor.linkPaddingBlock}px`,
        'padding-inline': `${anchor.linkPaddingInlineStart}px 0`,
      },
      [`.${prefixCls}-link .${prefixCls}-link`]: {
        'padding-block': `${secondaryPaddingBlock}px`,
      },
      [`.${prefixCls}-link-title`]: {
        position: 'relative',
        display: 'block',
        color: t.colorText,
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
        'margin-block-end': `${titleBlock}px`,
        transition: `all ${t.motionDurationSlow}`,
        '&:only-child': {
          'margin-block-end': 0,
        },
        '&:hover': {
          color: t.colorPrimary,
        },
      },
      [`.${prefixCls}-link-title-active`]: {
        color: t.colorPrimary,
      },
      [`.${prefixCls}-ink`]: {
        position: 'absolute',
        'inset-inline-start': 0,
        transform: 'translateY(-50%)',
        transition: `top ${t.motionDurationSlow} ${t.motionEaseInOut}`,
        width: `${t.lineWidthBold}px`,
        'background-color': t.colorPrimary,
      },
      [`.${prefixCls}-horizontal`]: {
        overflow: 'auto hidden',
        display: 'flex',
        'scrollbar-width': 'none',
        'padding-inline-start': 0,
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        '&::before': {
          left: 0,
          right: 0,
          top: 'auto',
          bottom: 0,
          height: 0,
          'border-inline-start': 0,
          'border-bottom': `${t.lineWidth}px ${t.lineType} ${t.colorSplit}`,
        },
      },
      [`.${prefixCls}-horizontal > .${prefixCls}-list`]: {
        display: 'flex',
        'align-items': 'center',
      },
      [`.${prefixCls}-horizontal .${prefixCls}-list .${prefixCls}-list`]: {
        display: 'none',
      },
      [`.${prefixCls}-horizontal .${prefixCls}-link:first-of-type`]: {
        'padding-inline-start': 0,
      },
      [`.${prefixCls}-horizontal .${prefixCls}-link-title`]: {
        'margin-block-end': 0,
      },
      [`.${prefixCls}-horizontal .${prefixCls}-ink`]: {
        'inset-inline-start': 'auto',
        bottom: 0,
        transform: 'none',
        height: `${t.lineWidthBold}px`,
        transition: [
          `left ${t.motionDurationSlow} ${t.motionEaseInOut}`,
          `width ${t.motionDurationSlow} ${t.motionEaseInOut}`,
        ].join(', '),
      },
    }
  })
}
