import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { FloatButton } from '../index'

describe('FloatButton', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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

  it('shows BackTop after visibilityHeight and scrolls target to top when clicked', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const onClick = vi.fn()
    const result = render(() => <FloatButton.BackTop visibilityHeight={100} onClick={onClick} />)

    expect(result.container.querySelector('.ads-float-button-back-top')).toBeNull()

    vi.spyOn(window, 'pageYOffset', 'get').mockReturnValue(120)
    window.dispatchEvent(new Event('scroll'))

    const button = result.getByRole('button', { name: 'Back to top' })
    expect(button).toHaveClass('ads-float-button-back-top')

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('supports BackTop with a custom scroll target', () => {
    const target = document.createElement('div')
    target.scrollTop = 80
    target.scrollTo = vi.fn()
    const result = render(() => <FloatButton.BackTop visibilityHeight={50} target={() => target} />)

    target.dispatchEvent(new Event('scroll'))
    fireEvent.click(result.getByRole('button', { name: 'Back to top' }))

    expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
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
