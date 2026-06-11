import { fireEvent, render } from '@solidjs/testing-library'
import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
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

  it('does not add icon spacing when the button only contains an icon', () => {
    const result = render(() => <Button icon={<SearchOutlined />} aria-label="Search" />)
    const button = result.getByRole('button')
    const iconWrapper = button.querySelector('.ads-btn-icon')

    expect(button.className).toContain('ads-btn-icon-only')
    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper?.className).not.toContain('ads-btn-icon-start')
    expect(iconWrapper?.className).not.toContain('ads-btn-icon-end')
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

  it('renders loading icon through an Ant Design-like loading wrapper', () => {
    const result = render(() => <Button loading>Save</Button>)
    const button = result.getByRole('button')
    const loadingIcon = button.querySelector('.ads-btn-loading-icon')

    expect(loadingIcon).not.toBeNull()
    expect(loadingIcon?.querySelector('svg')).not.toBeNull()
  })

  it('registers loading icon rotation styles on the wrapper svg', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Button loading>Save</Button>
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain('@keyframes adsIconRotate{to{transform:rotate(360deg);}}')
    expect(css).toContain('.ads-btn-loading-icon svg{animation:adsIconRotate 1s linear infinite;')
  })

  it('renders an anchor when href is provided and prevents clicks while disabled', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Button href="https://example.com" target="_blank" disabled onClick={onClick}>
        Link
      </Button>
    ))
    const link = result.getByRole('link') as HTMLAnchorElement

    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.className).toContain('ads-btn-disabled')

    fireEvent.click(link)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('supports shape and ghost classes', () => {
    const circle = render(() => <Button shape="circle" ghost />).getByRole('button')
    expect(circle.className).toContain('ads-btn-circle')
    expect(circle.className).toContain('ads-btn-background-ghost')

    const round = render(() => <Button shape="round" />).getByRole('button')
    expect(round.className).toContain('ads-btn-round')
  })

  it('prefers iconPlacement over legacy iconPosition', () => {
    const result = render(() => (
      <Button icon={<SearchOutlined />} iconPosition="start" iconPlacement="end">
        Search
      </Button>
    ))
    const button = result.getByRole('button')
    const iconWrapper = button.querySelector('.ads-btn-icon')

    expect(iconWrapper?.className).toContain('ads-btn-icon-end')
    expect(button.lastElementChild).toBe(iconWrapper)
  })

  it('auto inserts a space between two Chinese characters by default', () => {
    const spaced = render(() => <Button>按钮</Button>).getByRole('button')
    expect(spaced).toHaveTextContent('按 钮')

    const compact = render(() => <Button autoInsertSpace={false}>按钮</Button>).getByRole('button')
    expect(compact).toHaveTextContent('按钮')
  })

  it('supports custom loading icon and delayed loading', async () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Button loading={{ delay: 100, icon: <span data-testid="custom-loading">loading</span> }}>
        Save
      </Button>
    ))
    const button = result.getByRole('button') as HTMLButtonElement

    expect(button.disabled).toBe(false)
    expect(button.className).not.toContain('ads-btn-loading')
    expect(result.queryByTestId('custom-loading')).toBeNull()

    await vi.advanceTimersByTimeAsync(100)

    expect(button.disabled).toBe(true)
    expect(button.className).toContain('ads-btn-loading')
    expect(result.getByTestId('custom-loading')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('adds normalized color and variant classes and lets explicit props override type mapping', () => {
    const primary = render(() => <Button type="primary">Primary</Button>).getByRole('button')
    expect(primary.className).toContain('ads-btn-color-primary')
    expect(primary.className).toContain('ads-btn-variant-solid')

    const overridden = render(() => (
      <Button type="primary" color="danger" variant="outlined">
        Danger
      </Button>
    )).getByRole('button')
    expect(overridden.className).toContain('ads-btn-color-danger')
    expect(overridden.className).toContain('ads-btn-variant-outlined')
    expect(overridden.className).not.toContain('ads-btn-variant-solid')

    const preset = render(() => (
      <Button color="blue" variant="filled">
        Blue
      </Button>
    )).getByRole('button')
    expect(preset.className).toContain('ads-btn-color-blue')
    expect(preset.className).toContain('ads-btn-variant-filled')
  })
})
