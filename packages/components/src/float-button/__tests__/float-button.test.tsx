import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { FloatButton } from '../index'

describe('FloatButton', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders a button action with icon, description, type, shape, and click callback', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <FloatButton
        type="primary"
        shape="square"
        icon="?"
        description="Help"
        tooltip="Need help"
        onClick={onClick}
      />
    ))

    const button = result.getByRole('button', { name: '? Help' })
    expect(button).toHaveClass('ads-float-button')
    expect(button).toHaveClass('ads-float-button-primary')
    expect(button).toHaveClass('ads-float-button-square')
    expect(button).toHaveAttribute('title', 'Need help')

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a link button when href is provided', () => {
    const result = render(() => (
      <FloatButton href="https://example.com" target="_blank" icon="↗" description="Open" />
    ))

    const link = result.getByRole('link', { name: '↗ Open' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('supports v6 content, htmlType, disabled, badge, and semantic classNames/styles', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <FloatButton
        icon="!"
        content="Alert"
        htmlType="submit"
        disabled
        badge={{ count: 7 }}
        classNames={{ root: 'semantic-root', icon: 'semantic-icon', content: 'semantic-content' }}
        styles={{ content: { color: 'red' } }}
        onClick={onClick}
      />
    ))

    const button = result.getByRole('button', { name: '! Alert 7' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('semantic-root')
    expect(result.container.querySelector('.ads-float-button-icon')).toHaveClass('semantic-icon')
    expect(result.getByText('Alert')).toHaveClass('semantic-content')
    expect(result.getByText('Alert')).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(result.container.querySelector('.ads-float-button-badge')).toBeInTheDocument()
    expect(result.getByText('7')).toHaveClass('ads-badge-count')
    expect(result.getByText('7')).not.toHaveClass('ads-badge-count-sm')
    expect(result.container.querySelector('.ads-float-button-badge')).toHaveStyle({
      position: 'absolute',
    })

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('marks dot badge roots for float button shape offsets', () => {
    const result = render(() => <FloatButton badge={{ dot: true }} icon="!" />)

    const badge = result.container.querySelector('.ads-float-button-badge')
    expect(badge).toHaveClass('ads-float-button-badge-dot')
    expect(badge?.querySelector('.ads-badge-dot')).toBeInTheDocument()
  })

  it('wraps tooltip object props around the float button', () => {
    const result = render(() => (
      <FloatButton tooltip={{ title: 'More actions', open: true }} icon="?" content="More" />
    ))

    expect(document.body).toHaveTextContent('More actions')
    expect(result.getByRole('button', { name: '? More' })).toBeInTheDocument()
  })

  it('renders grouped buttons', () => {
    const result = render(() => (
      <FloatButton.Group shape="square">
        <FloatButton icon="A" description="One" />
        <FloatButton icon="B" description="Two" />
      </FloatButton.Group>
    ))

    expect(result.container.querySelector('.ads-float-button-group')).toBeInTheDocument()
    expect(result.getByRole('button', { name: 'A One' })).toHaveClass('ads-float-button-square')
    expect(result.getByRole('button', { name: 'B Two' })).toHaveClass('ads-float-button-square')
  })

  it('supports Group menu mode with click trigger, placement, closeIcon, and open changes', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <FloatButton.Group
        trigger="click"
        placement="left"
        icon="Menu"
        closeIcon="Close"
        content="Actions"
        onOpenChange={onOpenChange}
        classNames={{ list: 'semantic-list', trigger: 'semantic-trigger' }}
      >
        <FloatButton icon="A" content="One" />
        <FloatButton icon="B" content="Two" />
      </FloatButton.Group>
    ))

    const group = result.container.querySelector('.ads-float-button-group')
    expect(group).toHaveClass('ads-float-button-group-left')
    expect(group).toHaveClass('ads-float-button-group-menu-mode')
    expect(result.container.querySelector('.semantic-list')).toHaveStyle({ display: 'none' })
    expect(result.getByRole('button', { name: 'Menu Actions' })).toHaveClass('semantic-trigger')

    fireEvent.click(result.getByRole('button', { name: 'Menu Actions' }))

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(result.container.querySelector('.semantic-list')).not.toHaveStyle({ display: 'none' })
    expect(result.getByRole('button', { name: 'Close Actions' })).toBeInTheDocument()

    fireEvent.click(document.body)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('supports controlled Group open state', () => {
    const result = render(() => (
      <FloatButton.Group trigger="hover" open icon="Menu">
        <FloatButton icon="A" content="One" />
      </FloatButton.Group>
    ))

    expect(result.getByRole('button', { name: 'A One' })).toBeInTheDocument()
  })

  it('shows BackTop after visibilityHeight and scrolls target to top when clicked', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const onClick = vi.fn()
    const result = render(() => (
      <FloatButton.BackTop visibilityHeight={100} duration={0} onClick={onClick} />
    ))

    expect(result.container.querySelector('.ads-float-button-back-top')).toBeNull()

    vi.spyOn(window, 'pageYOffset', 'get').mockReturnValue(120)
    window.dispatchEvent(new Event('scroll'))

    const button = result.getByRole('button', { name: 'Back to top' })
    expect(button).toHaveClass('ads-float-button-back-top')
    expect(button.querySelector('.ads-float-button-icon svg')).toBeTruthy()

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(scrollTo).toHaveBeenCalled()
  })

  it('uses BackTop duration, icon, content, and semantic props when scrolling to top', () => {
    vi.useFakeTimers()
    vi.spyOn(window, 'pageYOffset', 'get').mockReturnValue(120)
    vi.spyOn(document.documentElement, 'scrollTop', 'get').mockReturnValue(120)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const result = render(() => (
      <FloatButton.BackTop
        visibilityHeight={100}
        duration={120}
        icon="Up"
        content="Top"
        classNames={{ root: 'semantic-root', content: 'semantic-content' }}
      />
    ))

    window.dispatchEvent(new Event('scroll'))
    const button = result.getByRole('button', { name: 'Up Top' })
    expect(button).toHaveClass('semantic-root')
    expect(result.getByText('Top')).toHaveClass('semantic-content')

    fireEvent.click(button)
    vi.runAllTimers()

    expect(scrollTo).toHaveBeenCalled()
    const lastCall = scrollTo.mock.calls.at(-1)
    expect(lastCall?.[0]).toBe(0)
    expect(lastCall?.[1]).toBe(0)
  })

  it('supports BackTop with a custom scroll target', () => {
    const target = document.createElement('div')
    target.scrollTop = 80
    target.scrollTo = vi.fn()
    const result = render(() => (
      <FloatButton.BackTop visibilityHeight={50} duration={0} target={() => target} />
    ))

    target.dispatchEvent(new Event('scroll'))
    fireEvent.click(result.getByRole('button', { name: 'Back to top' }))

    expect(target.scrollTop).toBe(0)
  })

  it('applies custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <FloatButton icon="C" />
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-float-button')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-float-button')).toBeNull()
  })
})
