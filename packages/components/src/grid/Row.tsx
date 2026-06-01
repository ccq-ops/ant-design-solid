import { splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import { useGridStyle } from './grid.style'
import type { Gutter, RowProps } from './interface'
function normalizeGutter(gutter: Gutter | undefined): [number, number] { return Array.isArray(gutter) ? gutter : [gutter ?? 0, 0] }
function justifyToCss(justify: RowProps['justify']) { if (justify === 'start') return 'flex-start'; if (justify === 'end') return 'flex-end'; return justify }
function alignToCss(align: RowProps['align']) { if (align === 'top') return 'flex-start'; if (align === 'middle') return 'center'; if (align === 'bottom') return 'flex-end'; return align }
export function Row(props: RowProps) { const [local, rest] = splitProps(props, ['gutter', 'align', 'justify', 'wrap', 'class', 'style', 'children']); const config = useConfig(); const rowPrefixCls = () => `${config.prefixCls()}-row`; const colPrefixCls = () => `${config.prefixCls()}-col`; const [, hashId] = useGridStyle(rowPrefixCls(), colPrefixCls()); const gutter = () => normalizeGutter(local.gutter); return <div {...rest} class={classNames(rowPrefixCls(), local.wrap === false && `${rowPrefixCls()}-nowrap`, hashId(), local.class)} style={{ 'margin-left': gutter()[0] ? `${gutter()[0] / -2}px` : undefined, 'margin-right': gutter()[0] ? `${gutter()[0] / -2}px` : undefined, 'row-gap': gutter()[1] ? `${gutter()[1]}px` : undefined, 'justify-content': justifyToCss(local.justify), 'align-items': alignToCss(local.align), ...(typeof local.style === 'object' ? local.style : {}) }}>{local.children}</div> }
