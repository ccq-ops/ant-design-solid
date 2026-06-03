import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Layout } from '../index'

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
    expect(sider.style.getPropertyValue('--ads-layout-sider-width')).toBe('240px')
    expect(sider.style.getPropertyValue('--ads-layout-sider-collapsed-width')).toBe('64px')
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
    expect(result.getByText('Sider').className).toContain('custom-layout-sider')
    expect(result.getByText('Sider').className).toContain('nav')
  })
})
