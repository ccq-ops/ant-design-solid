import { createMemo, createSignal, onCleanup, onMount, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { BarsOutlined, LeftOutlined, RightOutlined } from '@solid-ant-design/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { LayoutContext, useLayoutContext } from './context'
import { useLayoutStyle } from './layout.style'
import type {
  LayoutContentProps,
  LayoutFooterProps,
  LayoutHeaderProps,
  LayoutProps,
  LayoutSiderBreakpoint,
  LayoutSiderCollapseType,
  LayoutSiderProps,
} from './interface'

const breakpointMaxMap: Record<LayoutSiderBreakpoint, string> = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px',
  xxxl: '1839.98px',
}

let siderIdSeed = 0

function toCssSize(value: number | string | undefined, fallback: number): string {
  if (value === undefined) return `${fallback}px`
  return typeof value === 'number' ? `${value}px` : value
}

function numericSize(value: number | string | undefined, fallback: number): number {
  const normalized = value ?? fallback
  if (typeof normalized === 'number') return normalized
  const parsed = Number.parseFloat(normalized)
  return Number.isNaN(parsed) ? fallback : parsed
}

function defaultArrowIcon(collapsed: boolean, reverseArrow: boolean): JSX.Element {
  if (reverseArrow) return collapsed ? <LeftOutlined /> : <RightOutlined />
  return collapsed ? <RightOutlined /> : <LeftOutlined />
}

function createLayoutPart(part: 'header' | 'footer' | 'content') {
  return function LayoutPart(props: LayoutHeaderProps | LayoutFooterProps | LayoutContentProps) {
    const [local, rest] = splitProps(props, ['children', 'class'])
    const config = useConfig()
    const prefixCls = () => `${config.prefixCls()}-layout`
    const [, hashId] = useLayoutStyle(prefixCls())
    const className = () => classNames(`${prefixCls()}-${part}`, hashId(), local.class)

    if (part === 'header') {
      return (
        <header {...rest} class={className()}>
          {local.children}
        </header>
      )
    }

    if (part === 'footer') {
      return (
        <footer {...rest} class={className()}>
          {local.children}
        </footer>
      )
    }

    return (
      <main {...rest} class={className()}>
        {local.children}
      </main>
    )
  }
}

export function Header(props: LayoutHeaderProps) {
  const Component = createLayoutPart('header')
  return <Component {...props} />
}

export function Footer(props: LayoutFooterProps) {
  const Component = createLayoutPart('footer')
  return <Component {...props} />
}

export function Content(props: LayoutContentProps) {
  const Component = createLayoutPart('content')
  return <Component {...props} />
}

