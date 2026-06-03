import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Flex } from '../index'

describe('Flex', () => {
  it('renders children and default classes', () => {
    const result = render(() => (
      <Flex>
        <span>One</span>
        <span>Two</span>
      </Flex>
    ))
    const flex = result.getByText('One').parentElement as HTMLElement
    expect(flex.className).toContain('ads-flex')
    expect(flex).toHaveTextContent('One')
    expect(flex).toHaveTextContent('Two')
  })

  it('supports vertical, wrap, justify, align and numeric gap', () => {
    const result = render(() => (
      <Flex vertical wrap justify="space-between" align="center" gap={12} data-testid="flex">
        Item
      </Flex>
    ))
    const flex = result.getByTestId('flex')
    expect(flex.className).toContain('ads-flex-vertical')
    expect(flex.className).toContain('ads-flex-wrap')
    expect(flex.style.flexDirection).toBe('column')
    expect(flex.style.flexWrap).toBe('wrap')
    expect(flex.style.justifyContent).toBe('space-between')
    expect(flex.style.alignItems).toBe('center')
    expect(flex.style.columnGap).toBe('12px')
    expect(flex.style.rowGap).toBe('12px')
  })

  it('supports tuple gaps and string wrap values', () => {
    const result = render(() => (
      <Flex wrap="wrap-reverse" gap={[8, 16]} data-testid="flex">
        Item
      </Flex>
    ))
    const flex = result.getByTestId('flex')
    expect(flex.className).toContain('ads-flex-wrap-reverse')
    expect(flex.style.flexWrap).toBe('wrap-reverse')
    expect(flex.style.columnGap).toBe('8px')
    expect(flex.style.rowGap).toBe('16px')
  })

  it('supports semantic component prop', () => {
    const result = render(() => (
      <Flex component="section" data-testid="flex">
        Section content
      </Flex>
    ))
    expect(result.getByTestId('flex').tagName).toBe('SECTION')
  })

  it('merges user style after computed style', () => {
    const result = render(() => (
      <Flex gap={8} justify="center" style={{ 'justify-content': 'flex-end' }} data-testid="flex">
        Item
      </Flex>
    ))
    const flex = result.getByTestId('flex')
    expect(flex.style.columnGap).toBe('8px')
    expect(flex.style.justifyContent).toBe('flex-end')
  })

  it('supports custom prefixCls', () => {
    const result = render(() => (
      <Flex prefixCls="custom-flex" data-testid="flex">
        Item
      </Flex>
    ))
    expect(result.getByTestId('flex').className).toContain('custom-flex')
  })

  it('uses ConfigProvider prefix', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Flex data-testid="flex">Item</Flex>
      </ConfigProvider>
    ))
    expect(result.getByTestId('flex').className).toContain('custom-flex')
  })
})
