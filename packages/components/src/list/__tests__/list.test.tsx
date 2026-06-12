import { cleanup, render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it } from 'vitest'
import { List } from '../index'

afterEach(() => cleanup())

describe('List', () => {
  it('renders dataSource with renderItem, header, and footer', () => {
    const { container } = render(() => (
      <List
        header={<span>Header</span>}
        footer={<span>Footer</span>}
        dataSource={['Alpha', 'Beta']}
        renderItem={(item, index) => <List.Item>{`${index + 1}. ${item}`}</List.Item>}
      />
    ))

    expect(container.querySelector('.ads-list')).toBeInTheDocument()
    expect(container.querySelector('.ads-list-header')).toHaveTextContent('Header')
    expect(container.querySelector('.ads-list-footer')).toHaveTextContent('Footer')
    expect(container.querySelector('.ads-list-items')).toHaveProperty('tagName', 'UL')
    expect(container.querySelectorAll('.ads-list-item')).toHaveLength(2)
    expect(screen.getByText('1. Alpha').closest('li')).toHaveClass('ads-list-item')
    expect(screen.getByText('2. Beta').closest('li')).toHaveClass('ads-list-item')
  })

  it('renders direct children when dataSource is not supplied', () => {
    render(() => (
      <List>
        <List.Item>Child one</List.Item>
        <List.Item>Child two</List.Item>
      </List>
    ))

    expect(screen.getByText('Child one')).toBeInTheDocument()
    expect(screen.getByText('Child two')).toBeInTheDocument()
  })

  it('renders empty text when there are no items or children', () => {
    const { container } = render(() => <List dataSource={[]} emptyText="Nothing here" />)

    expect(container.querySelector('.ads-list-empty')).toHaveTextContent('Nothing here')
    expect(container.querySelectorAll('.ads-list-item')).toHaveLength(0)
  })

  it('renders default empty text', () => {
    const { container } = render(() => <List />)

    expect(container.querySelector('.ads-list-empty')).toHaveTextContent('No Data')
  })

  it('renders Spin when loading while keeping items mounted', () => {
    const { container } = render(() => (
      <List dataSource={['Alpha']} loading renderItem={(item) => <List.Item>{item}</List.Item>} />
    ))

    expect(container.querySelector('.ads-spin-nested-loading')).toBeInTheDocument()
    expect(container.querySelector('.ads-spin-overlay')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(container.querySelectorAll('.ads-list-item')).toHaveLength(1)
  })

  it('applies bordered, split, size, class, classList, and style variants', () => {
    const { container } = render(() => (
      <List
        data-testid="list"
        class="custom-list"
        classList={{ active: true }}
        style={{ margin: '4px' }}
        bordered
        split={false}
        size="small"
        dataSource={['Alpha']}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    ))

    const list = screen.getByTestId('list')
    expect(list).toHaveClass('ads-list')
    expect(list).toHaveClass('ads-list-bordered')
    expect(list).toHaveClass('ads-list-small')
    expect(list).toHaveClass('custom-list')
    expect(list).toHaveClass('active')
    expect(list).not.toHaveClass('ads-list-split')
    expect(list).toHaveStyle({ margin: '4px' })
    expect(container.querySelector('.ads-list-item')).toHaveTextContent('Alpha')
  })

  it('renders item actions, extra, and meta', () => {
    const { container } = render(() => (
      <List>
        <List.Item
          actions={[<button type="button">Edit</button>, <a href="#delete">Delete</a>]}
          extra={<span>Extra</span>}
        >
          <List.Item.Meta
            avatar={<span>A</span>}
            title={<a href="#title">Title</a>}
            description="Description"
          />
          Main content
        </List.Item>
      </List>
    ))

    const item = container.querySelector('.ads-list-item')
    expect(item).toHaveProperty('tagName', 'LI')
    expect(container.querySelector('.ads-list-item-main')).toHaveTextContent('Main content')
    expect(container.querySelector('.ads-list-item-extra')).toHaveTextContent('Extra')
    expect(container.querySelector('.ads-list-item-actions')).toHaveTextContent('Edit')
    expect(container.querySelector('.ads-list-item-actions')).toHaveTextContent('Delete')
    expect(container.querySelectorAll('.ads-list-item-action')).toHaveLength(2)
    expect(container.querySelector('.ads-list-item-meta-avatar')).toHaveTextContent('A')
    expect(container.querySelector('.ads-list-item-meta-title')).toHaveTextContent('Title')
    expect(container.querySelector('.ads-list-item-meta-description')).toHaveTextContent(
      'Description',
    )
  })

  it('renders List.Item and List.Item.Meta standalone as DOM', () => {
    const { container } = render(() => (
      <>
        <List.Item>Standalone item</List.Item>
        <List.Item.Meta title="Standalone meta" description="Meta description" />
      </>
    ))

    expect(screen.getByText('Standalone item').closest('li')).toHaveClass('ads-list-item')
    expect(container.querySelector('.ads-list-item-meta-title')).toHaveTextContent(
      'Standalone meta',
    )
    expect(container.querySelector('.ads-list-item-meta-description')).toHaveTextContent(
      'Meta description',
    )
  })

  it('renders locale empty text before emptyText fallback', () => {
    const { container } = render(() => (
      <List dataSource={[]} emptyText="Fallback" locale={{ emptyText: 'Localized empty' }} />
    ))

    expect(container.querySelector('.ads-list-empty')).toHaveTextContent('Localized empty')
  })

  it('wraps content with Spin when loading receives config', () => {
    const { container } = render(() => (
      <List
        loading={{ spinning: true, tip: 'Fetching rows' }}
        dataSource={['Alpha']}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    ))

    expect(container.querySelector('.ads-spin-nested-loading')).toBeInTheDocument()
    expect(container.querySelector('.ads-spin-description')).toHaveTextContent('Fetching rows')
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })

  it('renders loadMore after list content', () => {
    const { container } = render(() => (
      <List
        dataSource={['Alpha']}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        loadMore={<button type="button">Load more</button>}
      />
    ))

    expect(container.querySelector('.ads-list-load-more')).toHaveTextContent('Load more')
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })

  it('paginates dataSource and renders pagination positions', () => {
    const { container } = render(() => (
      <List
        dataSource={['Alpha', 'Beta', 'Gamma']}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        pagination={{ pageSize: 1, position: 'both' }}
      />
    ))

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.ads-list-pagination')).toHaveLength(2)
    expect(container.querySelectorAll('.ads-pagination')).toHaveLength(2)
  })

  it('supports boolean pagination with default settings', () => {
    const { container } = render(() => (
      <List
        dataSource={Array.from({ length: 12 }, (_, index) => `Item ${index + 1}`)}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        pagination
      />
    ))

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.ads-list-pagination')).toHaveLength(1)
  })

  it('uses rowKey values on rendered data items', () => {
    const { container } = render(() => (
      <List
        dataSource={[
          { id: 'one', label: 'Alpha' },
          { id: 'two', label: 'Beta' },
        ]}
        rowKey="id"
        renderItem={(item) => <List.Item>{item.label}</List.Item>}
      />
    ))

    expect(container.querySelector('[data-row-key="one"]')).toHaveTextContent('Alpha')
    expect(container.querySelector('[data-row-key="two"]')).toHaveTextContent('Beta')
  })

  it('renders grid items with responsive column width', () => {
    const { container } = render(() => (
      <List
        grid={{ gutter: 12, column: 2 }}
        dataSource={['Alpha', 'Beta']}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    ))

    expect(container.querySelector('.ads-list')).toHaveClass('ads-list-grid')
    expect(container.querySelector('.ads-list-grid-row')).toBeInTheDocument()
    const columns = container.querySelectorAll('.ads-list-grid-column')
    expect(columns).toHaveLength(2)
    expect(columns[0]).toHaveStyle({ width: '50%', 'max-width': '50%' })
  })

  it('supports vertical item layout with actions and extra placement', () => {
    const { container } = render(() => (
      <List itemLayout="vertical">
        <List.Item actions={[<button type="button">Edit</button>]} extra={<span>Extra</span>}>
          Body
        </List.Item>
      </List>
    ))

    expect(container.querySelector('.ads-list')).toHaveClass('ads-list-vertical')
    expect(container.querySelector('.ads-list-item')).toHaveClass('ads-list-item-vertical')
    expect(container.querySelector('.ads-list-item-main .ads-list-item-actions')).toHaveTextContent(
      'Edit',
    )
    expect(container.querySelector('.ads-list-item-extra')).toHaveTextContent('Extra')
  })

  it('applies item semantic classes and styles', () => {
    const { container } = render(() => (
      <List>
        <List.Item
          actions={[<button type="button">Edit</button>]}
          extra={<span>Extra</span>}
          classNames={{ actions: 'custom-actions', extra: 'custom-extra' }}
          styles={{ actions: { color: 'red' }, extra: { color: 'blue' } }}
        >
          Body
        </List.Item>
      </List>
    ))

    expect(container.querySelector('.ads-list-item-actions')).toHaveClass('custom-actions')
    expect(container.querySelector('.ads-list-item-actions')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    })
    expect(container.querySelector('.ads-list-item-extra')).toHaveClass('custom-extra')
    expect(container.querySelector('.ads-list-item-extra')).toHaveStyle({
      color: 'rgb(0, 0, 255)',
    })
  })

  it('supports custom prefixCls and rootClass', () => {
    const { container } = render(() => (
      <List
        prefixCls="custom-list"
        rootClass="root-extra"
        dataSource={['Alpha']}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    ))

    expect(container.querySelector('.custom-list')).toBeInTheDocument()
    expect(container.querySelector('.custom-list')).toHaveClass('root-extra')
    expect(container.querySelector('.custom-list-item')).toHaveTextContent('Alpha')
  })
})