export function Sider(props: LayoutSiderProps) {
  const layoutContext = useLayoutContext()
  const siderId = `ads-layout-sider-${++siderIdSeed}`
  const [local, rest] = splitProps(props, [
    'width',
    'collapsedWidth',
    'collapsed',
    'collapsible',
    'defaultCollapsed',
    'reverseArrow',
    'trigger',
    'zeroWidthTriggerStyle',
    'breakpoint',
    'theme',
    'onBreakpoint',
    'onCollapse',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-layout`
  const [, hashId] = useLayoutStyle(prefixCls())
  const theme = () => local.theme ?? 'dark'
  const [innerCollapsed, setInnerCollapsed] = createSignal(local.defaultCollapsed ?? false)
  const [below, setBelow] = createSignal(false)
  const mergedCollapsed = () => local.collapsed ?? innerCollapsed()
  const siderWidth = () =>
    mergedCollapsed() ? toCssSize(local.collapsedWidth, 80) : toCssSize(local.width, 200)
  const isZeroWidth = () =>
    numericSize(mergedCollapsed() ? local.collapsedWidth : local.width, 200) === 0
  const style = () => ({
    '--ads-layout-sider-width': siderWidth(),
    ...(typeof local.style === 'object' ? local.style : {}),
  })
  const setCollapsed = (nextCollapsed: boolean, type: LayoutSiderCollapseType) => {
    if (local.collapsed === undefined) {
      setInnerCollapsed(nextCollapsed)
    }
    local.onCollapse?.(nextCollapsed, type)
  }
  const toggle = () => setCollapsed(!mergedCollapsed(), 'clickTrigger')
  const triggerContent = () =>
    local.trigger === undefined
      ? defaultArrowIcon(mergedCollapsed(), local.reverseArrow ?? false)
      : local.trigger
  const zeroWidthTrigger = () =>
    numericSize(local.collapsedWidth, 80) === 0 ? (
      <span
        class={classNames(
          `${prefixCls()}-sider-zero-width-trigger`,
          `${prefixCls()}-sider-zero-width-trigger-${local.reverseArrow ? 'right' : 'left'}`,
        )}
        style={local.zeroWidthTriggerStyle}
        onClick={toggle}
      >
        {local.trigger === undefined ? <BarsOutlined /> : local.trigger}
      </span>
    ) : null
  const triggerDom = () => {
    if (local.trigger === null) return null
    const zeroTrigger = zeroWidthTrigger()
    if (zeroTrigger) return zeroTrigger

    return (
      <div class={`${prefixCls()}-sider-trigger`} style={{ width: siderWidth() }} onClick={toggle}>
        {triggerContent()}
      </div>
    )
  }

  onMount(() => {
    layoutContext.addSider(siderId)
    onCleanup(() => layoutContext.removeSider(siderId))
  })

  onMount(() => {
    const breakpoint = local.breakpoint
    if (!breakpoint || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mql = window.matchMedia(`screen and (max-width: ${breakpointMaxMap[breakpoint]})`)
    const responsiveHandler = (event: MediaQueryListEvent | MediaQueryList) => {
      const broken = event.matches
      setBelow(broken)
      local.onBreakpoint?.(broken)
      if (mergedCollapsed() !== broken) {
        setCollapsed(broken, 'responsive')
      }
    }

    mql.addEventListener('change', responsiveHandler)
    responsiveHandler(mql)
    onCleanup(() => mql.removeEventListener('change', responsiveHandler))
  })

  return (
    <aside
      {...rest}
      class={classNames(
        `${prefixCls()}-sider`,
        `${prefixCls()}-sider-${theme()}`,
        mergedCollapsed() && `${prefixCls()}-sider-collapsed`,
        local.collapsible &&
          local.trigger !== null &&
          numericSize(local.collapsedWidth, 80) !== 0 &&
          `${prefixCls()}-sider-has-trigger`,
        below() && `${prefixCls()}-sider-below`,
        isZeroWidth() && `${prefixCls()}-sider-zero-width`,
        hashId(),
        local.class,
      )}
      style={style()}
    >
      <div class={`${prefixCls()}-sider-children`}>{local.children}</div>
      {local.collapsible || (below() && zeroWidthTrigger()) ? triggerDom() : null}
    </aside>
  )
}

export interface LayoutComponent {
  (props: LayoutProps): JSX.Element
  Header: typeof Header
  Footer: typeof Footer
  Content: typeof Content
  Sider: typeof Sider
}

function BaseLayout(props: LayoutProps) {
  const [local, rest] = splitProps(props, ['hasSider', 'children', 'class'])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-layout`
  const [, hashId] = useLayoutStyle(prefixCls())
  const [siders, setSiders] = createSignal<string[]>([])
  const hasSider = () => local.hasSider || siders().length > 0
  const contextValue = createMemo(() => ({
    addSider: (id: string) => setSiders((prev) => (prev.includes(id) ? prev : [...prev, id])),
    removeSider: (id: string) => setSiders((prev) => prev.filter((currentId) => currentId !== id)),
  }))

  return (
    <LayoutContext.Provider value={contextValue()}>
      <section
        {...rest}
        class={classNames(
          prefixCls(),
          hasSider() && `${prefixCls()}-has-sider`,
          hashId(),
          local.class,
        )}
      >
        {local.children}
      </section>
    </LayoutContext.Provider>
  )
}

export const Layout = BaseLayout as LayoutComponent
Layout.Header = Header
Layout.Footer = Footer
Layout.Content = Content
Layout.Sider = Sider
