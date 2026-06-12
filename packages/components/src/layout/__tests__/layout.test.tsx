import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Layout } from '../index'
import type { LayoutSiderCollapseType } from '../interface'

describe('Layout', () => {
  it('renders a layout container with content children', () => {
    const result = render(() => <Layout data-testid="layout">Page</Layout>)
    const layout = result.getByTestId('layout')

    expect(layout.tagName).toBe('SECTION')
    expect(layout.className).toContain('ads-layout')
    expect(layout.className).not.toContain('ads-layout-has-sider')
    expect(layout).toHaveTextContent('Page')
  })

  it('renders header, content, and footer in order', () => {
    const result = render(() => (
      <Layout data-testid="layout">
        <Layout.Header>Header</Layout.Header>
        <Layout.Content>Main</Layout.Content>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>
    ))
    const layout = result.getByTestId('layout')

    expect(layout.children[0]).toHaveClass('ads-layout-header')
    expect(layout.children[1]).toHaveClass('ads-layout-content')
    expect(layout.children[2]).toHaveClass('ads-layout-footer')
    expect(result.getByText('Header').tagName).toBe('HEADER')
    expect(result.getByText('Main').tagName).toBe('MAIN')
    expect(result.getByText('Footer').tagName).toBe('FOOTER')
  })

  it('renders sider with theme, collapsed state, and width variables', () => {
    const result = render(() => (
      <Layout.Sider data-testid="sider" theme="light" width={240} collapsedWidth={64} collapsed>
        Nav
      </Layout.Sider>
    ))
    const sider = result.getByTestId('sider')

    expect(sider.tagName).toBe('ASIDE')
    expect(sider.className).toContain('ads-layout-sider')
    expect(sider.className).toContain('ads-layout-sider-light')
    expect(sider.className).toContain('ads-layout-sider-collapsed')
    expect(sider.style.getPropertyValue('--ads-layout-sider-width')).toBe('64px')
  })

  it('uses hasSider to switch layout direction', () => {
    const result = render(() => (
      <Layout hasSider data-testid="layout">
        <Layout.Sider>Sider</Layout.Sider>
        <Layout.Content>Main</Layout.Content>
      </Layout>
    ))

    expect(result.getByTestId('layout').className).toContain('ads-layout-has-sider')
  })

  it('automatically detects nested siders', () => {
    const result = render(() => (
      <Layout data-testid="layout">
        <Layout.Sider>Sider</Layout.Sider>
        <Layout.Content>Main</Layout.Content>
      </Layout>
    ))

    expect(result.getByTestId('layout').className).toContain('ads-layout-has-sider')
  })

  it('supports uncontrolled collapsible sider with a default collapsed state', () => {
    const calls: Array<[boolean, LayoutSiderCollapseType]> = []
    const result = render(() => (
      <Layout.Sider
        data-testid="sider"
        collapsible
        defaultCollapsed
        onCollapse={(collapsed, type) => calls.push([collapsed, type])}
      >
        Nav
      </Layout.Sider>
    ))
    const sider = result.getByTestId('sider')

    expect(sider.className).toContain('ads-layout-sider-collapsed')
    expect(sider.querySelector('.ads-layout-sider-trigger svg')).not.toBeNull()

    fireEvent.click(sider.querySelector('.ads-layout-sider-trigger')!)

    expect(sider.className).not.toContain('ads-layout-sider-collapsed')
    expect(calls).toEqual([[false, 'clickTrigger']])
  })

  it('supports controlled collapsed state without mutating internally', () => {
    const [collapsed, setCollapsed] = createSignal(true)
    const calls: boolean[] = []
    const result = render(() => (
      <Layout.Sider
        data-testid="sider"
        collapsible
        collapsed={collapsed()}
        onCollapse={(nextCollapsed) => {
          calls.push(nextCollapsed)
        }}
      >
        Nav
      </Layout.Sider>
    ))
    const sider = result.getByTestId('sider')

    fireEvent.click(sider.querySelector('.ads-layout-sider-trigger')!)

    expect(calls).toEqual([false])
    expect(sider.className).toContain('ads-layout-sider-collapsed')

    setCollapsed(false)
    expect(sider.className).not.toContain('ads-layout-sider-collapsed')
  })

  it('supports custom trigger content and trigger null', () => {
    const withTrigger = render(() => (
      <Layout.Sider collapsible trigger={<button type="button">Toggle</button>}>
        Nav
      </Layout.Sider>
    ))
    expect(withTrigger.getByText('Toggle')).toBeInTheDocument()

    const withoutTrigger = render(() => (
      <Layout.Sider data-testid="sider" collapsible trigger={null}>
        Nav
      </Layout.Sider>
    ))
    expect(
      withoutTrigger.getByTestId('sider').querySelector('.ads-layout-sider-trigger'),
    ).toBeNull()
  })

  it('renders zero-width trigger when collapsedWidth is zero', () => {
    const result = render(() => (
      <Layout.Sider
        data-testid="sider"
        collapsible
        collapsed
        collapsedWidth={0}
        zeroWidthTriggerStyle={{ top: '12px' }}
      >
        Nav
      </Layout.Sider>
    ))
    const sider = result.getByTestId('sider')
    const trigger = sider.querySelector('.ads-layout-sider-zero-width-trigger') as HTMLElement

    expect(sider.className).toContain('ads-layout-sider-zero-width')
    expect(sider.querySelector('.ads-layout-sider-children')).not.toBeNull()
    expect(trigger).not.toBeNull()
    expect(trigger.className).toContain('ads-layout-sider-zero-width-trigger-left')
    expect(trigger.style.top).toBe('12px')
  })

  it('supports reverse arrow zero-width trigger placement', () => {
    const result = render(() => (
      <Layout.Sider data-testid="sider" collapsible collapsed collapsedWidth={0} reverseArrow>
        Nav
      </Layout.Sider>
    ))

    expect(
      result.getByTestId('sider').querySelector('.ads-layout-sider-zero-width-trigger-right'),
    ).not.toBeNull()
  })

  it('collapses responsively at the configured breakpoint', () => {
    const listeners: Array<(event: MediaQueryListEvent | MediaQueryList) => void> = []
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: (_event: 'change', listener: (event: MediaQueryListEvent) => void) => {
        listeners.push(listener as (event: MediaQueryListEvent | MediaQueryList) => void)
      },
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    })) as typeof window.matchMedia

    const breakpoints: boolean[] = []
    const collapses: Array<[boolean, LayoutSiderCollapseType]> = []

    try {
      const result = render(() => (
        <Layout.Sider
          data-testid="sider"
          breakpoint="lg"
          onBreakpoint={(broken) => breakpoints.push(broken)}
          onCollapse={(collapsed, type) => collapses.push([collapsed, type])}
        >
          Nav
        </Layout.Sider>
      ))

      expect(window.matchMedia).toHaveBeenCalledWith('screen and (max-width: 991.98px)')
      expect(result.getByTestId('sider').className).toContain('ads-layout-sider-below')
      expect(result.getByTestId('sider').className).toContain('ads-layout-sider-collapsed')
      expect(breakpoints).toEqual([true])
      expect(collapses).toEqual([[true, 'responsive']])

      listeners[0]({
        matches: false,
        media: 'screen and (max-width: 991.98px)',
      } as MediaQueryListEvent)

      expect(result.getByTestId('sider').className).not.toContain('ads-layout-sider-below')
      expect(result.getByTestId('sider').className).not.toContain('ads-layout-sider-collapsed')
      expect(breakpoints).toEqual([true, false])
      expect(collapses).toEqual([
        [true, 'responsive'],
        [false, 'responsive'],
      ])
    } finally {
      window.matchMedia = originalMatchMedia
    }
  })

  it('respects ConfigProvider prefix and extra classes', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Layout hasSider class="shell" data-testid="layout">
          <Layout.Sider class="nav">Sider</Layout.Sider>
        </Layout>
      </ConfigProvider>
    ))

    expect(result.getByTestId('layout').className).toContain('custom-layout')
    expect(result.getByTestId('layout').className).toContain('custom-layout-has-sider')
    expect(result.getByTestId('layout').className).toContain('shell')
    const sider = result.getByText('Sider').parentElement!
    expect(sider.className).toContain('custom-layout-sider')
    expect(sider.className).toContain('nav')
  })
})
