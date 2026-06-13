import { createSignal } from 'solid-js'
import { fireEvent, render } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Avatar } from '../index'

describe('Avatar', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('renders text fallback children', () => {
    const result = render(() => <Avatar>JD</Avatar>)

    expect(result.getByText('JD')).toHaveClass('ads-avatar-string')
  })

  it('prioritizes src over icon and children while image is available', () => {
    const result = render(() => (
      <Avatar src="https://example.com/avatar.png" alt="Jane Doe" icon={<span>icon</span>}>
        JD
      </Avatar>
    ))

    expect(result.getByAltText('Jane Doe')).toHaveAttribute('src', 'https://example.com/avatar.png')
    expect(result.queryByText('icon')).toBeNull()
    expect(result.queryByText('JD')).toBeNull()
  })

  it('falls back to icon before children when image loading fails', () => {
    const result = render(() => (
      <Avatar src="https://example.invalid/avatar.png" alt="Jane Doe" icon={<span>icon</span>}>
        JD
      </Avatar>
    ))

    fireEvent.error(result.getByAltText('Jane Doe'))

    expect(result.queryByAltText('Jane Doe')).toBeNull()
    expect(result.getByText('icon').parentElement).toHaveClass('ads-avatar-icon')
    expect(result.queryByText('JD')).toBeNull()
  })

  it('applies numeric size as inline dimensions', () => {
    const result = render(() => <Avatar size={48}>N</Avatar>)
    const avatar = result.container.firstElementChild as HTMLElement

    expect(avatar).toHaveStyle({ width: '48px', height: '48px', 'font-size': '18px' })
  })

  it('uses medium as the default size and supports default as a compatibility alias', () => {
    const result = render(() => (
      <>
        <Avatar>M</Avatar>
        <Avatar size="medium">M</Avatar>
        <Avatar size="default">D</Avatar>
      </>
    ))
    const avatars = result.container.querySelectorAll('.ads-avatar')

    avatars.forEach((avatar) => {
      expect(avatar.className).not.toContain('ads-avatar-sm')
      expect(avatar.className).not.toContain('ads-avatar-lg')
    })
  })

  it('resolves responsive size objects from active breakpoints', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('768px'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    )

    const result = render(() => <Avatar size={{ xs: 24, md: 48 }}>R</Avatar>)
    const avatar = result.container.firstElementChild as HTMLElement

    expect(avatar).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('uses default circle shape and default size without size classes', () => {
    const result = render(() => <Avatar>DF</Avatar>)
    const avatar = result.container.firstElementChild as HTMLElement

    expect(avatar).toHaveClass('ads-avatar')
    expect(avatar).toHaveClass('ads-avatar-circle')
    expect(avatar.className).not.toContain('ads-avatar-sm')
    expect(avatar.className).not.toContain('ads-avatar-lg')
  })

  it('applies small, large, and square classes', () => {
    const result = render(() => (
      <>
        <Avatar size="small" shape="square">
          S
        </Avatar>
        <Avatar size="large">L</Avatar>
      </>
    ))
    const avatars = result.container.querySelectorAll('.ads-avatar')

    expect(avatars[0]).toHaveClass('ads-avatar-sm')
    expect(avatars[0]).toHaveClass('ads-avatar-square')
    expect(avatars[1]).toHaveClass('ads-avatar-lg')
    expect(avatars[1]).toHaveClass('ads-avatar-circle')
  })

  it('passes image attributes to the rendered img element', () => {
    const result = render(() => (
      <Avatar
        src="https://example.com/avatar.png"
        srcSet="avatar@2x.png 2x"
        alt="Jane Doe"
        draggable={false}
        crossOrigin="anonymous"
      />
    ))
    const image = result.getByAltText('Jane Doe')

    expect(image).toHaveAttribute('srcset', 'avatar@2x.png 2x')
    expect(image).toHaveAttribute('draggable', 'false')
    expect(image).toHaveAttribute('crossorigin', 'anonymous')
  })

  it('keeps a failed image when onError returns false', () => {
    const onError = vi.fn(() => false)
    const result = render(() => (
      <Avatar src="https://example.invalid/avatar.png" alt="Jane Doe" onError={onError}>
        JD
      </Avatar>
    ))

    fireEvent.error(result.getByAltText('Jane Doe'))

    expect(onError).toHaveBeenCalled()
    expect(result.getByAltText('Jane Doe')).toBeInTheDocument()
    expect(result.queryByText('JD')).toBeNull()
  })

  it('renders element src directly', () => {
    const result = render(() => (
      <Avatar src={<img src="custom-avatar.png" alt="Custom avatar" data-testid="custom-src" />} />
    ))

    expect(result.getByTestId('custom-src')).toHaveAttribute('src', 'custom-avatar.png')
  })

  it('scales text children using the configured gap', () => {
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetWidth',
    )
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() {
        return (this as HTMLElement).classList.contains('ads-avatar-string') ? 80 : 40
      },
    })

    const result = render(() => <Avatar gap={4}>Long Name</Avatar>)
    const text = result.getByText('Long Name')

    expect(text).toHaveStyle({ transform: 'scale(0.4)' })

    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
    }
  })

  it('inherits group size and shape for visible child avatars and overflow avatar', () => {
    const result = render(() => (
      <Avatar.Group maxCount={1} size="large" shape="square">
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
      </Avatar.Group>
    ))
    const avatars = result.container.querySelectorAll('.ads-avatar')

    expect(avatars).toHaveLength(2)
    expect(avatars[0]).toHaveClass('ads-avatar-lg')
    expect(avatars[0]).toHaveClass('ads-avatar-square')
    expect(avatars[1]).toHaveClass('ads-avatar-lg')
    expect(avatars[1]).toHaveClass('ads-avatar-square')
    expect(result.getByText('+1')).toBeInTheDocument()
  })

  it('applies numeric group size as inline dimensions to visible child avatars', () => {
    const result = render(() => (
      <Avatar.Group size={48}>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
      </Avatar.Group>
    ))
    const avatars = result.container.querySelectorAll('.ads-avatar')

    expect(avatars[0]).toHaveStyle({ width: '48px', height: '48px' })
    expect(avatars[1]).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('applies maxStyle to overflow avatar', () => {
    const result = render(() => (
      <Avatar.Group maxCount={1} maxStyle={{ color: 'red', background: 'blue' }}>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
      </Avatar.Group>
    ))
    const overflow = result.getByText('+1').parentElement as HTMLElement

    expect(overflow).toHaveClass('ads-avatar-overflow')
    expect(overflow).toHaveStyle({ color: 'rgb(255, 0, 0)', background: 'blue' })
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Avatar.Group maxCount={1}>
          <Avatar>A</Avatar>
          <Avatar>B</Avatar>
        </Avatar.Group>
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-avatar-group')).toBeInTheDocument()
    expect(result.getByText('A').parentElement).toHaveClass('custom-avatar')
    expect(result.getByText('+1')).toHaveClass('custom-avatar-string')
  })

  it('retries image rendering when src changes after a load failure', () => {
    const [src, setSrc] = createSignal('https://example.invalid/first.png')
    const result = render(() => (
      <Avatar src={src()} alt="Jane Doe">
        JD
      </Avatar>
    ))

    fireEvent.error(result.getByAltText('Jane Doe'))

    expect(result.queryByAltText('Jane Doe')).toBeNull()
    expect(result.getByText('JD')).toBeInTheDocument()

    setSrc('https://example.com/second.png')

    expect(result.getByAltText('Jane Doe')).toHaveAttribute('src', 'https://example.com/second.png')
    expect(result.queryByText('JD')).toBeNull()
  })

  it('falls back to children when image loading fails', () => {
    const result = render(() => (
      <Avatar src="https://example.invalid/avatar.png" alt="Jane Doe">
        JD
      </Avatar>
    ))
    const image = result.getByAltText('Jane Doe')

    fireEvent.error(image)

    expect(result.queryByAltText('Jane Doe')).toBeNull()
    expect(result.getByText('JD')).toHaveClass('ads-avatar-string')
  })

  it('hides overflow children and shows max count in groups', () => {
    const result = render(() => (
      <Avatar.Group maxCount={2}>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
        <Avatar>D</Avatar>
      </Avatar.Group>
    ))

    expect(result.getByText('A')).toBeInTheDocument()
    expect(result.getByText('B')).toBeInTheDocument()
    expect(result.queryByText('C')).toBeNull()
    expect(result.queryByText('D')).toBeNull()
    expect(result.getByText('+2')).toHaveClass('ads-avatar-string')
  })

  it('supports group max object and shows hidden avatars in a popover', () => {
    const result = render(() => (
      <Avatar.Group
        max={{
          count: 2,
          style: { color: 'red' },
          popover: { trigger: 'click', placement: 'bottom' },
        }}
      >
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
        <Avatar>D</Avatar>
      </Avatar.Group>
    ))
    const overflow = result.getByText('+2')

    expect(result.queryByText('C')).toBeNull()
    expect(overflow.parentElement).toHaveStyle({ color: 'rgb(255, 0, 0)' })

    fireEvent.click(result.container.querySelector('.ads-popover-trigger')!)

    expect(document.body.querySelector('.ads-avatar-group-popover')).toHaveTextContent('C')
    expect(document.body.querySelector('.ads-avatar-group-popover')).toHaveTextContent('D')
  })

  it('keeps deprecated group max popover props as compatibility aliases', () => {
    const result = render(() => (
      <Avatar.Group maxCount={1} maxPopoverTrigger="click" maxPopoverPlacement="bottom">
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
      </Avatar.Group>
    ))

    fireEvent.click(result.container.querySelector('.ads-popover-trigger')!)

    expect(document.body.querySelector('.ads-avatar-group-popover')).toHaveTextContent('B')
  })
})
