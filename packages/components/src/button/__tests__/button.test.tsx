import { fireEvent, render } from '@solidjs/testing-library'
import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { SearchOutlined } from '@ant-design-solid/solid-icons'
import { darkAlgorithm } from '@ant-design-solid/theme'
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

  it('uses ConfigProvider disabled and button defaults', () => {
    const result = render(() => (
      <ConfigProvider
        componentDisabled
        button={{
          class: 'configured-button',
          autoInsertSpace: false,
          color: 'blue',
          variant: 'filled',
        }}
      >
        <Button>按钮</Button>
      </ConfigProvider>
    ))
    const button = result.getByRole('button') as HTMLButtonElement

    expect(button.disabled).toBe(true)
    expect(button.className).toContain('configured-button')
    expect(button.className).toContain('ads-btn-color-blue')
    expect(button.className).toContain('ads-btn-variant-filled')
    expect(button).toHaveTextContent('按钮')
  })

  it('merges ConfigProvider button style before local style', () => {
    const result = render(() => (
      <ConfigProvider button={{ style: { color: 'red', 'background-color': 'white' } }}>
        <Button style={{ color: 'blue' }}>Styled</Button>
      </ConfigProvider>
    ))
    const button = result.getByRole('button') as HTMLButtonElement

    expect(button.style.color).toBe('blue')
    expect(button.style.backgroundColor).toBe('white')
  })

  it('renders an icon from the icons package before children by default', () => {
    const result = render(() => <Button icon={<SearchOutlined />}>Search</Button>)
    const button = result.getByRole('button')
    const iconWrapper = button.querySelector('.ads-btn-icon')
    const content = button.querySelector('.ads-btn-content')

    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper?.className).toContain('ads-btn-icon-start')
    expect(iconWrapper?.querySelector('svg')).not.toBeNull()
    expect(button.firstElementChild).toBe(iconWrapper)
    expect(content).not.toBeNull()
    expect(content).toHaveTextContent('Search')
    expect(button).toHaveTextContent('Search')
  })

  it('supports semantic classNames and styles for root, icon and content', () => {
    const result = render(() => (
      <Button
        icon={<SearchOutlined />}
        classNames={{ root: 'semantic-root', icon: 'semantic-icon', content: 'semantic-content' }}
        styles={{
          root: { width: '160px' },
          icon: { color: 'red' },
          content: { color: 'blue' },
        }}
      >
        Search
      </Button>
    ))
    const button = result.getByRole('button') as HTMLButtonElement
    const icon = button.querySelector<HTMLElement>('.ads-btn-icon')
    const content = button.querySelector<HTMLElement>('.ads-btn-content')

    expect(button).toHaveClass('semantic-root')
    expect(button.style.width).toBe('160px')
    expect(icon).toHaveClass('semantic-icon')
    expect(icon?.style.color).toBe('red')
    expect(content).toHaveClass('semantic-content')
    expect(content?.style.color).toBe('blue')
  })

  it('supports function semantic props and rootClass', () => {
    const result = render(() => (
      <Button
        rootClass="root-extra"
        type="primary"
        classNames={({ props }) => ({
          root: props.type === 'primary' ? 'semantic-primary' : 'semantic-default',
          content: 'semantic-content',
        })}
        styles={({ props }) => ({ content: { color: props.type === 'primary' ? 'red' : 'blue' } })}
      >
        Submit
      </Button>
    ))
    const button = result.getByRole('button') as HTMLButtonElement
    const content = button.querySelector<HTMLElement>('.ads-btn-content')

    expect(button).toHaveClass('root-extra')
    expect(button).toHaveClass('semantic-primary')
    expect(content).toHaveClass('semantic-content')
    expect(content?.style.color).toBe('red')
  })

  it('merges ConfigProvider button semantic props before local semantic props', () => {
    const result = render(() => (
      <ConfigProvider
        button={{
          classNames: { root: 'config-root', icon: 'config-icon', content: 'config-content' },
          styles: {
            root: { width: '120px', height: '40px' },
            icon: { color: 'green' },
            content: { color: 'green', 'font-weight': 400 },
          },
        }}
      >
        <Button
          icon={<SearchOutlined />}
          classNames={{ root: 'local-root', content: 'local-content' }}
          styles={{ root: { width: '180px' }, content: { color: 'purple' } }}
        >
          Search
        </Button>
      </ConfigProvider>
    ))
    const button = result.getByRole('button') as HTMLButtonElement
    const icon = button.querySelector<HTMLElement>('.ads-btn-icon')
    const content = button.querySelector<HTMLElement>('.ads-btn-content')

    expect(button).toHaveClass('config-root')
    expect(button).toHaveClass('local-root')
    expect(button.style.width).toBe('180px')
    expect(button.style.height).toBe('40px')
    expect(icon).toHaveClass('config-icon')
    expect(icon?.style.color).toBe('green')
    expect(content).toHaveClass('config-content')
    expect(content).toHaveClass('local-content')
    expect(content?.style.color).toBe('purple')
    expect(content?.style.fontWeight).toBe('400')
  })

  it('supports custom prefixCls on Button', () => {
    const result = render(() => (
      <Button prefixCls="custom-button" icon={<SearchOutlined />}>
        Search
      </Button>
    ))
    const button = result.getByRole('button')

    expect(button).toHaveClass('custom-button')
    expect(button.querySelector('.custom-button-icon')).not.toBeNull()
    expect(button.querySelector('.custom-button-content')).not.toBeNull()
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
      <Button
        href="https://example.com"
        target="_blank"
        rel="noopener"
        download="report.txt"
        disabled
        onClick={onClick}
      >
        Link
      </Button>
    ))
    const link = result.getByRole('link') as HTMLAnchorElement

    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener')
    expect(link.getAttribute('download')).toBe('report.txt')
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

  it('keeps link type buttons aligned with other button types', () => {
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <Button type="primary">Primary Button</Button>
        <Button>Default Button</Button>
        <Button type="link">Link Button</Button>
      </StyleProvider>
    ))

    const [primary, defaultButton, link] = result.getAllByRole('button')
    const css = extractStyle(cache)

    expect(getComputedStyle(link).height).toBe(getComputedStyle(primary).height)
    expect(getComputedStyle(link).height).toBe(getComputedStyle(defaultButton).height)
    expect(css).not.toContain('height:auto;')
    expect(css).toContain(
      '.ads-btn-color-primary.ads-btn-variant-link{background:transparent;border-color:transparent;color:#1677ff;',
    )
    expect(css).not.toContain(
      '.ads-btn-color-primary.ads-btn-variant-link{background:transparent;border-color:transparent;color:#1677ff;height:auto;padding:0;',
    )
  })

  it('uses antd v6 text button state styles', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Button type="text">Text</Button>
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain(
      '.ads-btn-color-default.ads-btn-variant-text{background:transparent;border-color:transparent;box-shadow:none;color:rgba(0,0,0,0.88);',
    )
    expect(css).toContain(
      '.ads-btn-color-default.ads-btn-variant-text:active{background:rgba(0,0,0,0.15);border-color:transparent;color:rgba(0,0,0,0.88);',
    )
    expect(css).toContain(
      '.ads-btn-color-default.ads-btn-variant-text:hover{background:rgba(0,0,0,0.04);border-color:transparent;color:rgba(0,0,0,0.88);',
    )
    expect(css).toContain(
      '.ads-btn-color-default.ads-btn-variant-text[disabled], .ads-btn-color-default.ads-btn-variant-text.ads-btn-disabled{background:transparent;border-color:transparent;box-shadow:none;color:rgba(0,0,0,0.25);',
    )
  })

  it('keeps default solid buttons readable in dark theme', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
          <Button color="default" variant="solid">
            Default Solid
          </Button>
        </ConfigProvider>
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain(
      '.ads-btn-variant-solid{background:rgba(255,255,255,0.95);border-color:transparent;color:#000;',
    )
  })

  it('keeps ghost button colors readable in dark theme without losing color semantics', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
          <Button ghost>Default Ghost</Button>
          <Button type="primary" ghost>
            Primary Ghost
          </Button>
        </ConfigProvider>
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain(
      '.ads-btn-color-default.ads-btn-background-ghost{border-color:#fff;color:#fff;',
    )
    expect(css).toContain(
      '.ads-btn-color-primary.ads-btn-variant-outlined{border-color:#1668dc;color:#1668dc;',
    )
    expect(css).toContain('.ads-btn-background-ghost.ads-btn-variant-outlined,')
    expect(css).toContain('.ads-btn-background-ghost.ads-btn-variant-link{background:transparent;')
    expect(css).toContain('.ads-btn-background-ghost{background:transparent;box-shadow:none;')
    expect(css).not.toContain(
      '.ads-btn-background-ghost{background:transparent;border-color:#141414;box-shadow:none;color:#141414;',
    )
  })
})
