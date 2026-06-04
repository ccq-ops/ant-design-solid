import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { AccountBookTwoTone, CloseCircleFilled, LoadingOutlined, SearchOutlined } from '../index'

describe('generated icon exports', () => {
  it('exports outlined icons as Solid components', () => {
    const result = render(() => <SearchOutlined data-testid="icon" />)
    const svg = result.getByTestId('icon')

    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('viewBox', '64 64 896 896')
    expect(svg.querySelector('path')).not.toBeNull()
  })

  it('exports filled icons as Solid components', () => {
    const result = render(() => <CloseCircleFilled data-testid="icon" />)

    expect(result.getByTestId('icon').querySelector('path')).not.toBeNull()
  })

  it('exports loading icon with spin support', () => {
    const result = render(() => <LoadingOutlined data-testid="icon" spin />)

    expect(result.getByTestId('icon').classList.contains('ant-design-solid-icon-spin')).toBe(true)
  })

  it('exports two-tone icons as Solid components', () => {
    const result = render(() => (
      <AccountBookTwoTone data-testid="icon" twoToneColor={['#123456', '#abcdef']} />
    ))

    expect(result.getByTestId('icon').innerHTML).toContain('#123456')
    expect(result.getByTestId('icon').innerHTML).toContain('#abcdef')
  })
})
