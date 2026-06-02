import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Avatar } from '../index'

describe('Avatar', () => {
  it('renders text fallback children', () => {
    const result = render(() => <Avatar>JD</Avatar>)

    expect(result.getByText('JD')).toHaveClass('ads-avatar-string')
  })

  it('falls back to children when image loading fails', () => {
    const result = render(() => (
      <Avatar src="https://example.invalid/avatar.png" alt="Jane Doe">
        JD
      </Avatar>
    ))
    const image = result.getByAltText('Jane Doe')

    fireEvent.error(image)

    expect(result.queryByAltText('Jane Doe')).toBeNull()
    expect(result.getByText('JD')).toHaveClass('ads-avatar-string')
  })

  it('hides overflow children and shows max count in groups', () => {
    const result = render(() => (
      <Avatar.Group maxCount={2}>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
        <Avatar>D</Avatar>
      </Avatar.Group>
    ))

    expect(result.getByText('A')).toBeInTheDocument()
    expect(result.getByText('B')).toBeInTheDocument()
    expect(result.queryByText('C')).toBeNull()
    expect(result.queryByText('D')).toBeNull()
    expect(result.getByText('+2')).toHaveClass('ads-avatar-string')
  })
})
