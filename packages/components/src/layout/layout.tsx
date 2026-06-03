import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useLayoutStyle } from './layout.style'
import type {
  LayoutContentProps,
  LayoutFooterProps,
  LayoutHeaderProps,
  LayoutProps,
  LayoutSiderProps,
} from './interface'

function toCssSize(value: number | string | undefined, fallback: number): string {
  if (value === undefined) return `${fallback}px`
  return typeof value === 'number' ? `${value}px` : value
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
  const [local, rest] = splitProps(props, [
    'width',
    'collapsedWidth',
    'collapsed',
    'theme',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-layout`
  const [, hashId] = useLayoutStyle(prefixCls())
  const theme = () => local.theme ?? 'dark'
  const style = () => ({
    '--ads-layout-sider-width': toCssSize(local.width, 200),
    '--ads-layout-sider-collapsed-width': toCssSize(local.collapsedWidth, 80),
    ...(typeof local.style === 'object' ? local.style : {}),
  })

  return (
    <aside
      {...rest}
      class={classNames(
        `${prefixCls()}-sider`,
        `${prefixCls()}-sider-${theme()}`,
        local.collapsed && `${prefixCls()}-sider-collapsed`,
        hashId(),
        local.class,
      )}
      style={style()}
    >
      {local.children}
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

  return (
    <section
      {...rest}
      class={classNames(
        prefixCls(),
        local.hasSider && `${prefixCls()}-has-sider`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
    </section>
  )
}

export const Layout = BaseLayout as LayoutComponent
Layout.Header = Header
Layout.Footer = Footer
Layout.Content = Content
Layout.Sider = Sider
