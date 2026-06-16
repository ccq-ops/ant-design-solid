import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { AliasToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export const responsiveArray = ['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const
export const responsiveArrayReversed = [...responsiveArray].reverse()

export type Breakpoint = (typeof responsiveArray)[number]
export type ScreenMap = Partial<Record<Breakpoint, boolean>>
export type ResponsiveLike<T> = Partial<Record<Breakpoint, T>>

export function getResponsiveMap(token: AliasToken): Record<Breakpoint, string> {
  return {
    xs: `(min-width: ${token.screenXSMin}px)`,
    sm: `(min-width: ${token.screenSMMin}px)`,
    md: `(min-width: ${token.screenMDMin}px)`,
    lg: `(min-width: ${token.screenLGMin}px)`,
    xl: `(min-width: ${token.screenXLMin}px)`,
    xxl: `(min-width: ${token.screenXXLMin}px)`,
    xxxl: `(min-width: ${token.screenXXXLMin}px)`,
  }
}

export function isResponsiveObject<T>(
  value: T | ResponsiveLike<T> | undefined,
): value is ResponsiveLike<T> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export function resolveResponsiveValue<T>(
  value: T | ResponsiveLike<T> | undefined,
  screens: ScreenMap,
): T | undefined {
  if (!isResponsiveObject(value)) return value

  for (const breakpoint of responsiveArray) {
    if (screens[breakpoint] && value[breakpoint] !== undefined) return value[breakpoint]
  }

  for (const breakpoint of responsiveArrayReversed) {
    if (value[breakpoint] !== undefined) return value[breakpoint]
  }

  return undefined
}

export function useBreakpoint(): Accessor<ScreenMap> {
  const token = useToken()
  const responsiveMap = createMemo(() => getResponsiveMap(token()))
  const [screens, setScreens] = createSignal<ScreenMap>({})

  createEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setScreens({})
      return
    }

    const disposers: Array<() => void> = []

    Object.entries(responsiveMap()).forEach(([breakpoint, query]) => {
      const mediaQuery = window.matchMedia(query)
      const update = (event: Pick<MediaQueryListEvent, 'matches'> | MediaQueryList) => {
        setScreens((current) => ({ ...current, [breakpoint]: event.matches }))
      }

      update(mediaQuery)

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', update)
        disposers.push(() => mediaQuery.removeEventListener('change', update))
        return
      }

      mediaQuery.addListener?.(update)
      disposers.push(() => mediaQuery.removeListener?.(update))
    })

    onCleanup(() => disposers.forEach((dispose) => dispose()))
  })

  return screens
}
