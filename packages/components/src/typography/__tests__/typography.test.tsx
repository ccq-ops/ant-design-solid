import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Typography } from '../index'

describe('Typography', () => {
  it('renders semantic title levels', () => {
    const result = render(() => <Typography.Title level={2}>Heading</Typography.Title>)
    const heading = result.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Heading')
    expect(heading.className).toContain('ads-typography-title')
  })
  it('renders text type and paragraph ellipsis', () => {
    const result = render(() => (
      <>
        <Typography.Text type="secondary">Secondary</Typography.Text>
        <Typography.Paragraph ellipsis>Long text</Typography.Paragraph>
      </>
    ))
    expect(result.getByText('Secondary').className).toContain('ads-typography-secondary')
    expect(result.getByText('Long text').className).toContain('ads-typography-ellipsis')
  })
})
