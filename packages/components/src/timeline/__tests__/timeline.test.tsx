import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Timeline } from '../index'

describe('Timeline', () => {
  it('renders v6 title and content items through ordered-list semantics', () => {
    const result = render(() => (
      <Timeline
        items={[
          { title: '2026-06-01', content: 'Create account' },
          { title: '2026-06-02', content: 'Verify email' },
        ]}
      />
    ))

    expect(result.container.firstElementChild?.tagName).toBe('OL')
    expect(result.container.firstElementChild).toHaveClass('ads-timeline')
    expect(result.getAllByRole('listitem')).toHaveLength(2)
    expect(result.getByText('2026-06-01')).toHaveClass('ads-timeline-item-title')
    expect(result.getByText('Create account')).toHaveClass('ads-timeline-item-content')
  })

  it('supports start end and alternate placement modes', () => {
    const start = render(() => <Timeline mode="start" items={[{ content: 'Start' }]} />)
    const end = render(() => <Timeline mode="end" items={[{ content: 'End' }]} />)
    const alternate = render(() => (
      <Timeline
        mode="alternate"
        items={[{ content: 'One' }, { content: 'Two' }, { content: 'Three', placement: 'end' }]}
      />
    ))

    expect(start.container.querySelector('.ads-timeline-item')).toHaveClass(
      'ads-timeline-item-placement-start',
    )
    expect(end.container.querySelector('.ads-timeline-item')).toHaveClass(
      'ads-timeline-item-placement-end',
    )
    const items = alternate.container.querySelectorAll('.ads-timeline-item')
    expect(items[0]).toHaveClass('ads-timeline-item-placement-start')
    expect(items[1]).toHaveClass('ads-timeline-item-placement-end')
    expect(items[2]).toHaveClass('ads-timeline-item-placement-end')
  })

  it('supports orientation variant and titleSpan', () => {
    const result = render(() => (
      <Timeline
        orientation="horizontal"
        variant="filled"
        titleSpan={160}
        items={[{ title: 'Launch', content: 'Ready' }]}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement
    expect(root).toHaveClass('ads-timeline-horizontal')
    expect(root).toHaveClass('ads-timeline-variant-filled')
    expect(root.style.getPropertyValue('--ads-timeline-title-span')).toBe('160px')
  })

  it('supports color custom icon loading and reverse', () => {
    const result = render(() => (
      <Timeline
        reverse
        items={[
          { content: 'First', color: 'green' },
          { content: 'Second', icon: <span data-testid="custom-icon">I</span> },
          { content: 'Third', loading: true, color: '#722ed1' },
        ]}
      />
    ))

    const contents = Array.from(
      result.container.querySelectorAll('.ads-timeline-item-content'),
    ).map((node) => node.textContent)
    expect(contents).toEqual(['Third', 'Second', 'First'])
    expect(result.container.querySelector('.ads-timeline-item-color-green')).toBeInTheDocument()
    expect(result.getByTestId('custom-icon')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-timeline-item-loading')).toBeInTheDocument()
    expect(
      (result.container.querySelector('.ads-timeline-item') as HTMLElement).style.getPropertyValue(
        '--ads-timeline-item-icon-color',
      ),
    ).toBe('#722ed1')
  })

  it('supports root and item semantic classNames and styles', () => {
    const result = render(() => (
      <Timeline
        rootClassName="root-extra"
        className="class-name-extra"
        class="class-extra"
        classNames={{
          root: 'semantic-root',
          item: 'semantic-item',
          itemIcon: 'semantic-icon',
          itemTitle: 'semantic-title',
          itemContent: 'semantic-content',
          itemRail: 'semantic-rail',
          itemWrapper: 'semantic-wrapper',
          itemSection: 'semantic-section',
          itemHeader: 'semantic-header',
        }}
        styles={{
          root: { width: '480px' },
          itemIcon: { color: 'rgb(255, 0, 0)' },
        }}
        items={[
          {
            title: 'Styled',
            content: 'Content',
            className: 'item-extra',
            style: { margin: '2px' },
            classNames: { itemContent: 'item-content-extra' },
            styles: { itemContent: { color: 'rgb(0, 128, 0)' } },
          },
        ]}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement
    const item = result.getByRole('listitem')
    const content = result.getByText('Content')

    expect(root).toHaveClass('root-extra')
    expect(root).toHaveClass('class-name-extra')
    expect(root).toHaveClass('class-extra')
    expect(root).toHaveClass('semantic-root')
    expect(root).toHaveStyle({ width: '480px' })
    expect(item).toHaveClass('semantic-item')
    expect(item).toHaveClass('item-extra')
    expect(item).toHaveStyle({ margin: '2px' })
    expect(result.container.querySelector('.ads-timeline-item-icon')).toHaveClass('semantic-icon')
    expect(result.container.querySelector('.ads-timeline-item-icon')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    })
    expect(result.getByText('Styled')).toHaveClass('semantic-title')
    expect(content).toHaveClass('semantic-content')
    expect(content).toHaveClass('item-content-extra')
    expect(content).toHaveStyle({ color: 'rgb(0, 128, 0)' })
    expect(result.container.querySelector('.ads-timeline-item-rail')).toHaveClass('semantic-rail')
    expect(result.container.querySelector('.ads-timeline-item-wrapper')).toHaveClass(
      'semantic-wrapper',
    )
    expect(result.container.querySelector('.ads-timeline-item-section')).toHaveClass(
      'semantic-section',
    )
    expect(result.container.querySelector('.ads-timeline-item-header')).toHaveClass(
      'semantic-header',
    )
  })

  it('supports custom prefixCls and ConfigProvider prefixing', () => {
    const custom = render(() => (
      <Timeline prefixCls="custom-timeline" items={[{ content: 'Custom' }]} />
    ))
    expect(custom.container.querySelector('.custom-timeline')).toBeTruthy()

    const configured = render(() => (
      <ConfigProvider prefixCls="corp">
        <Timeline items={[{ content: 'Configured' }]} />
      </ConfigProvider>
    ))
    expect(configured.container.querySelector('.corp-timeline')).toBeTruthy()
  })

  it('registers stable vertical and horizontal layout styles', () => {
    render(() => (
      <>
        <Timeline items={[{ title: '2026-06-01', content: 'Create project' }]} />
        <Timeline
          orientation="horizontal"
          items={[
            { title: 'Plan', content: 'Define scope' },
            { title: 'Build', content: 'Ship' },
          ]}
        />
        <Timeline
          mode="alternate"
          items={[{ content: 'Create' }, { content: 'Solve' }, { content: 'Test' }]}
        />
      </>
    ))

    const styles = Array.from(document.head.querySelectorAll('style[data-ant-design-solid]'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styles).toContain('.ads-timeline-vertical .ads-timeline-item-section')
    expect(styles).toContain('grid-template-columns:var(--ads-timeline-title-span, 120px)')
    expect(styles).toContain('.ads-timeline-vertical .ads-timeline-item-content')
    expect(styles).toContain('padding-inline-start:16px;')
    expect(styles).toContain('align-self:start;')
    expect(styles).toContain('margin-top:6px;')
    expect(styles).toContain('margin-inline-end:0;')
    expect(styles).toMatch(/\.ads-timeline\.ads-timeline-horizontal\{[^}]*gap:0;/)
    expect(styles).toContain('.ads-timeline-horizontal .ads-timeline-item-rail')
    expect(styles).toContain('top:5px;')
    expect(styles).toContain('top:17px;')
    expect(styles).toContain('bottom:-5px;')
    expect(styles).toMatch(
      /\.ads-timeline\.ads-timeline-horizontal \.ads-timeline-item-content\{(?=[^}]*justify-self:start;)(?=[^}]*transform:translateX\(calc\(5px - 50%\)\);)[^}]*\}/,
    )
    expect(styles).toMatch(
      /\.ads-timeline\.ads-timeline-horizontal \.ads-timeline-item-rail\{(?=[^}]*display:block;)(?=[^}]*position:absolute;)[^}]*\}/,
    )
    expect(styles).toContain(
      '.ads-timeline.ads-timeline-horizontal:not(.ads-timeline-layout-alternate) .ads-timeline-item-placement-end',
    )
    expect(styles).toMatch(
      /\.ads-timeline\.ads-timeline-layout-alternate\.ads-timeline-horizontal \.ads-timeline-item\{[^}]*min-height:70px;/,
    )
    expect(styles).toContain(
      '.ads-timeline.ads-timeline-layout-alternate.ads-timeline-horizontal .ads-timeline-item-placement-start .ads-timeline-item-content',
    )
    expect(styles).toContain(
      '.ads-timeline.ads-timeline-layout-alternate.ads-timeline-horizontal .ads-timeline-item-placement-end .ads-timeline-item-content',
    )
    expect(styles).toContain('.ads-timeline-layout-alternate.ads-timeline-vertical')
    expect(styles).toContain('left:50%;')
    expect(styles).toContain(
      '.ads-timeline-layout-alternate.ads-timeline-vertical .ads-timeline-item-placement-end .ads-timeline-item-section',
    )
    expect(styles).toContain(
      '.ads-timeline-layout-alternate.ads-timeline-vertical .ads-timeline-item-placement-end .ads-timeline-item-rail',
    )
  })
})
