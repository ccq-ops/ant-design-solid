import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Card } from '../index'

describe('Card', () => {
  it('renders body content with default bordered class', () => {
    const result = render(() => <Card data-testid="card">Body</Card>)
    const card = result.getByTestId('card')

    expect(card.className).toContain('ads-card')
    expect(card.className).toContain('ads-card-bordered')
    expect(card.className).not.toContain('ads-card-small')
    expect(result.getByText('Body')).toHaveClass('ads-card-body')
  })

  it('renders header only when title or extra is provided', () => {
    const withoutHeader = render(() => <Card>Body</Card>)
    expect(withoutHeader.container.querySelector('.ads-card-head')).toBeNull()
    withoutHeader.unmount()

    const withHeader = render(() => (
      <Card title="Title" extra={<a href="#more">More</a>}>
        Body
      </Card>
    ))

    expect(withHeader.getByText('Title')).toHaveClass('ads-card-head-title')
    expect(withHeader.getByText('More').parentElement).toHaveClass('ads-card-extra')
  })

  it('renders cover before header and non-empty actions after body', () => {
    const result = render(() => (
      <Card
        title="Title"
        cover={<img alt="cover" src="cover.png" />}
        actions={[<button type="button">Edit</button>, <button type="button">Share</button>]}
      >
        Body
      </Card>
    ))
    const card = result.container.firstElementChild as HTMLElement

    expect(card.children[0]).toHaveClass('ads-card-cover')
    expect(card.children[1]).toHaveClass('ads-card-head')
    expect(card.children[2]).toHaveClass('ads-card-body')
    expect(card.children[3]).toHaveClass('ads-card-actions')
    expect(result.getAllByRole('listitem')).toHaveLength(2)
  })

  it('applies hoverable, small, and borderless variants', () => {
    const result = render(() => (
      <Card hoverable size="small" bordered={false} data-testid="card">
        Body
      </Card>
    ))
    const card = result.getByTestId('card')

    expect(card.className).toContain('ads-card-hoverable')
    expect(card.className).toContain('ads-card-small')
    expect(card.className).not.toContain('ads-card-bordered')
  })

  it('supports variant, root class, and semantic classNames/styles', () => {
    const result = render(() => (
      <Card
        data-testid="card"
        variant="borderless"
        rootClass="root-extra"
        classNames={{
          root: 'semantic-root',
          header: 'semantic-header',
          title: 'semantic-title',
          extra: 'semantic-extra',
          body: 'semantic-body',
          cover: 'semantic-cover',
          actions: 'semantic-actions',
        }}
        styles={{
          body: { color: 'red' },
          header: { 'background-color': 'blue' },
        }}
        title="Title"
        extra="Extra"
        cover={<div>Cover</div>}
        actions={[<button type="button">Action</button>]}
      >
        Body
      </Card>
    ))
    const card = result.getByTestId('card')

    expect(card.className).toContain('ads-card-borderless')
    expect(card.className).not.toContain('ads-card-bordered')
    expect(card).toHaveClass('root-extra')
    expect(card).toHaveClass('semantic-root')
    expect(result.container.querySelector('.ads-card-head')).toHaveClass('semantic-header')
    expect(result.container.querySelector('.ads-card-head-title')).toHaveClass('semantic-title')
    expect(result.container.querySelector('.ads-card-extra')).toHaveClass('semantic-extra')
    expect(result.container.querySelector('.ads-card-body')).toHaveClass('semantic-body')
    expect(result.container.querySelector('.ads-card-body')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    })
    expect(result.container.querySelector('.ads-card-cover')).toHaveClass('semantic-cover')
    expect(result.container.querySelector('.ads-card-actions')).toHaveClass('semantic-actions')
  })

  it('renders loading skeleton instead of children', () => {
    const result = render(() => (
      <Card loading>
        <span>Loaded content</span>
      </Card>
    ))

    expect(result.container.querySelector('.ads-skeleton')).not.toBeNull()
    expect(result.queryByText('Loaded content')).toBeNull()
  })

  it('renders inner cards and tab list with tab change callback', () => {
    const changedKeys: string[] = []
    const result = render(() => (
      <Card
        type="inner"
        title="Inner title"
        tabList={[
          { key: 'one', label: 'One' },
          { key: 'two', tab: 'Two' },
        ]}
        tabBarExtraContent={<button type="button">New</button>}
        onTabChange={(key) => changedKeys.push(key)}
      >
        Body
      </Card>
    ))

    expect(result.container.querySelector('.ads-card-type-inner')).not.toBeNull()
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(changedKeys).toEqual(['two'])
    expect(result.getByText('New').parentElement).toHaveClass('ads-tabs-extra-content-right')
  })

  it('renders controlled tab lists without a reactive update loop', () => {
    const result = render(() => (
      <Card
        title="Tabbed card"
        activeTabKey="overview"
        onTabChange={() => {}}
        tabList={[
          { key: 'overview', label: 'Overview' },
          { key: 'activity', label: 'Activity' },
          { key: 'settings', label: 'Settings' },
        ]}
      >
        Current tab
      </Card>
    ))

    expect(result.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByText('Current tab')).toBeInTheDocument()
  })

  it('supports Card.Grid and Card.Meta sub components', () => {
    const result = render(() => (
      <Card>
        <Card.Grid data-testid="grid">Grid content</Card.Grid>
        <Card.Grid hoverable={false} data-testid="static-grid">
          Static grid
        </Card.Grid>
        <Card.Meta
          avatar={<span>Avatar</span>}
          title="Meta title"
          description="Meta description"
          class="meta-root"
          classNames={{ avatar: 'meta-avatar', title: 'meta-title' }}
        />
      </Card>
    ))

    expect(result.getByTestId('grid')).toHaveClass('ads-card-grid')
    expect(result.getByTestId('grid')).toHaveClass('ads-card-grid-hoverable')
    expect(result.getByTestId('static-grid')).not.toHaveClass('ads-card-grid-hoverable')
    expect(result.container.querySelector('.ads-card-contain-grid')).not.toBeNull()
    expect(result.container.querySelector('.ads-card-meta')).toHaveClass('meta-root')
    expect(result.getByText('Avatar').parentElement).toHaveClass('meta-avatar')
    expect(result.getByText('Meta title')).toHaveClass('meta-title')
    expect(result.getByText('Meta description')).toHaveClass('ads-card-meta-description')
  })

  it('does not resolve children more than once to detect grids', () => {
    let calls = 0

    render(() => (
      <Card>
        {(() => {
          calls += 1
          return <Card.Grid>Grid content</Card.Grid>
        })()}
      </Card>
    ))

    expect(calls).toBe(1)
  })
})
