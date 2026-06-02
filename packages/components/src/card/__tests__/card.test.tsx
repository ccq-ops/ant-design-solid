import { render } from '@solidjs/testing-library'
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
})
