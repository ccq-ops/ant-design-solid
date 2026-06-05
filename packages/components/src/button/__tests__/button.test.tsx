import { fireEvent, render } from '@solidjs/testing-library'
import { SearchOutlined } from '@ant-design-solid/icons'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Button } from '../index'

describe('Button', () => {
  it('renders children and Ant Design-like classes', () => {
    const result = render(() => <Button type="primary">Primary</Button>)
    const button = result.getByRole('button')
    expect(button).toHaveTextContent('Primary')
    expect(button.className).toContain('ads-btn')
    expect(button.className).toContain('ads-btn-primary')
  })
  it('supports size, danger, block, htmlType, disabled and loading states', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Button
        type="default"
        size="large"
        danger
        block
        loading
        disabled
        htmlType="submit"
        onClick={onClick}
      >
        Save
      </Button>
    ))
    const button = result.getByRole('button') as HTMLButtonElement
    expect(button.type).toBe('submit')
    expect(button.disabled).toBe(true)
    expect(button.className).toContain('ads-btn-lg')
    expect(button.className).toContain('ads-btn-dangerous')
    expect(button.className).toContain('ads-btn-block')
    expect(button.className).toContain('ads-btn-loading')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Button>Button</Button>
      </ConfigProvider>
    ))
    expect(result.getByRole('button').className).toContain('custom-btn')
  })

  it('renders an icon from the icons package before children by default', () => {
    const result = render(() => <Button icon={<SearchOutlined />}>Search</Button>)
    const button = result.getByRole('button')
    const iconWrapper = button.querySelector('.ads-btn-icon')

    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper?.className).toContain('ads-btn-icon-start')
    expect(iconWrapper?.querySelector('svg')).not.toBeNull()
    expect(button.firstElementChild).toBe(iconWrapper)
    expect(button).toHaveTextContent('Search')
  })

  it('renders the icon after children when iconPosition is end', () => {
    const result = render(() => (
      <Button icon={<SearchOutlined />} iconPosition="end">
        Search
      </Button>
    ))
    const button = result.getByRole('button')
    const iconWrapper = button.querySelector('.ads-btn-icon')

    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper?.className).toContain('ads-btn-icon-end')
    expect(button.lastElementChild).toBe(iconWrapper)
  })

  it('uses the loading icon instead of a custom icon while loading', () => {
    const result = render(() => (
      <Button icon={<SearchOutlined data-testid="search-icon" />} loading>
        Search
      </Button>
    ))
    const button = result.getByRole('button')
    const iconWrapper = button.querySelector('.ads-btn-icon')

    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper?.querySelector('svg')).not.toBeNull()
    expect(result.queryByTestId('search-icon')).toBeNull()
    expect(button.className).toContain('ads-btn-loading')
  })
})
