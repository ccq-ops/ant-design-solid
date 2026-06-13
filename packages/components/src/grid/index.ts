export { Col } from './col'
export { Row } from './row'
import { useBreakpoint } from '../shared/responsive-observer'
import type { ColProps, ColSize, Gutter, RowProps } from './interface'

const Grid = { useBreakpoint }

export { Grid, useBreakpoint }
export type { Breakpoint, ScreenMap } from '../shared/responsive-observer'
export type { ColProps, ColSize, Gutter, RowProps }
export default Grid
