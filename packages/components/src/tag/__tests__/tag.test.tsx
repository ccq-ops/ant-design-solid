import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tag } from '../index'

describe('Tag', () => {
  it('renders children and default classes', () => {
    const result = render(() => <Tag>Open</Tag>)
    const tag = result.getByText('Open')
    expect(tag.className).toContain('ads-tag')
  })

  it('supports color and borderless state', () => {
    const result = render(() => (
      <Tag color="success" bordered={false}>
        Success
      </Tag>
    ))
    const tag = result.getByText('Success')
    expect(tag.className).toContain('ads-tag-success')
    expect(tag.className).toContain('ads-tag-borderless')
  })

  it('supports arbitrary color as inline custom property', () => {
    const result = render(() => <Tag color="#722ed1">Purple</Tag>)
    const tag = result.getByText('Purple') as HTMLElement
    expect(tag.getAttribute('style')).toContain('--ads-tag-custom-color: #722ed1')
    expect(tag.className).toContain('ads-tag-has-color')
  })

  it('calls onClose when closable close button is clicked', () => {
    const onClose = vi.fn()
    const result = render(() => (
      <Tag closable onClose={onClose}>
        Closable
      </Tag>
    ))
    fireEvent.click(result.getByLabelText('Close tag'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Tag>Custom</Tag>
      </ConfigProvider>
    ))
    expect(result.getByText('Custom').className).toContain('custom-tag')
  })

  it('supports variants icon and semantic classes and styles', () => {
    const result = render(() => (
      <Tag
        variant="solid"
        color="blue"
        icon={<span data-testid="icon">I</span>}
        classNames={{
          root: 'custom-root',
          icon: 'custom-icon',
          content: 'custom-content',
          close: 'custom-close',
        }}
        styles={{
          root: { margin: '4px' },
          icon: { color: 'red' },
          content: { 'font-weight': 600 },
          close: { color: 'green' },
        }}
        closable
        closeIcon={<span data-testid="close-icon">x</span>}
      >
        Labeled
      </Tag>
    ))

    const tag = result.getByText('Labeled').closest('.ads-tag') as HTMLElement
    expect(tag.className).toContain('ads-tag-solid')
    expect(tag.className).toContain('ads-tag-blue')
    expect(tag.className).toContain('custom-root')
    expect(tag.style.margin).toBe('4px')
    expect(result.getByTestId('icon').parentElement).toHaveClass('custom-icon')
    expect(result.getByTestId('icon').parentElement?.style.color).toBe('red')
    expect(result.getByText('Labeled')).toHaveClass('custom-content')
    expect(result.getByText('Labeled').style.fontWeight).toBe('600')
    expect(result.getByTestId('close-icon').parentElement).toHaveClass('custom-close')
    expect(result.getByTestId('close-icon').parentElement?.style.color).toBe('green')
  })

  it('renders as disabled anchor when href and disabled are provided', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Tag href="/docs" target="_blank" disabled onClick={onClick}>
        Link
      </Tag>
    ))
    const tag = result.getByText('Link') as HTMLAnchorElement

    expect(tag.tagName).toBe('A')
    expect(tag).not.toHaveAttribute('href')
    expect(tag).toHaveAttribute('target', '_blank')
    expect(tag).toHaveAttribute('aria-disabled', 'true')
    expect(tag.className).toContain('ads-tag-disabled')
    fireEvent.click(tag)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('hides after close unless onClose prevents default', () => {
    const onClose = vi.fn((event: MouseEvent) => event.preventDefault())
    const result = render(() => (
      <Tag closable onClose={onClose}>
        Persistent
      </Tag>
    ))

    fireEvent.click(result.getByLabelText('Close tag'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(result.getByText('Persistent')).toBeInTheDocument()

    const result2 = render(() => <Tag closable>Dismissible</Tag>)
    fireEvent.click(result2.getByLabelText('Close tag'))
    expect(result2.queryByText('Dismissible')).not.toBeInTheDocument()
  })

  it('supports keyboard close interaction and disabled close state', () => {
    const onClose = vi.fn()
    const result = render(() => (
      <Tag closable onClose={onClose}>
        Keyboard
      </Tag>
    ))
    fireEvent.keyDown(result.getByLabelText('Close tag'), { key: 'Enter' })
    expect(onClose).toHaveBeenCalledTimes(1)

    const disabledClose = vi.fn()
    const result2 = render(() => (
      <Tag closable disabled onClose={disabledClose}>
        Disabled
      </Tag>
    ))
    fireEvent.click(result2.getByLabelText('Close tag'))
    expect(disabledClose).not.toHaveBeenCalled()
    expect(result2.getByText('Disabled')).toBeInTheDocument()
  })
})

describe('Tag.CheckableTag', () => {
  it('renders a controlled checkbox-like tag with icon and disabled behavior', () => {
    const onChange = vi.fn()
    const onClick = vi.fn()
    const result = render(() => (
      <Tag.CheckableTag
        checked={false}
        icon={<span data-testid="check-icon">i</span>}
        onChange={onChange}
        onClick={onClick}
        disabled
      >
        Choice
      </Tag.CheckableTag>
    ))

    const tag = result.getByRole('checkbox', { name: /choice/i })
    expect(tag).toHaveAttribute('aria-checked', 'false')
    expect(tag).toHaveAttribute('aria-disabled', 'true')
    expect(tag.className).toContain('ads-tag-checkable-disabled')
    expect(result.getByTestId('check-icon')).toBeInTheDocument()
    fireEvent.click(tag)
    expect(onChange).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('emits the next checked state from click and space key', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Tag.CheckableTag checked={false} onChange={onChange}>
        Choice
      </Tag.CheckableTag>
    ))
    const tag = result.getByRole('checkbox', { name: /choice/i })

    fireEvent.click(tag)
    fireEvent.keyDown(tag, { key: ' ' })
    expect(onChange).toHaveBeenNthCalledWith(1, true)
    expect(onChange).toHaveBeenNthCalledWith(2, true)
  })
})

