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

  it('renders loading placeholder instead of items', () => {
    const { container } = render(() => (
      <List dataSource={['Alpha']} loading renderItem={(item) => <List.Item>{item}</List.Item>} />
    ))

    expect(container.querySelector('.ads-list-loading')).toHaveTextContent('Loading...')
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.ads-list-item')).toHaveLength(0)
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
})
