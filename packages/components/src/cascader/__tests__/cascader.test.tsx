import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Cascader } from '../index'
import type { CascaderOption } from '../interface'

const options: CascaderOption[] = [
  {
    label: 'Zhejiang',
    value: 'zhejiang',
    children: [
      {
        label: 'Hangzhou',
        value: 'hangzhou',
        children: [{ label: 'West Lake', value: 'west-lake' }],
      },
      { label: 'Ningbo', value: 'ningbo', disabled: true },
    ],
  },
  {
    label: 'Jiangsu',
    value: 'jiangsu',
    children: [{ label: 'Nanjing', value: 'nanjing' }],
  },
  {
    label: 'Disabled',
    value: 'disabled',
    disabled: true,
    children: [{ label: 'Hidden', value: 'hidden' }],
  },
]

describe('Cascader', () => {
  it('renders placeholder and opens option columns', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Cascader placeholder="Pick city" options={options} onOpenChange={onOpenChange} />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Pick city')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(result.queryByRole('menu')).toBeNull()

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(result.getByRole('menu')).toBeTruthy()
    expect(result.getByRole('menuitem', { name: 'Zhejiang' })).toBeTruthy()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('selects an uncontrolled leaf path and closes', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(result.getByRole('menuitem', { name: 'Zhejiang' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'Hangzhou' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'West Lake' }))

    expect(combobox).toHaveTextContent('Zhejiang / Hangzhou / West Lake')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).toHaveBeenCalledWith(
      ['zhejiang', 'hangzhou', 'west-lake'],
      [options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]],
    )
  })

  it('supports controlled value mode', () => {
    const [value, setValue] = createSignal(['zhejiang', 'hangzhou', 'west-lake'])
    const result = render(() => (
      <Cascader
        value={value()}
        options={options}
        onChange={(nextValue) => setValue(nextValue as string[])}
      />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Zhejiang / Hangzhou / West Lake')

    fireEvent.click(combobox)
    fireEvent.click(result.getByRole('menuitem', { name: 'Jiangsu' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'Nanjing' }))

    expect(combobox).toHaveTextContent('Jiangsu / Nanjing')
  })

  it('supports controlled open mode', () => {
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((nextOpen: boolean) => setOpen(nextOpen))
    const result = render(() => (
      <Cascader open={open()} options={options} onOpenChange={onOpenChange} />
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(result.getByRole('menu')).toBeTruthy()
  })

  it('commits intermediate nodes with changeOnSelect', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader changeOnSelect options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(result.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(combobox).toHaveTextContent('Zhejiang')
    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(onChange).toHaveBeenCalledWith(['zhejiang'], [options[0]])
  })

  it('does not select or expand disabled options', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(result.getByRole('menuitem', { name: 'Disabled' }))

    expect(result.queryByRole('menuitem', { name: 'Hidden' })).toBeNull()
    expect(combobox).not.toHaveTextContent('Disabled')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears value with allowClear', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Cascader
        allowClear
        defaultValue={['zhejiang', 'hangzhou', 'west-lake']}
        options={options}
        onChange={onChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Zhejiang / Hangzhou / West Lake')

    fireEvent.click(result.getByRole('button', { name: 'clear selection' }))

    expect(combobox).not.toHaveTextContent('Zhejiang / Hangzhou / West Lake')
    expect(onChange).toHaveBeenCalledWith([], [])
  })

  it('supports custom displayRender', () => {
    const result = render(() => (
      <Cascader
        defaultValue={['zhejiang', 'hangzhou', 'west-lake']}
        options={options}
        displayRender={(labels) => <strong>{labels[labels.length - 1]}</strong>}
      />
    ))

    expect(result.getByRole('combobox')).toHaveTextContent('West Lake')
    expect(result.container.querySelector('strong')).toHaveTextContent('West Lake')
  })

  it('expands on hover when expandTrigger is hover', () => {
    const result = render(() => <Cascader expandTrigger="hover" options={options} />)

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.pointerEnter(result.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(result.getByRole('menuitem', { name: 'Hangzhou' })).toBeTruthy()
  })

  it('does not commit changeOnSelect values during hover expansion', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Cascader changeOnSelect expandTrigger="hover" options={options} onChange={onChange} />
    ))

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.pointerEnter(result.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(result.getByRole('menuitem', { name: 'Hangzhou' })).toBeTruthy()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes with Escape', () => {
    const result = render(() => <Cascader options={options} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Escape' })

    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(result.queryByRole('menu')).toBeNull()
  })

  it('selects the first enabled option in the current column with Enter', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Cascader
        defaultOpen
        options={[
          { label: 'Disabled first', value: 'disabled-first', disabled: true },
          {
            label: 'Enabled parent',
            value: 'enabled-parent',
            children: [{ label: 'Enabled child', value: 'enabled-child' }],
          },
        ]}
        onChange={onChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(result.getByRole('menuitem', { name: 'Enabled child' })).toBeTruthy()
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(combobox).toHaveTextContent('Enabled parent / Enabled child')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).toHaveBeenCalledWith(
      ['enabled-parent', 'enabled-child'],
      [
        {
          label: 'Enabled parent',
          value: 'enabled-parent',
          children: [{ label: 'Enabled child', value: 'enabled-child' }],
        },
        { label: 'Enabled child', value: 'enabled-child' },
      ],
    )
  })

  it('supports custom prefix classes from props and ConfigProvider', () => {
    const withProp = render(() => <Cascader prefixCls="custom-cascader" options={options} />)
    expect(withProp.container.querySelector('.custom-cascader')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Cascader options={options} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-cascader')).toBeTruthy()
  })

  it('integrates with Form.Item value collection', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="area">
          <Cascader options={options} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(result.getByRole('menuitem', { name: 'Jiangsu' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'Nanjing' }))

    expect(form.getFieldValue('area')).toEqual(['jiangsu', 'nanjing'])

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ area: ['jiangsu', 'nanjing'] })
  })
})
