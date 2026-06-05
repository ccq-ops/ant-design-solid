import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Cascader } from '../index'
import type { CascaderOption } from '../interface'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

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
    expect(screen.queryByRole('menu')).toBeNull()

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: 'Zhejiang' })).toBeTruthy()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closes dropdown on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <Cascader options={options} onOpenChange={onOpenChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    expect(screen.getByRole('menu')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('menu')).toBeNull()
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('selects an uncontrolled leaf path and closes', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Zhejiang' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hangzhou' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'West Lake' }))

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
    fireEvent.click(screen.getByRole('menuitem', { name: 'Jiangsu' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Nanjing' }))

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
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('renders controlled open selected path columns and active branch on initial render', () => {
    render(() => <Cascader open value={['zhejiang', 'hangzhou', 'west-lake']} options={options} />)

    expect(screen.getByRole('menuitem', { name: 'Hangzhou' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('menuitem', { name: 'West Lake' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('menuitem', { name: 'Hangzhou' })).toHaveClass(
      'ads-cascader-menu-item-active',
    )
    expect(screen.getByRole('menuitem', { name: 'West Lake' })).toHaveClass(
      'ads-cascader-menu-item-active',
    )
  })

  it('syncs expanded columns when controlled value changes while open', () => {
    const [value, setValue] = createSignal(['zhejiang', 'hangzhou', 'west-lake'])
    const onChange = vi.fn((nextValue: Array<string | number | boolean>) =>
      setValue(nextValue as string[]),
    )
    const result = render(() => (
      <Cascader open value={value()} options={options} onChange={onChange} />
    ))
    const combobox = result.getByRole('combobox')

    expect(screen.getByRole('menuitem', { name: 'West Lake' })).toBeTruthy()

    setValue(['jiangsu', 'nanjing'])

    expect(screen.getByRole('menuitem', { name: 'Nanjing' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.queryByRole('menuitem', { name: 'West Lake' })).toBeNull()

    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(
      ['jiangsu', 'nanjing'],
      [options[1], options[1].children?.[0]],
    )
  })

  it('commits intermediate nodes with changeOnSelect', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader changeOnSelect options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(combobox).toHaveTextContent('Zhejiang')
    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(onChange).toHaveBeenCalledWith(['zhejiang'], [options[0]])
  })

  it('does not select or expand disabled options', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Disabled' }))

    expect(screen.queryByRole('menuitem', { name: 'Hidden' })).toBeNull()
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
    fireEvent.pointerEnter(screen.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(screen.getByRole('menuitem', { name: 'Hangzhou' })).toBeTruthy()
  })

  it('does not commit changeOnSelect values during hover expansion', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Cascader changeOnSelect expandTrigger="hover" options={options} onChange={onChange} />
    ))

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.pointerEnter(screen.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(screen.getByRole('menuitem', { name: 'Hangzhou' })).toBeTruthy()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes with Escape', () => {
    const result = render(() => <Cascader options={options} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Escape' })

    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).toBeNull()
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

    expect(screen.getByRole('menuitem', { name: 'Enabled child' })).toBeTruthy()
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
    fireEvent.click(screen.getByRole('menuitem', { name: 'Jiangsu' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Nanjing' }))

    expect(form.getFieldValue('area')).toEqual(['jiangsu', 'nanjing'])

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ area: ['jiangsu', 'nanjing'] })
  })

  it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
    const result = render(() => <Cascader zIndex={1312} options={options} />)
    const selector = result.container.querySelector('.ads-cascader-selector') as HTMLElement
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

    const dropdown = document.body.querySelector<HTMLElement>('.ads-cascader-dropdown')!
    expect(dropdown).toBeTruthy()
    expect(result.container.querySelector('.ads-cascader-dropdown')).toBeFalsy()
    expect(dropdown.style.position).toBe('fixed')
    expect(dropdown.style.top).toBe('46px')
    expect(dropdown.style.left).toBe('20px')
    expect(dropdown.style.zIndex).toBe('1312')
    rectSpy.mockRestore()
  })
})
