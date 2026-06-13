import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
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

  it('filters paths with showSearch and selects a search result', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader showSearch options={options} onChange={onChange} />)

    fireEvent.click(result.getByRole('combobox'))
    const input = screen.getByRole('textbox')
    fireEvent.input(input, { target: { value: 'west' } })

    expect(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' })).toBeTruthy()
    expect(screen.queryByRole('menuitem', { name: 'Jiangsu' })).toBeNull()

    fireEvent.click(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' }))

    expect(result.getByRole('combobox')).toHaveTextContent('Zhejiang / Hangzhou / West Lake')
    expect(onChange).toHaveBeenCalledWith(
      ['zhejiang', 'hangzhou', 'west-lake'],
      [options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]],
    )
  })

  it('supports custom showSearch filter sort limit and render', () => {
    const searchOptions: CascaderOption[] = [
      { label: 'Alpha', value: 'match-a' },
      { label: 'Zulu', value: 'match-z' },
    ]
    render(() => (
      <Cascader
        showSearch={{
          filter: (input, path) => path.some((option) => String(option.value).includes(input)),
          sort: (a, b) =>
            String(b[b.length - 1].label).localeCompare(String(a[a.length - 1].label)),
          limit: 1,
          render: (_input, path) => <span>Result: {path[path.length - 1].label}</span>,
        }}
        options={searchOptions}
      />
    ))

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'match' } })

    expect(screen.getByRole('option')).toHaveTextContent('Result: Zulu')
    expect(screen.queryByText('Result: Alpha')).toBeNull()
  })

  it('supports controlled searchValue and onSearch', () => {
    const [search, setSearch] = createSignal('west')
    const onSearch = vi.fn((next: string) => setSearch(next))
    render(() => (
      <Cascader showSearch searchValue={search()} onSearch={onSearch} options={options} />
    ))

    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('textbox')).toHaveValue('west')
    expect(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' })).toBeTruthy()

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'nan' } })

    expect(onSearch).toHaveBeenCalledWith('nan')
    expect(screen.getByRole('option', { name: 'Jiangsu / Nanjing' })).toBeTruthy()
  })

  it('calls loadData for non-leaf lazy options and shows loading icon while pending', async () => {
    let resolveLoad!: () => void
    const loadData = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve
        }),
    )
    const lazyOptions: CascaderOption[] = [{ label: 'Lazy', value: 'lazy', isLeaf: false }]

    render(() => (
      <Cascader options={lazyOptions} loadData={loadData} loadingIcon={<span>Loading...</span>} />
    ))

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('menuitem', { name: /Lazy/ }))

    expect(loadData).toHaveBeenCalledWith([lazyOptions[0]])
    expect(screen.getByText('Loading...')).toBeTruthy()

    resolveLoad()
    await Promise.resolve()
    await Promise.resolve()

    expect(screen.queryByText('Loading...')).toBeNull()
  })

  it('supports multiple leaf selection and deselection', () => {
    const onChange = vi.fn()
    render(() => <Cascader multiple options={options} onChange={onChange} />)

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Zhejiang' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hangzhou' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'West Lake' }))

    expect(onChange).toHaveBeenLastCalledWith(
      [['zhejiang', 'hangzhou', 'west-lake']],
      [[options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]]],
    )
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('menuitem', { name: 'West Lake' }))
    expect(onChange).toHaveBeenLastCalledWith([], [])
  })

  it('cascades parent selection to selectable leaf descendants and marks parent checked', () => {
    const onChange = vi.fn()
    render(() => <Cascader multiple options={options} onChange={onChange} />)

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(onChange).toHaveBeenLastCalledWith(
      [['zhejiang', 'hangzhou', 'west-lake']],
      [[options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]]],
    )
    expect(screen.getByRole('menuitem', { name: 'Zhejiang' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('marks parent indeterminate when only some descendants are selected', () => {
    const branchOptions: CascaderOption[] = [
      {
        label: 'Parent',
        value: 'parent',
        children: [
          { label: 'Child A', value: 'a' },
          { label: 'Child B', value: 'b' },
        ],
      },
    ]
    render(() => <Cascader multiple value={[['parent', 'a']]} options={branchOptions} />)

    fireEvent.click(screen.getByRole('combobox'))

    expect(screen.getByRole('menuitem', { name: 'Parent' })).toHaveAttribute(
      'data-indeterminate',
      'true',
    )
  })

  it('renders multiple tags with tagRender and removeIcon', () => {
    const onChange = vi.fn()
    render(() => (
      <Cascader
        multiple
        value={[
          ['zhejiang', 'hangzhou', 'west-lake'],
          ['jiangsu', 'nanjing'],
        ]}
        options={options}
        onChange={onChange}
        showCheckedStrategy={Cascader.SHOW_CHILD}
        removeIcon={<span>remove</span>}
        tagRender={(label, onClose) => (
          <button type="button" onClick={onClose}>
            Custom {label}
          </button>
        )}
      />
    ))

    expect(
      screen.getByRole('button', { name: 'Custom Zhejiang / Hangzhou / West Lake' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Custom Zhejiang / Hangzhou / West Lake' }))

    expect(onChange).toHaveBeenCalledWith(
      [['jiangsu', 'nanjing']],
      [[options[1], options[1].children?.[0]]],
    )
  })

  it('supports maxTagCount maxTagPlaceholder and maxTagTextLength', () => {
    render(() => (
      <Cascader
        multiple
        value={[
          ['zhejiang', 'hangzhou', 'west-lake'],
          ['jiangsu', 'nanjing'],
        ]}
        options={options}
        showCheckedStrategy={Cascader.SHOW_CHILD}
        maxTagCount={1}
        maxTagTextLength={8}
        maxTagPlaceholder={(omitted) => <span>+{omitted.length} more</span>}
      />
    ))

    expect(screen.getByText('Zhejiang…')).toBeTruthy()
    expect(screen.getByText('+1 more')).toBeTruthy()
    expect(screen.queryByText('Jiangsu / Nanjing')).toBeNull()
  })

  it('uses showCheckedStrategy to display parent or child tags', () => {
    const branchOptions: CascaderOption[] = [
      {
        label: 'Parent',
        value: 'parent',
        children: [
          { label: 'Child A', value: 'a' },
          { label: 'Child B', value: 'b' },
        ],
      },
    ]
    const value = [
      ['parent', 'a'],
      ['parent', 'b'],
    ]
    const parent = render(() => (
      <Cascader
        multiple
        value={value}
        options={branchOptions}
        showCheckedStrategy={Cascader.SHOW_PARENT}
      />
    ))
    expect(parent.getByText('Parent')).toBeTruthy()
    cleanup()

    const child = render(() => (
      <Cascader
        multiple
        value={value}
        options={branchOptions}
        showCheckedStrategy={Cascader.SHOW_CHILD}
      />
    ))
    expect(child.getByText('Parent / Child A')).toBeTruthy()
    expect(child.getByText('Parent / Child B')).toBeTruthy()
  })

  it('clears multiple search after selection by default and preserves it when disabled', () => {
    const keep = render(() => (
      <Cascader multiple showSearch={{ autoClearSearchValue: false }} options={options} />
    ))

    fireEvent.click(keep.getByRole('combobox'))
    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'west' } })
    fireEvent.click(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' }))
    expect(screen.getByRole('textbox')).toHaveValue('west')
    cleanup()

    const clear = render(() => <Cascader multiple showSearch options={options} />)
    fireEvent.click(clear.getByRole('combobox'))
    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'west' } })
    fireEvent.click(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' }))
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('supports multiple changeOnSelect for intermediate paths', () => {
    const onChange = vi.fn()
    render(() => <Cascader multiple changeOnSelect options={options} onChange={onChange} />)

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(onChange).toHaveBeenLastCalledWith([['zhejiang']], [[options[0]]])
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
    const onChange = vi.fn(
      (nextValue: Array<string | number | boolean> | Array<Array<string | number | boolean>>) =>
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

  it('supports size status variant and prefix visual props', () => {
    const result = render(() => (
      <Cascader
        size="large"
        status="error"
        variant="filled"
        prefix={<span data-testid="prefix">Area</span>}
        options={options}
      />
    ))

    const root = result.container.querySelector('.ads-cascader')!
    expect(root).toHaveClass('ads-cascader-large')
    expect(root).toHaveClass('ads-cascader-status-error')
    expect(root).toHaveClass('ads-cascader-filled')
    expect(result.getByTestId('prefix')).toBeTruthy()
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

  it('allows clearing by default and calls onClear separately from onChange', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    render(() => (
      <Cascader
        defaultValue={['zhejiang', 'hangzhou', 'west-lake']}
        options={options}
        onChange={onChange}
        onClear={onClear}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'clear selection' }))

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([], [])
  })

  it('overlays clear icon on suffix and shows it when hovering the root', () => {
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <Cascader defaultValue={['zhejiang', 'hangzhou', 'west-lake']} options={options} />
      </StyleProvider>
    ))

    const selector = result.container.querySelector<HTMLElement>('.ads-cascader-selector')
    const suffix = result.container.querySelector<HTMLElement>('.ads-cascader-suffix')
    const clear = result.container.querySelector<HTMLElement>('.ads-cascader-clear')
    const css = extractStyle(cache)

    expect(selector).toContainElement(suffix)
    expect(selector).toContainElement(clear)
    expect(css).toContain('.ads-cascader-clear{')
    expect(css).toContain('position:absolute;')
    expect(css).toContain('inset-inline-end:12px;')
    expect(css).toContain('opacity:0;')
    expect(css).toContain('pointer-events:none;')
    expect(css).toContain(
      '.ads-cascader:not(.ads-cascader-disabled):hover .ads-cascader-clear{opacity:1;pointer-events:auto;',
    )
  })

  it('supports custom fieldNames and optionRender without React className props', () => {
    const customOptions = [
      {
        name: 'Asia',
        id: 'asia',
        nodes: [{ name: 'China', id: 'china' }],
      },
    ]
    const onChange = vi.fn()
    render(() => (
      <Cascader
        fieldNames={{ label: 'name', value: 'id', children: 'nodes' }}
        options={customOptions}
        optionRender={(option) => <span>Custom {option.label}</span>}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('combobox'))

    expect(screen.getByRole('menuitem', { name: 'Custom Asia' })).toBeTruthy()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom Asia' }))
    expect(screen.getByRole('menuitem', { name: 'Custom China' })).toBeTruthy()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom China' }))

    expect(onChange).toHaveBeenCalledWith(
      ['asia', 'china'],
      [
        expect.objectContaining({ label: 'Asia', value: 'asia' }),
        expect.objectContaining({ label: 'China', value: 'china' }),
      ],
    )
  })

  it('wraps popup content, renders empty content, semantic classes/styles, and custom icons', () => {
    render(() => (
      <Cascader
        open
        showSearch={{ searchIcon: <span data-testid="search-icon">search</span> }}
        searchValue="missing"
        options={options}
        notFoundContent={<span>No matches</span>}
        popupRender={(origin) => <section data-testid="popup-wrapper">{origin}</section>}
        classNames={{
          root: 'root-slot',
          selector: 'selector-slot',
          popup: 'popup-slot',
          empty: 'empty-slot',
          suffix: 'suffix-slot',
          searchIcon: 'search-slot',
        }}
        styles={{
          root: { width: '244px' },
          selector: { height: '44px' },
          popup: { width: '333px' },
          empty: { color: 'red' },
        }}
        suffixIcon={<span data-testid="suffix-icon">suffix</span>}
      />
    ))

    const root = document.querySelector<HTMLElement>('.ads-cascader')!
    const selector = screen.getByRole('combobox') as HTMLElement
    const popup = document.body.querySelector<HTMLElement>('.ads-cascader-dropdown')!
    const empty = screen.getByText('No matches').closest('.ads-cascader-empty') as HTMLElement

    expect(screen.getByTestId('popup-wrapper')).toBeTruthy()
    expect(root).toHaveClass('root-slot')
    expect(selector).toHaveClass('selector-slot')
    expect(popup).toHaveClass('popup-slot')
    expect(empty).toHaveClass('empty-slot')
    expect(root.style.width).toBe('244px')
    expect(selector.style.height).toBe('44px')
    expect(popup.style.width).toBe('333px')
    expect(empty.style.color).toBe('red')
    expect(screen.getByTestId('suffix-icon')).toBeTruthy()
    expect(screen.getByTestId('search-icon')).toBeTruthy()
  })

  it('positions popup for topRight placement', () => {
    const result = render(() => <Cascader placement="topRight" options={options} />)
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
    expect(dropdown.style.top).toBe('6px')
    expect(dropdown.style.left).toBe('20px')
    expect(dropdown).toHaveClass('ads-cascader-dropdown-top-right')
    rectSpy.mockRestore()
  })

  it('exposes focus and blur methods through ref', () => {
    const ref: {
      current?: { focus: () => void; blur: () => void; nativeElement?: HTMLDivElement }
    } = {}
    const result = render(() => <Cascader ref={ref} options={options} />)
    const combobox = result.getByRole('combobox')

    ref.current?.focus()
    expect(document.activeElement).toBe(combobox)
    expect(ref.current?.nativeElement).toBe(result.container.querySelector('.ads-cascader'))

    ref.current?.blur()
    expect(document.activeElement).not.toBe(combobox)
  })

  it('uses SHOW_PARENT display strategy by default in multiple mode', () => {
    const branchOptions: CascaderOption[] = [
      {
        label: 'Parent',
        value: 'parent',
        children: [
          { label: 'Child A', value: 'a' },
          { label: 'Child B', value: 'b' },
        ],
      },
    ]
    render(() => (
      <Cascader
        multiple
        value={[
          ['parent', 'a'],
          ['parent', 'b'],
        ]}
        options={branchOptions}
      />
    ))

    expect(screen.getByText('Parent')).toBeTruthy()
    expect(screen.queryByText('Parent / Child A')).toBeNull()
  })

  it('renders Cascader.Panel and reports selections without selector chrome', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader.Panel options={options} onChange={onChange} />)
    const panel = result.container.querySelector('.ads-cascader-panel')!

    expect(result.queryByRole('combobox')).toBeNull()
    expect(result.container.querySelectorAll('.ads-cascader-dropdown')).toHaveLength(1)
    expect(panel).toHaveClass('ads-cascader-dropdown')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Jiangsu' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Nanjing' }))

    expect(onChange).toHaveBeenCalledWith(
      ['jiangsu', 'nanjing'],
      [options[1], options[1].children?.[0]],
    )
  })
})
