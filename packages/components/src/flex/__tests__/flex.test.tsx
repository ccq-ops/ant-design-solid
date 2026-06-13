import { render } from '@solidjs/testing-library'
import type { JSX } from 'solid-js'
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

  it('supports custom component prop in Solid style', () => {
    function Article(props: JSX.HTMLAttributes<HTMLElement>) {
      return <article {...props} data-custom-component="true" />
    }

    const result = render(() => (
      <Flex component={Article} data-testid="flex">
        Article content
      </Flex>
    ))
    const flex = result.getByTestId('flex')
    expect(flex.tagName).toBe('ARTICLE')
    expect(flex).toHaveAttribute('data-custom-component', 'true')
  })

  it('supports orientation and lets it override vertical', () => {
    const result = render(() => (
      <>
        <Flex orientation="vertical" data-testid="vertical">
          Item
        </Flex>
        <Flex orientation="horizontal" vertical data-testid="horizontal">
          Item
        </Flex>
      </>
    ))

    expect(result.getByTestId('vertical')).toHaveClass('ads-flex-vertical')
    expect(result.getByTestId('vertical').style.flexDirection).toBe('column')
    expect(result.getByTestId('vertical').style.alignItems).toBe('stretch')
    expect(result.getByTestId('horizontal')).not.toHaveClass('ads-flex-vertical')
    expect(result.getByTestId('horizontal').style.flexDirection).toBe('row')
  })

  it('supports flex, rootClassName, v6 gap aliases and css string gaps', () => {
    const result = render(() => (
      <>
        <Flex flex="1 1 auto" rootClassName="root-flex" gap="medium" data-testid="medium">
          Item
        </Flex>
        <Flex gap="8px 16px" data-testid="string-gap">
          Item
        </Flex>
      </>
    ))

    expect(result.getByTestId('medium')).toHaveClass('root-flex')
    expect(result.getByTestId('medium').style.flex).toBe('1 1 auto')
    expect(result.getByTestId('medium').style.gap).toBe('16px')
    expect(result.getByTestId('string-gap').style.gap).toBe('8px 16px')
  })

  it('accepts full css justify and align values', () => {
    const result = render(() => (
      <>
        <Flex justify="start" align="self-end" data-testid="logical">
          Item
        </Flex>
        <Flex justify="normal" align="normal" data-testid="normal">
          Item
        </Flex>
      </>
    ))

    expect(result.getByTestId('logical').style.justifyContent).toBe('start')
    expect(result.getByTestId('logical').style.alignItems).toBe('self-end')
    expect(result.getByTestId('normal').style.justifyContent).toBe('normal')
    expect(result.getByTestId('normal').style.alignItems).toBe('normal')
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
