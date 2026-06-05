import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { TreeSelect } from '../index'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

const treeData = [
  {
    title: 'Asia',
    value: 'asia',
    children: [
      { title: 'China', value: 'china' },
      { title: 'Japan', value: 'japan', disabled: true },
    ],
  },
  { title: 'Europe', value: 'europe' },
]

describe('TreeSelect', () => {
  it('renders placeholder and opens tree dropdown', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <TreeSelect placeholder="Pick area" treeData={treeData} onOpenChange={onOpenChange} />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Pick area')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(combobox)

    expect(screen.getByRole('tree')).toBeTruthy()
    expect(screen.getByRole('treeitem', { name: /Asia/ })).toBeTruthy()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closes dropdown on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <TreeSelect treeData={treeData} onOpenChange={onOpenChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    expect(screen.getByRole('tree')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('tree')).toBeNull()
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('expands nested nodes and selects a child', () => {
    const onChange = vi.fn()
    const result = render(() => <TreeSelect treeData={treeData} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('button', { name: 'expand Asia' }))
    expect(screen.getByRole('button', { name: 'collapse Asia' }).querySelector('svg')).toBeTruthy()
    fireEvent.click(screen.getByRole('treeitem', { name: 'China' }))

    expect(combobox).toHaveTextContent('China')
    expect(screen.queryByRole('tree')).toBeNull()
    expect(onChange).toHaveBeenCalledWith('china', { title: 'China', value: 'china' })
  })

  it('supports defaultExpandedKeys', () => {
    render(() => <TreeSelect defaultOpen defaultExpandedKeys={['asia']} treeData={treeData} />)

    expect(screen.getByRole('treeitem', { name: 'China' })).toBeTruthy()
  })

  it('supports controlled value and controlled open', () => {
    const [value, setValue] = createSignal<string | number | boolean | undefined>('europe')
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => (
      <TreeSelect
        value={value()}
        open={open()}
        treeData={treeData}
        onChange={(next) => setValue(next)}
        onOpenChange={onOpenChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Europe')

    fireEvent.click(combobox)
    expect(onOpenChange).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByText('Asia'))
    expect(combobox).toHaveTextContent('Asia')
    expect(screen.queryByRole('tree')).toBeNull()
  })

  it('supports disabled nodes, clear, and keyboard handling', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <TreeSelect
        allowClear
        defaultExpandedKeys={['asia']}
        treeData={treeData}
        onChange={onChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    expect(screen.getByRole('treeitem', { name: 'Japan' })).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(screen.getByRole('treeitem', { name: 'Japan' }))
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.keyDown(combobox, { key: 'Enter' })
    expect(combobox).toHaveTextContent('Asia')

    fireEvent.click(result.getByRole('button', { name: 'clear tree select' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined, undefined)

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Escape' })
    expect(screen.queryByRole('tree')).toBeNull()
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <TreeSelect prefixCls="custom-tree" treeData={treeData} />)
    expect(withProp.container.querySelector('.custom-tree')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <TreeSelect treeData={treeData} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-tree-select')).toBeTruthy()
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="area">
          <TreeSelect treeData={treeData} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('treeitem', { name: 'Europe' }))

    expect(form.getFieldValue('area')).toBe('europe')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ area: 'europe' })
  })
})

it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <TreeSelect zIndex={1302} treeData={[{ value: 'one', title: 'One' }]} />
  ))
  const selector = result.container.querySelector('.ads-tree-select-selector') as HTMLElement
  const rectSpy = vi.spyOn(selector, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 42,
    left: 20,
    right: 220,
    width: 200,
    height: 32,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  fireEvent.click(selector)

  const dropdown = document.body.querySelector<HTMLElement>('.ads-tree-select-dropdown')!
  expect(dropdown).toBeTruthy()
  expect(result.container.querySelector('.ads-tree-select-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.top).toBe('46px')
  expect(dropdown.style.left).toBe('20px')
  expect(dropdown.style.width).toBe('200px')
  expect(dropdown.style.zIndex).toBe('1302')
  rectSpy.mockRestore()
})