describe('Tag.CheckableTagGroup', () => {
  it('supports uncontrolled single selection', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Tag.CheckableTagGroup
        defaultValue="a"
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
        onChange={onChange}
      />
    ))

    expect(result.getByRole('checkbox', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(result.getByRole('checkbox', { name: 'Beta' }))
    expect(onChange).toHaveBeenCalledWith('b')
    expect(result.getByRole('checkbox', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(result.getByRole('checkbox', { name: 'Beta' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('supports controlled multiple selection and semantic customization', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Tag.CheckableTagGroup
        multiple
        value={['a']}
        options={[
          { value: 'a', label: 'Alpha', className: 'option-alpha', style: { color: 'red' } },
          'b',
        ]}
        classNames={{ root: 'group-root', item: 'group-item' }}
        styles={{ root: { margin: '8px' }, item: { 'font-weight': 600 } }}
        onChange={onChange}
      />
    ))

    const root = result.getByRole('group')
    expect(root).toHaveClass('group-root')
    expect(root).toHaveStyle({ margin: '8px' })
    const alpha = result.getByRole('checkbox', { name: 'Alpha' })
    expect(alpha).toHaveClass('group-item')
    expect(alpha).toHaveClass('option-alpha')
    expect(alpha.style.color).toBe('red')
    expect(alpha).toHaveStyle('font-weight: 600')
    expect(alpha).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(result.getByRole('checkbox', { name: 'b' }))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    expect(result.getByRole('checkbox', { name: 'b' })).toHaveAttribute('aria-checked', 'false')
  })

  it('disables every item when group is disabled', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Tag.CheckableTagGroup multiple disabled options={['a', 'b']} onChange={onChange} />
    ))

    const tag = result.getByRole('checkbox', { name: 'a' })
    expect(tag).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(tag)
    expect(onChange).not.toHaveBeenCalled()
  })
})
