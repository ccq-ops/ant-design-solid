import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Typography } from '../index'

describe('Typography', () => {
  it('renders root typography and link components', () => {
    const result = render(() => (
      <Typography class="root-extra" rootClass="root-layer" component="section">
        <Typography.Link href="https://example.com" target="_blank">
          Example
        </Typography.Link>
      </Typography>
    ))
    const root = result.container.querySelector('section')!
    expect(root).toHaveClass('ads-typography')
    expect(root).toHaveClass('root-extra')
    expect(root).toHaveClass('root-layer')
    const link = result.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveClass('ads-typography-link')
  })

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

  it('renders text decorations and disabled state', () => {
    const result = render(() => (
      <Typography.Text code mark underline delete strong keyboard italic disabled>
        Decorated
      </Typography.Text>
    ))
    const root = result.getByText('Decorated').closest('.ads-typography')!
    expect(root).toHaveClass('ads-typography-disabled')
    expect(root.querySelector('code')).toHaveTextContent('Decorated')
    expect(root.querySelector('mark')).toBeTruthy()
    expect(root.querySelector('u')).toBeTruthy()
    expect(root.querySelector('del')).toBeTruthy()
    expect(root.querySelector('strong')).toBeTruthy()
    expect(root.querySelector('kbd')).toBeTruthy()
    expect(root.querySelector('i')).toBeTruthy()
  })

  it('copies configured text and renders action placement with semantic slots', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.assign(navigator, { clipboard: { writeText } })
    const onCopy = vi.fn()
    const result = render(() => (
      <Typography.Text
        actions={{ placement: 'start' }}
        copyable={{ text: () => 'copy me', onCopy, tooltips: false }}
        classNames={{ actions: 'custom-actions', action: 'custom-action' }}
        styles={{ action: { color: 'red' } }}
      >
        Visible
      </Typography.Text>
    ))
    const root = result.getByText('Visible').closest('.ads-typography')!
    const actions = root.querySelector('.ads-typography-actions')!
    expect(actions).toHaveClass('custom-actions')
    expect(root.firstElementChild).toBe(actions)
    const button = result.getByRole('button', { name: 'copy' })
    expect(button).toHaveClass('custom-action')
    expect(button).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    fireEvent.click(button)
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('copy me'))
    await waitFor(() => expect(onCopy).toHaveBeenCalled())
  })

  it('edits text with lifecycle callbacks', () => {
    const onStart = vi.fn()
    const onChange = vi.fn()
    const onEnd = vi.fn()
    const onCancel = vi.fn()
    const result = render(() => (
      <Typography.Paragraph
        editable={{
          text: 'Draft',
          onStart,
          onChange,
          onEnd,
          onCancel,
          maxLength: 20,
          autoSize: { minRows: 2, maxRows: 4 },
        }}
      >
        Draft
      </Typography.Paragraph>
    ))
    fireEvent.click(result.getByRole('button', { name: 'edit' }))
    expect(onStart).toHaveBeenCalled()
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toHaveValue('Draft')
    expect(textarea).toHaveAttribute('maxlength', '20')
    fireEvent.input(textarea, { target: { value: 'Updated' } })
    expect(onChange).toHaveBeenCalledWith('Updated')
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onEnd).toHaveBeenCalled()
    fireEvent.click(result.getByRole('button', { name: 'edit' }))
    fireEvent.keyDown(result.getByRole('textbox'), { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('supports controlled editable state', () => {
    function Demo() {
      const [editing, setEditing] = createSignal(true)
      return (
        <>
          <button type="button" onClick={() => setEditing(false)}>
            close
          </button>
          <Typography.Text editable={{ editing: editing(), text: 'Controlled' }}>
            Controlled
          </Typography.Text>
        </>
      )
    }
    const result = render(() => <Demo />)
    expect(result.getByRole('textbox')).toHaveValue('Controlled')
    fireEvent.click(result.getByRole('button', { name: 'close' }))
    expect(result.queryByRole('textbox')).toBeFalsy()
  })

  it('renders ellipsis configuration and expansion controls', () => {
    const onExpand = vi.fn()
    const onEllipsis = vi.fn()
    const result = render(() => (
      <Typography.Paragraph
        ellipsis={{
          rows: 2,
          expandable: 'collapsible',
          suffix: '--end',
          symbol: (expanded) => (expanded ? 'collapse' : 'more'),
          onExpand,
          onEllipsis,
        }}
      >
        Long content
      </Typography.Paragraph>
    ))
    const paragraph = result.getByText(/Long content/).closest('.ads-typography')!
    expect(paragraph).toHaveClass('ads-typography-ellipsis')
    expect(paragraph).toHaveStyle({ '-webkit-line-clamp': '2' })
    expect(result.getByText('--end')).toBeTruthy()
    expect(onEllipsis).toHaveBeenCalledWith(true)
    fireEvent.click(result.getByRole('button', { name: 'more' }))
    expect(onExpand).toHaveBeenCalledWith(expect.any(Object), { expanded: true })
    expect(paragraph).toHaveClass('ads-typography-expanded')
    fireEvent.click(result.getByRole('button', { name: 'collapse' }))
    expect(onExpand).toHaveBeenCalledWith(expect.any(Object), { expanded: false })
  })

  it('restricts text and link ellipsis like antd v6', () => {
    const result = render(() => (
      <>
        <Typography.Text ellipsis={{ rows: 3, expandable: true } as never}>
          Text ellipsis
        </Typography.Text>
        <Typography.Link ellipsis={{ rows: 3 } as never}>Link ellipsis</Typography.Link>
      </>
    ))
    expect(result.getByText('Text ellipsis').closest('.ads-typography')).not.toHaveStyle({
      '-webkit-line-clamp': '3',
    })
    expect(result.queryByRole('button', { name: 'more' })).toBeFalsy()
    expect(result.getByText('Link ellipsis').closest('.ads-typography')).toHaveClass(
      'ads-typography-ellipsis',
    )
  })
})
