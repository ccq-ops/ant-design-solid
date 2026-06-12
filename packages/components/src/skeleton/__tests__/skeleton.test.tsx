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

  it('applies a single paragraph width only to the last row', () => {
    const { container } = render(() => <Skeleton paragraph={{ rows: 3, width: '60%' }} />)
    const rows = container.querySelectorAll('.ads-skeleton-paragraph li')

    expect(rows[0]).not.toHaveStyle('width: 60%')
    expect(rows[1]).not.toHaveStyle('width: 60%')
    expect(rows[2]).toHaveStyle('width: 60%')
  })

  it('derives antd-compatible defaults from avatar title and paragraph combinations', () => {
    const { container } = render(() => <Skeleton avatar title paragraph />)

    expect(container.querySelector('.ads-skeleton')).toHaveClass('ads-skeleton-with-avatar')
    expect(container.querySelector('.ads-skeleton-avatar')).toHaveClass('ads-skeleton-avatar-lg')
    expect(container.querySelector('.ads-skeleton-avatar')).toHaveClass(
      'ads-skeleton-avatar-circle',
    )
    expect(container.querySelector('.ads-skeleton-title')).toHaveStyle('width: 50%')
    expect(container.querySelectorAll('.ads-skeleton-paragraph li')).toHaveLength(2)
  })

  it('uses square large avatar when avatar is paired with title only', () => {
    const { container } = render(() => <Skeleton avatar title paragraph={false} />)

    expect(container.querySelector('.ads-skeleton-avatar')).toHaveClass('ads-skeleton-avatar-lg')
    expect(container.querySelector('.ads-skeleton-avatar')).toHaveClass(
      'ads-skeleton-avatar-square',
    )
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

  it('supports component prefix override and rootClassName', () => {
    const { container } = render(() => (
      <Skeleton prefixCls="custom-skeleton" rootClassName="root" />
    ))

    expect(container.querySelector('.custom-skeleton')).toBeInTheDocument()
    expect(container.querySelector('.custom-skeleton')).toHaveClass('root')
    expect(container.querySelector('.ads-skeleton')).toBeNull()
  })

  it('applies semantic classNames and styles', () => {
    const { container } = render(() => (
      <Skeleton
        avatar
        classNames={{
          root: 'custom-root',
          header: 'custom-header',
          section: 'custom-section',
          avatar: 'custom-avatar',
          title: 'custom-title',
          paragraph: 'custom-paragraph',
        }}
        styles={{
          root: { margin: '4px' },
          header: { padding: '2px' },
          section: { gap: '3px' },
          avatar: { background: 'red' },
          title: { width: '44%' },
          paragraph: { padding: '1px' },
        }}
      />
    ))

    expect(container.querySelector('.ads-skeleton')).toHaveClass('custom-root')
    expect(container.querySelector('.ads-skeleton-header')).toHaveClass('custom-header')
    expect(container.querySelector('.ads-skeleton-section')).toHaveClass('custom-section')
    expect(container.querySelector('.ads-skeleton-avatar')).toHaveClass('custom-avatar')
    expect(container.querySelector('.ads-skeleton-title')).toHaveClass('custom-title')
    expect(container.querySelector('.ads-skeleton-paragraph')).toHaveClass('custom-paragraph')
    expect(container.querySelector('.ads-skeleton')).toHaveStyle('margin: 4px')
    expect(container.querySelector('.ads-skeleton-header')).toHaveStyle('padding: 2px')
    expect(container.querySelector('.ads-skeleton-section')).toHaveStyle('gap: 3px')
    expect(container.querySelector('.ads-skeleton-avatar')).toHaveStyle('background: red')
    expect(container.querySelector('.ads-skeleton-title')).toHaveStyle('width: 44%')
    expect(container.querySelector('.ads-skeleton-paragraph')).toHaveStyle('padding: 1px')
  })

  it('resolves semantic classNames and styles from functions', () => {
    const { container } = render(() => (
      <Skeleton
        active
        classNames={({ props }) => ({ root: props.active ? 'active-root' : 'idle-root' })}
        styles={({ props }) => ({ title: { width: props.active ? '70%' : '20%' } })}
      />
    ))

    expect(container.querySelector('.ads-skeleton')).toHaveClass('active-root')
    expect(container.querySelector('.ads-skeleton-title')).toHaveStyle('width: 70%')
  })

  it('renders independent Skeleton.Button', () => {
    const { container } = render(() => (
      <Skeleton.Button
        active
        block
        size="large"
        shape="round"
        class="extra"
        rootClassName="root-extra"
        classNames={{ root: 'button-root', content: 'button-content' }}
        styles={{ root: { margin: '8px' }, content: { width: '120px' } }}
      />
    ))

    expect(container.querySelector('.ads-skeleton')).toHaveClass('ads-skeleton-element')
    expect(container.querySelector('.ads-skeleton')).toHaveClass('ads-skeleton-active')
    expect(container.querySelector('.ads-skeleton')).toHaveClass('ads-skeleton-block')
    expect(container.querySelector('.ads-skeleton')).toHaveClass('extra')
    expect(container.querySelector('.ads-skeleton')).toHaveClass('root-extra')
    expect(container.querySelector('.ads-skeleton')).toHaveClass('button-root')
    expect(container.querySelector('.ads-skeleton')).toHaveStyle('margin: 8px')
    expect(container.querySelector('.ads-skeleton-button')).toHaveClass('ads-skeleton-button-lg')
    expect(container.querySelector('.ads-skeleton-button')).toHaveClass('ads-skeleton-button-round')
    expect(container.querySelector('.ads-skeleton-button')).toHaveClass('button-content')
    expect(container.querySelector('.ads-skeleton-button')).toHaveStyle('width: 120px')
  })

  it('renders independent Skeleton.Avatar with medium size', () => {
    const { container } = render(() => <Skeleton.Avatar active size="medium" shape="square" />)

    expect(container.querySelector('.ads-skeleton')).toHaveClass('ads-skeleton-element')
    expect(container.querySelector('.ads-skeleton')).toHaveClass('ads-skeleton-active')
    expect(container.querySelector('.ads-skeleton-avatar')).toHaveClass(
      'ads-skeleton-avatar-square',
    )
    expect(container.querySelector('.ads-skeleton-avatar')).not.toHaveClass(
      'ads-skeleton-avatar-sm',
    )
    expect(container.querySelector('.ads-skeleton-avatar')).not.toHaveClass(
      'ads-skeleton-avatar-lg',
    )
  })

  it('renders independent Skeleton.Input as a block element', () => {
    const { container } = render(() => <Skeleton.Input block size="small" />)

    expect(container.querySelector('.ads-skeleton')).toHaveClass('ads-skeleton-block')
    expect(container.querySelector('.ads-skeleton-input')).toHaveClass('ads-skeleton-input-sm')
  })

  it('renders independent Skeleton.Image and Skeleton.Node', () => {
    const { container } = render(() => (
      <>
        <Skeleton.Image active />
        <Skeleton.Node>
          <span data-testid="node-child" />
        </Skeleton.Node>
      </>
    ))

    expect(container.querySelector('.ads-skeleton-image')).toBeInTheDocument()
    expect(container.querySelector('.ads-skeleton-image-svg')).toBeInTheDocument()
    expect(container.querySelector('.ads-skeleton-node')).toBeInTheDocument()
    expect(screen.getByTestId('node-child')).toBeInTheDocument()
  })
})
