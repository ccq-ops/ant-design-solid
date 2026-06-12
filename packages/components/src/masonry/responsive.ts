import type { MasonryBreakpoint, MasonryGutter, MasonryResponsiveValue } from './interface'

export const MASONRY_BREAKPOINTS: Record<MasonryBreakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
}

const orderedBreakpoints = Object.entries(MASONRY_BREAKPOINTS) as [MasonryBreakpoint, number][]

function isResponsiveObject<T>(
  value: MasonryResponsiveValue<T> | undefined,
): value is Partial<Record<MasonryBreakpoint, T>> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function resolveResponsiveValue<T>(
  value: MasonryResponsiveValue<T> | undefined,
  fallback: T,
  width: number,
): T {
  if (!isResponsiveObject(value)) return value ?? fallback

  let resolved = fallback
  for (const [breakpoint, minWidth] of orderedBreakpoints) {
    if (width >= minWidth && value[breakpoint] !== undefined) {
      resolved = value[breakpoint] as T
    }
  }
  return resolved
}

export function resolveMasonryGutter(
  gutter: MasonryGutter | undefined,
  width: number,
): [horizontal: string, vertical: string, verticalSize: number] {
  const [horizontalInput, verticalInput] = Array.isArray(gutter) ? gutter : [gutter, gutter]
  const horizontal = resolveResponsiveValue(horizontalInput, 0, width) ?? 0
  const vertical = resolveResponsiveValue(verticalInput, horizontal, width) ?? 0
  return [`${horizontal}px`, `${vertical}px`, vertical]
}
