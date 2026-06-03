import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { TreeSelect } from '../index'

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

    expect(result.getByRole('tree')).toBeTruthy()
    expect(result.getByRole('treeitem', { name: /Asia/ })).toBeTruthy()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('expands nested nodes and selects a child', () => {
    const onChange = vi.fn()
    const result = render(() => <TreeSelect treeData={treeData} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(result.getByRole('button', { name: 'expand Asia' }))
    fireEvent.click(result.getByRole('treeitem', { name: 'China' }))

    expect(combobox).toHaveTextContent('China')
    expect(result.queryByRole('tree')).toBeNull()
    expect(onChange).toHaveBeenCalledWith('china', { title: 'China', value: 'china' })
  })

  it('supports defaultExpandedKeys', () => {
    const result = render(() => (
      <TreeSelect defaultOpen defaultExpandedKeys={['asia']} treeData={treeData} />
    ))

    expect(result.getByRole('treeitem', { name: 'China' })).toBeTruthy()
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

    fireEvent.click(result.getByText('Asia'))
    expect(combobox).toHaveTextContent('Asia')
    expect(result.queryByRole('tree')).toBeNull()
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
    expect(result.getByRole('treeitem', { name: 'Japan' })).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(result.getByRole('treeitem', { name: 'Japan' }))
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.keyDown(combobox, { key: 'Enter' })
    expect(combobox).toHaveTextContent('Asia')

    fireEvent.click(result.getByRole('button', { name: 'clear tree select' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined, undefined)

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Escape' })
    expect(result.queryByRole('tree')).toBeNull()
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
    fireEvent.click(result.getByRole('treeitem', { name: 'Europe' }))

    expect(form.getFieldValue('area')).toBe('europe')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ area: 'europe' })
  })
})
