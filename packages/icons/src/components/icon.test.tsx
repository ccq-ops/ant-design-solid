import AccountBookTwoTone from '@ant-design/icons-svg/es/asn/AccountBookTwoTone'
import SearchOutlinedSvg from '@ant-design/icons-svg/es/asn/SearchOutlined'
import { render } from '@solidjs/testing-library'
import { createSignal, type JSX } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Icon, createFromIconfontCN } from './icon'

describe('Icon', () => {
  function HeartSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 1024 1024" {...props}>
        <title>heart icon</title>
        <path d="M512 896 128 512h768z" />
      </svg>
    )
  }

  it('renders an icons-svg definition as a Solid svg element', () => {
    const result = render(() => <Icon icon={SearchOutlinedSvg} data-testid="icon" />)
    const svg = result.getByTestId('icon')

    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('viewBox', '64 64 896 896')
    expect(svg).toHaveAttribute('width', '1em')
    expect(svg).toHaveAttribute('height', '1em')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg.querySelector('path')).not.toBeNull()
  })

  it('forwards svg props to the root svg element', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Icon
        icon={SearchOutlinedSvg}
        aria-label="Search"
        class="custom-icon"
        data-testid="icon"
        fill="red"
        onClick={onClick}
        style={{ color: 'rgb(255, 0, 0)' }}
      />
    ))
    const svg = result.getByTestId('icon')

    svg.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(svg).toHaveAttribute('aria-label', 'Search')
    expect(svg).not.toHaveAttribute('aria-hidden')
    expect(svg).toHaveAttribute('class', 'custom-icon')
    expect(svg).toHaveAttribute('fill', 'red')
    expect(svg).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('marks decorative icons as hidden by default', () => {
    const result = render(() => <Icon icon={SearchOutlinedSvg} data-testid="icon" />)

    expect(result.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies spin and rotate styles', () => {
    const result = render(() => (
      <Icon icon={SearchOutlinedSvg} data-testid="icon" rotate={90} spin />
    ))
    const svg = result.getByTestId('icon')

    expect(svg.classList.contains('ant-design-solid-icon-spin')).toBe(true)
    expect(svg.getAttribute('style')).toContain('animation: ant-design-solid-icon-spin')
    expect(svg.getAttribute('style')).toContain('transform: rotate(90deg)')
  })

  it('injects spin keyframes once when spin is used', () => {
    document.head.querySelectorAll('style[data-ant-design-solid-icon]').forEach((style) => {
      style.remove()
    })

    const first = render(() => <Icon icon={SearchOutlinedSvg} data-testid="first-icon" spin />)
    const second = render(() => <Icon icon={SearchOutlinedSvg} data-testid="second-icon" spin />)

    expect(first.getByTestId('first-icon')).toHaveStyle({
      animation: 'ant-design-solid-icon-spin 1s infinite linear',
    })
    expect(second.getByTestId('second-icon')).toHaveStyle({
      animation: 'ant-design-solid-icon-spin 1s infinite linear',
    })

    const styles = document.head.querySelectorAll('style[data-ant-design-solid-icon]')

    expect(styles).toHaveLength(1)
    expect(styles[0]?.textContent).toContain('@keyframes ant-design-solid-icon-spin')
  })

  it('renders two-tone icons with tuple colors', () => {
    const result = render(() => (
      <Icon icon={AccountBookTwoTone} data-testid="icon" twoToneColor={['#111111', '#eeeeee']} />
    ))
    const svg = result.getByTestId('icon')

    expect(svg.innerHTML).toContain('#111111')
    expect(svg.innerHTML).toContain('#eeeeee')
  })

  it('reacts to two-tone color and accessibility prop updates', () => {
    const [twoToneColor, setTwoToneColor] = createSignal<[string, string]>(['#111111', '#eeeeee'])
    const [label, setLabel] = createSignal<string | undefined>()
    const result = render(() => (
      <Icon
        icon={AccountBookTwoTone}
        aria-label={label()}
        data-testid="icon"
        twoToneColor={twoToneColor()}
      />
    ))
    const svg = result.getByTestId('icon')

    expect(svg.innerHTML).toContain('#111111')
    expect(svg.innerHTML).toContain('#eeeeee')
    expect(svg).toHaveAttribute('aria-hidden', 'true')

    setTwoToneColor(['#222222', '#dddddd'])
    setLabel('Account book')

    expect(svg.innerHTML).toContain('#222222')
    expect(svg.innerHTML).toContain('#dddddd')
    expect(svg.innerHTML).not.toContain('#111111')
    expect(svg.innerHTML).not.toContain('#eeeeee')
    expect(svg).toHaveAttribute('aria-label', 'Account book')
    expect(svg).not.toHaveAttribute('aria-hidden')
  })

  it('renders two-tone icons with default colors', () => {
    const result = render(() => <Icon icon={AccountBookTwoTone} data-testid="icon" />)
    const svg = result.getByTestId('icon')

    expect(svg.innerHTML).toContain('#1677ff')
    expect(svg.innerHTML).toContain('#e6f4ff')
  })

  it('renders a custom svg component through the public component prop', () => {
    const result = render(() => (
      <Icon
        component={HeartSvg}
        aria-label="Heart"
        data-testid="icon"
        style={{ color: 'hotpink' }}
      />
    ))
    const svg = result.getByTestId('icon')

    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 1024 1024')
    expect(svg).toHaveAttribute('aria-label', 'Heart')
    expect(svg).toHaveStyle({ color: 'rgb(255, 105, 180)' })
    expect(svg.querySelector('title')?.textContent).toBe('heart icon')
    expect(svg.querySelector('path')).not.toBeNull()
  })

  it('creates iconfont components with a single script url', () => {
    const IconFont = createFromIconfontCN({
      scriptUrl: '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js',
    })
    const result = render(() => <IconFont type="icon-tuichu" data-testid="icon" />)
    const svg = result.getByTestId('icon')

    expect(
      document.querySelectorAll('script[src="//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js"]'),
    ).toHaveLength(1)
    expect(svg.querySelector('use')).toHaveAttribute('href', '#icon-tuichu')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('creates iconfont components from multiple script urls once', () => {
    const IconFont = createFromIconfontCN({
      scriptUrl: [
        '//at.alicdn.com/t/font_1788044_0dwu4guekcwr.js',
        '//at.alicdn.com/t/font_1788592_a5xf2bdic3u.js',
      ],
    })

    render(() => <IconFont type="icon-java" data-testid="first-icon" />)
    render(() => <IconFont type="icon-python" data-testid="second-icon" />)

    expect(
      document.querySelectorAll('script[src="//at.alicdn.com/t/font_1788044_0dwu4guekcwr.js"]'),
    ).toHaveLength(1)
    expect(
      document.querySelectorAll('script[src="//at.alicdn.com/t/font_1788592_a5xf2bdic3u.js"]'),
    ).toHaveLength(1)
  })
})
