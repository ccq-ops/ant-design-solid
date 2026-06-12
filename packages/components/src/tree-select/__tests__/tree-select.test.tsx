import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { TreeSelect } from '../index'
import {
  buildTreeEntities,
  findEntityByValue,
  getEntityLabel,
  normalizeTreeData,
} from '../tree-data-utils'
import {
  displayEntitiesByStrategy,
  outputTreeSelectValue,
  truncateTreeSelectLabel,
  valueEntities,
} from '../value-utils'
import { filterTreeDataBySearch, normalizeTreeSelectSearch } from '../search-utils'

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

describe('tree-select tree data utils', () => {
  it('normalizes custom field names and looks up labels through treeNodeLabelProp', () => {
    const source = [
      {
        name: 'Asia',
        id: 'asia',
        nodes: [{ name: 'China', id: 'china', display: 'China label' }],
      },
    ]
    const normalized = normalizeTreeData(source, {
      fieldNames: { label: 'name', value: 'id', children: 'nodes' },
    })
    const entities = buildTreeEntities(normalized)
    const entity = findEntityByValue(entities, 'china')

    expect(normalized[0].title).toBe('Asia')
    expect(normalized[0].value).toBe('asia')
    expect(normalized[0].children?.[0].title).toBe('China')
    expect(entity?.parent?.value).toBe('asia')
    expect(getEntityLabel(entity, 'display')).toBe('China label')
  })

  it('converts simple mode tree data into nested nodes', () => {
    const normalized = normalizeTreeData(
      [
        { id: 1, pId: 0, value: 'root', title: 'Root' },
        { id: 2, pId: 1, value: 'child', title: 'Child' },
        { id: 3, pId: 2, value: 'leaf', title: 'Leaf' },
      ],
      { treeDataSimpleMode: true },
    )

    expect(normalized).toHaveLength(1)
    expect(normalized[0].value).toBe('root')
    expect(normalized[0].children?.[0].value).toBe('child')
    expect(normalized[0].children?.[0].children?.[0].value).toBe('leaf')
  })
})

describe('tree-select value utils', () => {
  const normalized = normalizeTreeData([
    {
      title: 'Parent',
      value: 'parent',
      children: [
        { title: 'Child A', value: 'a' },
        { title: 'Child B', value: 'b' },
      ],
    },
  ])
  const entities = buildTreeEntities(normalized)

  it('finds entities from raw and labeled values', () => {
    expect(valueEntities(entities, 'a').map((entity) => entity.value)).toEqual(['a'])
    expect(
      valueEntities(entities, [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ]).map((entity) => entity.value),
    ).toEqual(['a', 'b'])
  })

  it('outputs raw and labeled values for single and multiple modes', () => {
    const selected = valueEntities(entities, ['a', 'b'])

    expect(outputTreeSelectValue(selected.slice(0, 1), { multiple: false })).toBe('a')
    expect(outputTreeSelectValue(selected, { multiple: true })).toEqual(['a', 'b'])
    expect(
      outputTreeSelectValue(selected.slice(0, 1), { labelInValue: true, multiple: false }),
    ).toEqual({
      label: 'Child A',
      value: 'a',
    })
    expect(outputTreeSelectValue(selected, { labelInValue: true, multiple: true })).toEqual([
      { label: 'Child A', value: 'a' },
      { label: 'Child B', value: 'b' },
    ])
  })

  it('filters displayed checked nodes by strategy', () => {
    const checked = valueEntities(entities, ['parent', 'a', 'b'])

    expect(displayEntitiesByStrategy(checked, 'SHOW_ALL').map((entity) => entity.value)).toEqual([
      'parent',
      'a',
      'b',
    ])
    expect(displayEntitiesByStrategy(checked, 'SHOW_PARENT').map((entity) => entity.value)).toEqual(
      ['parent'],
    )
    expect(displayEntitiesByStrategy(checked, 'SHOW_CHILD').map((entity) => entity.value)).toEqual([
      'a',
      'b',
    ])
  })

  it('truncates plain text labels', () => {
    expect(truncateTreeSelectLabel('abcdef', 3)).toBe('abc...')
    expect(truncateTreeSelectLabel(<span>abcdef</span>, 3)).toEqual(<span>abcdef</span>)
  })
})

