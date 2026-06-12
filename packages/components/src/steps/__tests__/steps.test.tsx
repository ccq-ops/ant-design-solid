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
    expect(root).not.toHaveClass('ads-steps-filled')
    expect(root).not.toHaveClass('ads-steps-variant-filled')
    expect(icon).toHaveClass('ads-steps-item-icon-filled')
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

  it('applies outlined variant to item icons instead of the root', () => {
    const result = render(() => (
      <Steps variant="outlined" items={[{ title: 'One' }, { title: 'Two' }]} />
    ))
    const root = result.container.firstElementChild
    const icons = result.container.querySelectorAll('.ads-steps-item-icon')

    expect(root).not.toHaveClass('ads-steps-outlined')
    expect(root).not.toHaveClass('ads-steps-variant-outlined')
    expect(icons[0]).toHaveClass('ads-steps-item-icon-outlined')
    expect(icons[1]).toHaveClass('ads-steps-item-icon-outlined')
  })

  it('keeps the current process icon filled with the brand color', () => {
    const result = render(() => (
      <Steps current={1} items={[{ title: 'Done' }, { title: 'In progress' }]} />
    ))
    const currentIcon = result.container.querySelectorAll<HTMLElement>('.ads-steps-item-icon')[1]

    expect(currentIcon).toHaveClass('ads-steps-item-icon-filled')
    expect(currentIcon).toHaveStyle({
      background: '#1677ff',
      'border-color': 'rgba(0, 0, 0, 0)',
      color: '#ffffff',
    })
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

  it('renders v6 content, subtitle, title placement, and medium size semantics', () => {
    const result = render(() => (
      <Steps
        size="medium"
        titlePlacement="vertical"
        items={[{ title: 'Profile', subTitle: 'Optional', content: 'Tell us about yourself' }]}
      />
    ))

    const root = result.container.firstElementChild

    expect(root).toHaveClass('ads-steps-title-placement-vertical')
    expect(root).not.toHaveClass('ads-steps-small')
    expect(result.getByText('Optional')).toHaveClass('ads-steps-item-subtitle')
    expect(result.getByText('Tell us about yourself')).toHaveClass('ads-steps-item-content')
  })

  it('uses content before deprecated description', () => {
    const result = render(() => (
      <Steps
        items={[{ title: 'Details', content: 'New content', description: 'Old description' }]}
      />
    ))

    expect(result.getByText('New content')).toBeInTheDocument()
    expect(result.queryByText('Old description')).not.toBeInTheDocument()
  })

  it('stacks item content below the title area by default', () => {
    const result = render(() => (
      <Steps items={[{ title: 'Details', content: 'Content appears below the title' }]} />
    ))

    expect(result.container.querySelector('.ads-steps-item-section')).toHaveStyle({
      'flex-direction': 'column',
    })
  })

  it('keeps the item header above the connector rail', () => {
    const result = render(() => (
      <Steps items={[{ title: 'Details', content: 'Content appears below the title' }]} />
    ))

    expect(result.container.querySelector('.ads-steps-item-header')).toHaveStyle({
      position: 'relative',
      'z-index': '1',
    })
  })

  it('renders horizontal connector after the item container so spacing follows header width', () => {
    const result = render(() => (
      <Steps items={[{ title: 'One', content: 'First content' }, { title: 'Two' }]} />
    ))
    const firstItemChildren = Array.from(result.getAllByRole('listitem')[0].children)

    expect(firstItemChildren.map((node) => (node as HTMLElement).className)).toEqual([
      'ads-steps-item-container',
      'ads-steps-item-rail ads-steps-item-tail',
      'ads-steps-item-content',
    ])
  })

  it('makes default steps clickable when onChange is provided', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Steps current={0} onChange={onChange} items={[{ title: 'Start' }, { title: 'Details' }]} />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Go to step 2: Details' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('uses initial offset for default step numbers', () => {
    const result = render(() => (
      <Steps initial={2} items={[{ title: 'Three' }, { title: 'Four' }]} />
    ))

    expect(result.getByText('3')).toBeInTheDocument()
    expect(result.getByText('4')).toBeInTheDocument()
  })

  it('renders percent progress on the current basic step', () => {
    const result = render(() => (
      <Steps current={1} percent={40} items={[{ title: 'Done' }, { title: 'Upload' }]} />
    ))

    const currentIcon = result.container.querySelector('.ads-steps-progress-icon')

    expect(result.container.firstElementChild).toHaveClass('ads-steps-with-progress')
    expect(currentIcon).toHaveAttribute('aria-label', '40%')
  })

  it('supports Solid-style iconRender for generated icons', () => {
    const result = render(() => (
      <Steps
        iconRender={(origin, info) => (
          <span data-testid={`icon-${info.index}`} data-active={String(info.active)}>
            {origin}
          </span>
        )}
        items={[{ title: 'One' }, { title: 'Two' }]}
      />
    ))

    expect(result.getByTestId('icon-0')).toHaveAttribute('data-active', 'true')
    expect(result.getByTestId('icon-1')).toHaveAttribute('data-active', 'false')
  })

  it('maps progressDot to dot type and supports custom dot rendering', () => {
    const result = render(() => (
      <Steps
        progressDot={(dot, info) => (
          <span data-testid={`dot-${info.index}`} data-status={info.status}>
            {dot}
          </span>
        )}
        items={[{ title: 'One' }, { title: 'Two', content: 'Second' }]}
      />
    ))

    expect(result.container.firstElementChild).toHaveClass('ads-steps-dot')
    expect(result.getByTestId('dot-0')).toHaveAttribute('data-status', 'process')
    expect(result.getByTestId('dot-1')).toHaveAttribute('data-status', 'wait')
  })

  it('applies inline and panel type classes with inline offset', () => {
    const inline = render(() => (
      <Steps type="inline" offset={2} items={[{ title: 'One', content: 'Inline detail' }]} />
    ))
    const panel = render(() => <Steps type="panel" items={[{ title: 'Panel' }]} />)

    expect(inline.container.firstElementChild).toHaveClass('ads-steps-inline')
    expect(inline.container.firstElementChild).toHaveStyle({ '--ads-steps-items-offset': '2' })
    expect(inline.getByText('Inline detail')).toBeInTheDocument()
    expect(panel.container.firstElementChild).toHaveClass('ads-steps-panel')
    expect(panel.container.querySelector('.ads-steps-panel-arrow')).toBeInTheDocument()
  })

  it('honors responsive vertical orientation below the default breakpoint', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width: 532px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const result = render(() => <Steps items={[{ title: 'One' }, { title: 'Two' }]} />)

    expect(result.container.firstElementChild).toHaveClass('ads-steps-vertical')

    window.matchMedia = originalMatchMedia
  })
})
