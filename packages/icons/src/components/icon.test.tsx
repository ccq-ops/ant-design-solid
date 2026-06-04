import AccountBookTwoTone from '@ant-design/icons-svg/es/asn/AccountBookTwoTone'
import SearchOutlinedSvg from '@ant-design/icons-svg/es/asn/SearchOutlined'
import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Icon } from './icon'

describe('Icon', () => {
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
    const result = render(() => <Icon icon={SearchOutlinedSvg} data-testid="icon" rotate={90} spin />)
    const svg = result.getByTestId('icon')

    expect(svg.classList.contains('ant-design-solid-icon-spin')).toBe(true)
    expect(svg.getAttribute('style')).toContain('animation: ant-design-solid-icon-spin')
    expect(svg.getAttribute('style')).toContain('transform: rotate(90deg)')
  })

  it('renders two-tone icons with tuple colors', () => {
    const result = render(() => (
      <Icon icon={AccountBookTwoTone} data-testid="icon" twoToneColor={['#111111', '#eeeeee']} />
    ))
    const svg = result.getByTestId('icon')

    expect(svg.innerHTML).toContain('#111111')
    expect(svg.innerHTML).toContain('#eeeeee')
  })

  it('renders two-tone icons with default colors', () => {
    const result = render(() => <Icon icon={AccountBookTwoTone} data-testid="icon" />)
    const svg = result.getByTestId('icon')

    expect(svg.innerHTML).toContain('#1677ff')
    expect(svg.innerHTML).toContain('#e6f4ff')
  })
})