describe('tree-select search utils', () => {
  const normalized = normalizeTreeData([
    {
      title: 'Asia',
      value: 'asia',
      children: [
        { title: 'China', value: 'china', code: 'CN' },
        { title: 'Japan', value: 'japan', code: 'JP' },
      ],
    },
    { title: 'Europe', value: 'europe', code: 'EU' },
  ])

  it('normalizes showSearch object with deprecated top-level search props', () => {
    const onSearch = vi.fn()
    const config = normalizeTreeSelectSearch({
      showSearch: { autoClearSearchValue: false, treeNodeFilterProp: 'code' },
      searchValue: 'c',
      onSearch,
    })

    expect(config.enabled).toBe(true)
    expect(config.autoClearSearchValue).toBe(false)
    expect(config.searchValue).toBe('c')
    expect(config.treeNodeFilterProp).toBe('code')
    config.onSearch?.('next')
    expect(onSearch).toHaveBeenCalledWith('next')
  })

  it('filters tree data and keeps ancestors of matched nodes', () => {
    const filtered = filterTreeDataBySearch(normalized, 'CN', {
      enabled: true,
      treeNodeFilterProp: 'code',
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].value).toBe('asia')
    expect(filtered[0].children?.map((node) => node.value)).toEqual(['china'])
  })

  it('uses custom filterTreeNode when provided', () => {
    const filtered = filterTreeDataBySearch(normalized, 'ignored', {
      enabled: true,
      filterTreeNode: (_input, node) => node.value === 'japan',
    })

    expect(filtered[0].children?.map((node) => node.value)).toEqual(['japan'])
  })
})

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
    expect(result.container.querySelectorAll('.ads-tree-select-selection-item')).toHaveLength(1)
    expect(screen.queryByRole('tree')).toBeNull()
    expect(onChange).toHaveBeenCalledWith(
      'china',
      'China',
      expect.objectContaining({
        selected: true,
        triggerValue: 'china',
        triggerNode: expect.objectContaining({ value: 'china' }),
      }),
    )
  })

  it('enables clear by default after selecting a value', () => {
    const onChange = vi.fn()
    const result = render(() => <TreeSelect treeData={treeData} onChange={onChange} />)

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(screen.getByRole('treeitem', { name: 'Europe' }))
    fireEvent.click(result.getByRole('button', { name: 'clear tree select' }))

    expect(onChange).toHaveBeenLastCalledWith(undefined, undefined, {})
    expect(result.getByRole('combobox')).not.toHaveTextContent('Europe')
  })

  it('overlaps clear and arrow icons in the suffix slot only when clearable', () => {
    const clearable = render(() => <TreeSelect defaultValue="europe" treeData={treeData} />)
    const root = clearable.container.querySelector<HTMLElement>('.ads-tree-select')!
    const suffix = clearable.container.querySelector<HTMLElement>('.ads-tree-select-suffix')!
    const clear = clearable.getByRole('button', { name: 'clear tree select' })
    const arrow = clearable.container.querySelector<HTMLElement>('.ads-tree-select-arrow')!

    expect(root).toHaveClass('ads-tree-select-has-clear')
    expect(suffix).toContainElement(clear)
    expect(suffix).toContainElement(arrow)

    cleanup()

    const nonClearable = render(() => (
      <TreeSelect allowClear={false} defaultValue="europe" treeData={treeData} />
    ))

    expect(nonClearable.container.querySelector('.ads-tree-select-has-clear')).toBeNull()
    expect(nonClearable.queryByRole('button', { name: 'clear tree select' })).toBeNull()
    expect(nonClearable.container.querySelector('.ads-tree-select-arrow')).toBeTruthy()
  })

  it('supports labelInValue and onSelect extra for single selection', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => (
      <TreeSelect
        labelInValue
        defaultExpandedKeys={['asia']}
        treeData={treeData}
        onChange={onChange}
        onSelect={onSelect}
      />
    ))

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(screen.getByRole('treeitem', { name: 'China' }))

    expect(onChange).toHaveBeenCalledWith(
      { label: 'China', value: 'china' },
      'China',
      expect.objectContaining({ triggerValue: 'china' }),
    )
    expect(onSelect).toHaveBeenCalledWith(
      { label: 'China', value: 'china' },
      expect.objectContaining({ value: 'china' }),
      { selected: true },
    )
  })

  it('ignores selectable false nodes and exposes focus and blur ref methods', () => {
    const onChange = vi.fn()
    const ref: { current?: { focus: () => void; blur: () => void } } = {}
    const result = render(() => (
      <TreeSelect
        ref={ref}
        defaultExpandedKeys={['asia']}
        treeData={[
          {
            title: 'Asia',
            value: 'asia',
            selectable: false,
            children: [{ title: 'China', value: 'china' }],
          },
        ]}
        onChange={onChange}
      />
    ))

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(screen.getByRole('treeitem', { name: 'Asia' }))

    expect(onChange).not.toHaveBeenCalled()
    ref.current?.focus()
    expect(document.activeElement).toBe(result.getByRole('combobox'))
    ref.current?.blur()
    expect(document.activeElement).not.toBe(result.getByRole('combobox'))
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
        onChange={(next) => setValue(next as string | number | boolean | undefined)}
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

  it('supports multiple selection tags and tag removal', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <TreeSelect multiple defaultExpandedKeys={['asia']} treeData={treeData} onChange={onChange} />
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('treeitem', { name: 'China' }))
    fireEvent.click(screen.getByRole('treeitem', { name: 'Europe' }))

    expect(screen.getByRole('tree')).toBeTruthy()
    expect(combobox).toHaveTextContent('China')
    expect(combobox).toHaveTextContent('Europe')
    expect(onChange).toHaveBeenLastCalledWith(
      ['china', 'europe'],
      ['China', 'Europe'],
      expect.objectContaining({ triggerValue: 'europe' }),
    )

    const removeButton = result.getByRole('button', { name: 'remove China' })
    expect(removeButton).toHaveClass('ads-tree-select-tag-close')
    fireEvent.click(removeButton)
    expect(onChange).toHaveBeenLastCalledWith(
      ['europe'],
      ['Europe'],
      expect.objectContaining({ triggerValue: 'china' }),
    )
  })

  it('supports treeCheckable with checked strategy and treeCheckStrictly labelInValue', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <TreeSelect
        treeCheckable
        treeCheckStrictly
        showCheckedStrategy="SHOW_ALL"
        defaultExpandedKeys={['asia']}
        treeData={treeData}
        onChange={onChange}
      />
    ))

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(screen.getByRole('checkbox', { name: 'check China' }))

    expect(onChange).toHaveBeenCalledWith(
      [{ label: 'China', value: 'china' }],
      ['China'],
      expect.objectContaining({
        checked: true,
        checkedNodes: [expect.objectContaining({ value: 'china' })],
        triggerValue: 'china',
      }),
    )
    expect(result.getByRole('combobox')).toHaveTextContent('China')
  })

  it('supports searchable tree data and controlled search callbacks', () => {
    const onSearch = vi.fn()
    const result = render(() => (
      <TreeSelect
        showSearch
        defaultOpen
        treeData={treeData}
        treeNodeFilterProp="title"
        onSearch={onSearch}
        notFoundContent="No matches"
      />
    ))

    const input = result.getByRole('textbox')
    fireEvent.input(input, { target: { value: 'eur' } })

    expect(onSearch).toHaveBeenCalledWith('eur')
    expect(screen.getByRole('treeitem', { name: 'Europe' })).toBeTruthy()
    expect(screen.queryByRole('treeitem', { name: 'Asia' })).toBeNull()

    fireEvent.input(input, { target: { value: 'missing' } })
    expect(screen.getByText('No matches')).toBeTruthy()
  })

  it('passes loadData, loaded keys, and expansion callbacks to Tree', async () => {
    const loadData = vi.fn()
    const onTreeExpand = vi.fn()
    render(() => (
      <TreeSelect
        defaultOpen
        treeData={[{ title: 'Async', value: 'async', isLeaf: false }]}
        loadData={loadData}
        treeLoadedKeys={[]}
        onTreeExpand={onTreeExpand}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'expand Async' }))

    expect(onTreeExpand).toHaveBeenCalledWith(['async'])
    expect(loadData).toHaveBeenCalledWith(expect.objectContaining({ value: 'async' }))
  })

  it('supports popup, appearance, semantic slots, and deprecated aliases', () => {
    const popupRender = vi.fn((origin: JSX.Element) => (
      <div data-testid="popup-wrapper">{origin}</div>
    ))
    const onPopupScroll = vi.fn()
    const result = render(() => (
      <TreeSelect
        defaultOpen
        allowClear={{ clearIcon: <span>clear</span> }}
        defaultValue="europe"
        popupRender={popupRender}
        popupMatchSelectWidth={320}
        placement="bottomRight"
        popupClassName="legacy-popup"
        dropdownStyle={{ color: 'red' }}
        classNames={{ root: 'root-slot', 'popup.root': 'popup-slot' }}
        styles={{ root: { width: '240px' }, 'popup.root': { background: 'yellow' } }}
        prefix={<span>prefix</span>}
        suffixIcon={<span>suffix</span>}
        switcherIcon={<span>switch</span>}
        treeIcon
        treeLine
        treeTitleRender={(node) => <strong>{node.title}</strong>}
        size="large"
        status="error"
        variant="filled"
        onPopupScroll={onPopupScroll}
        treeData={treeData}
      />
    ))

    expect(result.container.querySelector('.root-slot')).toBeTruthy()
    expect(result.container.querySelector('.ads-tree-select-large')).toBeTruthy()
    expect(result.container.querySelector('.ads-tree-select-status-error')).toBeTruthy()
    expect(result.container.querySelector('.ads-tree-select-filled')).toBeTruthy()
    expect(result.getByText('prefix')).toBeTruthy()
    expect(result.getByText('suffix')).toBeTruthy()
    expect(result.getByRole('button', { name: 'clear tree select' })).toHaveTextContent('clear')
    expect(screen.getByTestId('popup-wrapper')).toBeTruthy()
    const dropdown = document.body.querySelector<HTMLElement>('.ads-tree-select-dropdown')!
    expect(dropdown.className).toContain('legacy-popup')
    expect(dropdown.className).toContain('popup-slot')
    expect(dropdown.style.width).toBe('320px')
    expect(dropdown.style.color).toBe('red')
    expect(dropdown.style.background).toBe('yellow')

    fireEvent.scroll(dropdown)
    expect(onPopupScroll).toHaveBeenCalled()
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
    expect(onChange).toHaveBeenLastCalledWith(undefined, undefined, {})

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
