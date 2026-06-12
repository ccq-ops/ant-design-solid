import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Steps } from '../steps'

describe('Steps', () => {
  it('derives item status from current and global status', () => {
    const result = render(() => (
      <Steps
        current={1}
        items={[{ title: 'Create account' }, { title: 'Verify email' }, { title: 'Done' }]}
      />
    ))

    const items = result.getAllByRole('listitem')

    expect(items[0]).toHaveClass('ads-steps-item-finish')
    expect(items[1]).toHaveClass('ads-steps-item-process')
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[2]).toHaveClass('ads-steps-item-wait')
  })

  it('uses the global current status and item status overrides', () => {
    const result = render(() => (
      <Steps
        current={1}
        status="error"
        items={[
          { title: 'Finished' },
          { title: 'Current but overridden', status: 'finish' },
          { title: 'Waiting but error', status: 'error' },
        ]}
      />
    ))

    const items = result.getAllByRole('listitem')

    expect(items[0]).toHaveClass('ads-steps-item-finish')
    expect(items[1]).toHaveClass('ads-steps-item-finish')
    expect(items[1]).not.toHaveClass('ads-steps-item-error')
    expect(items[2]).toHaveClass('ads-steps-item-error')
  })

  it('renders navigation buttons for enabled steps and calls onChange', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Steps
        type="navigation"
        current={0}
        onChange={onChange}
        items={[{ title: 'Start' }, { title: 'Details' }, { title: 'Confirm' }]}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Go to step 2: Details' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('does not render disabled navigation items as clickable', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Steps
        type="navigation"
        onChange={onChange}
        items={[{ title: 'Start' }, { title: 'Locked', disabled: true }, { title: 'Confirm' }]}
      />
    ))

    expect(result.queryByRole('button', { name: 'Go to step 2: Locked' })).not.toBeInTheDocument()
    expect(result.getByText('Locked').closest('li')).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(result.getByText('Locked'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders descriptions, custom icons, direction, and small size classes', () => {
    const result = render(() => (
      <Steps
        direction="vertical"
        size="small"
        items={[
          {
            title: 'One',
            description: 'First step',
            icon: <span data-testid="custom-icon">★</span>,
          },
          { title: 'Two', description: 'Second step' },
        ]}
      />
    ))

    expect(result.container.firstElementChild).toHaveClass('ads-steps-vertical')
    expect(result.container.firstElementChild).toHaveClass('ads-steps-small')
    expect(result.getByText('First step')).toBeInTheDocument()
    expect(result.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders dot steps with semantic classNames and styles', () => {
    const result = render(() => (
      <Steps
        type="dot"
        orientation="vertical"
        variant="filled"
        classNames={{
          root: 'custom-root',
          list: 'custom-list',
          item: 'custom-item',
          itemIcon: 'custom-icon',
          itemTitle: 'custom-title',
          itemContent: 'custom-content',
          itemRail: 'custom-rail',
          itemWrapper: 'custom-wrapper',
          itemSection: 'custom-section',
          itemHeader: 'custom-header',
        }}
        styles={{
          root: { width: '320px' },
          itemIcon: { color: 'rgb(255, 0, 0)' },
          itemTitle: { color: 'rgb(0, 0, 255)' },
        }}
        items={[
          {
            title: 'Queued',
            description: 'Waiting',
            className: 'first-step',
            style: { margin: '1px' },
            classNames: { itemContent: 'first-content' },
            styles: { itemContent: { color: 'rgb(0, 128, 0)' } },
          },
        ]}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement
    const item = result.getByRole('listitem')
    const icon = result.container.querySelector('.ads-steps-item-icon') as HTMLElement
    const title = result.getByText('Queued')
    const content = result.container.querySelector('.ads-steps-item-content') as HTMLElement

    expect(root).toHaveClass('ads-steps-dot')
    expect(root).toHaveClass('ads-steps-vertical')
    expect(root).toHaveClass('ads-steps-variant-filled')
    expect(root).toHaveClass('custom-root')
    expect(root).toHaveStyle({ width: '320px' })
    expect(result.container.querySelector('.ads-steps-list')).toHaveClass('custom-list')
    expect(item).toHaveClass('custom-item')
    expect(item).toHaveClass('first-step')
    expect(item).toHaveStyle({ margin: '1px' })
    expect(icon).toHaveClass('custom-icon')
    expect(icon).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(title).toHaveClass('custom-title')
    expect(title).toHaveStyle({ color: 'rgb(0, 0, 255)' })
    expect(content).toHaveClass('custom-content')
    expect(content).toHaveClass('first-content')
    expect(content).toHaveStyle({ color: 'rgb(0, 128, 0)' })
    expect(result.container.querySelector('.ads-steps-item-rail')).toHaveClass('custom-rail')
    expect(result.container.querySelector('.ads-steps-item-wrapper')).toHaveClass('custom-wrapper')
    expect(result.container.querySelector('.ads-steps-item-section')).toHaveClass('custom-section')
    expect(result.container.querySelector('.ads-steps-item-header')).toHaveClass('custom-header')
  })

  it('can render ordered-list semantics for internal consumers', () => {
    const result = render(() => (
      <Steps rootComponent="ol" itemComponent="li" items={[{ title: 'One' }, { title: 'Two' }]} />
    ))

    expect(result.container.firstElementChild?.tagName).toBe('OL')
    expect(
      Array.from(result.container.firstElementChild?.children ?? []).map((node) => node.tagName),
    ).toEqual(['LI', 'LI'])
    expect(result.getAllByRole('listitem')).toHaveLength(2)
  })
})
