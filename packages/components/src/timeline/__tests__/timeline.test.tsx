import { render } from '@solidjs/testing-library'
import { describe, expect, test } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Timeline } from '../index'

describe('Timeline', () => {
  test('renders basic items and labels', () => {
    const result = render(() => (
      <Timeline
        items={[
          { label: '2026-01-01', children: 'Create project' },
          { label: '2026-01-02', children: 'Ship component' },
        ]}
      />
    ))

    expect(result.getByText('2026-01-01')).toBeTruthy()
    expect(result.getByText('Create project')).toBeTruthy()
    expect(result.container.querySelectorAll('.ads-timeline-item')).toHaveLength(2)
  })

  test('supports reverse without mutating the source items', () => {
    const items = [{ children: 'First' }, { children: 'Second' }, { children: 'Third' }]
    const result = render(() => <Timeline reverse items={items} />)
    const contents = Array.from(
      result.container.querySelectorAll('.ads-timeline-item-content'),
    ).map((node) => node.textContent)

    expect(contents).toEqual(['Third', 'Second', 'First'])
    expect(items.map((item) => item.children)).toEqual(['First', 'Second', 'Third'])
  })

  test('supports pending text and custom pending dot', () => {
    const result = render(() => (
      <Timeline
        pending="Waiting"
        pendingDot={<span data-testid="pending-dot">...</span>}
        items={[{ children: 'Done' }]}
      />
    ))

    expect(result.getByText('Waiting')).toBeTruthy()
    expect(result.getByTestId('pending-dot')).toBeTruthy()
    expect(result.container.querySelector('.ads-timeline-item-pending')).toBeTruthy()
  })

  test('supports alternate mode and item-level position', () => {
    const result = render(() => (
      <Timeline
        mode="alternate"
        items={[
          { children: 'Left' },
          { children: 'Right' },
          { children: 'Forced right', position: 'right' },
        ]}
      />
    ))
    const items = result.container.querySelectorAll('.ads-timeline-item')

    expect(items[0].className).toContain('ads-timeline-item-left')
    expect(items[1].className).toContain('ads-timeline-item-right')
    expect(items[2].className).toContain('ads-timeline-item-right')
  })

  test('supports semantic colors custom colors and custom dots', () => {
    const result = render(() => (
      <Timeline
        items={[
          { children: 'Green', color: 'green' },
          { children: 'Purple', color: '#722ed1' },
          { children: 'Custom', dot: <span data-testid="custom-dot">*</span> },
        ]}
      />
    ))

    expect(result.container.querySelector('.ads-timeline-item-dot-green')).toBeTruthy()
    const purpleDot = result.container.querySelectorAll('.ads-timeline-item-dot')[1] as HTMLElement
    expect(purpleDot.style.borderColor).toBe('rgb(114, 46, 209)')
    expect(result.getByTestId('custom-dot')).toBeTruthy()
  })

  test('supports custom and config provider prefixes', () => {
    const custom = render(() => (
      <Timeline prefixCls="custom-timeline" items={[{ children: 'Custom' }]} />
    ))
    expect(custom.container.querySelector('.custom-timeline')).toBeTruthy()

    const configured = render(() => (
      <ConfigProvider prefixCls="corp">
        <Timeline items={[{ children: 'Configured' }]} />
      </ConfigProvider>
    ))
    expect(configured.container.querySelector('.corp-timeline')).toBeTruthy()
  })
})
