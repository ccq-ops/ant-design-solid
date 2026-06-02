import { cleanup, render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Skeleton } from '../skeleton'

afterEach(() => cleanup())

describe('Skeleton', () => {
  it('renders children when loading is false', () => {
    render(() => (
      <Skeleton loading={false}>
        <div>Loaded</div>
      </Skeleton>
    ))

    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })

  it('renders default title and paragraph when loading', () => {
    const { container } = render(() => <Skeleton />)

    expect(container.querySelector('.ads-skeleton-title')).toBeInTheDocument()
    expect(container.querySelectorAll('.ads-skeleton-paragraph li')).toHaveLength(3)
  })

  it('supports avatar, title width, and paragraph rows', () => {
    const { container } = render(() => (
      <Skeleton
        avatar={{ size: 40, shape: 'square' }}
        title={{ width: '50%' }}
        paragraph={{ rows: 2 }}
      />
    ))

    expect(container.querySelector('.ads-skeleton-avatar')).toHaveStyle('width: 40px')
    expect(container.querySelector('.ads-skeleton-avatar')).toHaveClass(
      'ads-skeleton-avatar-square',
    )
    expect(container.querySelector('.ads-skeleton-title')).toHaveStyle('width: 50%')
    expect(container.querySelectorAll('.ads-skeleton-paragraph li')).toHaveLength(2)
  })

  it('supports paragraph width arrays', () => {
    const { container } = render(() => <Skeleton paragraph={{ rows: 2, width: ['80%', 120] }} />)
    const rows = container.querySelectorAll('.ads-skeleton-paragraph li')

    expect(rows[0]).toHaveStyle('width: 80%')
    expect(rows[1]).toHaveStyle('width: 120px')
  })

  it('supports active and round classes', () => {
    const { container } = render(() => <Skeleton active round />)
    const root = container.querySelector('.ads-skeleton')

    expect(root?.className).toContain('ads-skeleton-active')
    expect(root?.className).toContain('ads-skeleton-round')
  })

  it('uses custom prefix classes', () => {
    const { container } = render(() => (
      <ConfigProvider prefixCls="custom">
        <Skeleton active />
      </ConfigProvider>
    ))

    expect(container.querySelector('.custom-skeleton')).toBeInTheDocument()
    expect(container.querySelector('.custom-skeleton-active')).toBeInTheDocument()
    expect(container.querySelector('.ads-skeleton')).toBeNull()
  })
})
