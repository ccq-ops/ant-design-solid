import type { MasonryBreakpoint, MasonryResponsiveValue } from './interface'

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

export function formatMasonryGap(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}
