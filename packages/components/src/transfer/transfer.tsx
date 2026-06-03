import { For, createMemo, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { TransferDirection, TransferItem, TransferProps } from './interface'
import { useTransferStyle } from './transfer.style'

function includesKey(keys: string[], key: string): boolean {
  return keys.includes(key)
}

function textFromElement(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function defaultFilter(inputValue: string, item: TransferItem): boolean {
  const search = inputValue.toLowerCase()
  return (
    textFromElement(item.title).toLowerCase().includes(search) ||
    textFromElement(item.description).toLowerCase().includes(search)
  )
}

export function Transfer(props: TransferProps) {
  const [local, rest] = splitProps(props, [
    'dataSource',
    'targetKeys',
    'defaultTargetKeys',
    'selectedKeys',
    'defaultSelectedKeys',
    'disabled',
    'showSearch',
    'titles',
    'operations',
    'filterOption',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onSelectChange',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-transfer`
  const [, hashId] = useTransferStyle(prefixCls())
  const [innerTargetKeys, setInnerTargetKeys] = createSignal<string[]>(
    local.defaultTargetKeys ?? [],
  )
  const [innerSelectedKeys, setInnerSelectedKeys] = createSignal<string[]>(
    local.defaultSelectedKeys ?? [],
  )
  const [sourceSearch, setSourceSearch] = createSignal('')
  const [targetSearch, setTargetSearch] = createSignal('')

  const disabled = () => Boolean(local.disabled)
  const dataSource = () => local.dataSource ?? []
  const targetKeys = () => (local.targetKeys !== undefined ? local.targetKeys : innerTargetKeys())
  const selectedKeys = () =>
    local.selectedKeys !== undefined ? local.selectedKeys : innerSelectedKeys()
  const sourceItems = createMemo(() =>
    dataSource().filter((item) => !includesKey(targetKeys(), item.key)),
  )
  const targetItems = createMemo(() =>
    dataSource().filter((item) => includesKey(targetKeys(), item.key)),
  )
  const sourceSelectedKeys = () =>
    selectedKeys().filter((key) => sourceItems().some((item) => item.key === key))
  const targetSelectedKeys = () =>
    selectedKeys().filter((key) => targetItems().some((item) => item.key === key))

  function filterItems(items: TransferItem[], inputValue: string): TransferItem[] {
    if (!inputValue) return items
    const filter = local.filterOption ?? defaultFilter
    return items.filter((item) => filter(inputValue, item))
  }

  const filteredSourceItems = createMemo(() => filterItems(sourceItems(), sourceSearch()))
  const filteredTargetItems = createMemo(() => filterItems(targetItems(), targetSearch()))

  function setTargetKeys(
    nextTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[],
  ) {
    if (local.targetKeys === undefined) setInnerTargetKeys(nextTargetKeys)
    local.onChange?.(nextTargetKeys, direction, moveKeys)
  }

  function setSelectedKeys(nextSelectedKeys: string[]) {
    if (local.selectedKeys === undefined) setInnerSelectedKeys(nextSelectedKeys)
    const source = nextSelectedKeys.filter((key) => sourceItems().some((item) => item.key === key))
    const target = nextSelectedKeys.filter((key) => targetItems().some((item) => item.key === key))
    local.onSelectChange?.(source, target)
  }

  function toggleSelect(item: TransferItem): void {
    if (disabled() || item.disabled) return
    const current = selectedKeys()
    setSelectedKeys(
      includesKey(current, item.key)
        ? current.filter((key) => key !== item.key)
        : [...current, item.key],
    )
  }

  function move(direction: TransferDirection): void {
    if (disabled()) return
    const movingFromSource = direction === 'right'
    const availableItems = movingFromSource ? sourceItems() : targetItems()
    const moveKeys = (movingFromSource ? sourceSelectedKeys() : targetSelectedKeys()).filter(
      (key) => !availableItems.find((item) => item.key === key)?.disabled,
    )
    if (!moveKeys.length) return

    const nextTargetKeys = movingFromSource
      ? [...targetKeys(), ...moveKeys.filter((key) => !includesKey(targetKeys(), key))]
      : targetKeys().filter((key) => !includesKey(moveKeys, key))
    setTargetKeys(nextTargetKeys, direction, moveKeys)
    setSelectedKeys(selectedKeys().filter((key) => !includesKey(moveKeys, key)))
  }

  function renderPanel(direction: TransferDirection) {
    const isSource = direction === 'left'
    const items = () => (isSource ? filteredSourceItems() : filteredTargetItems())
    const title = () => local.titles?.[isSource ? 0 : 1] ?? (isSource ? 'Source' : 'Target')
    const search = () => (isSource ? sourceSearch() : targetSearch())
    const setSearch = (value: string) =>
      isSource ? setSourceSearch(value) : setTargetSearch(value)

    return (
      <div class={`${prefixCls()}-panel`} data-direction={direction}>
        <div class={`${prefixCls()}-header`}>{title()}</div>
        {local.showSearch && (
          <input
            class={`${prefixCls()}-search`}
            placeholder={`Search ${isSource ? 'source' : 'target'}`}
            disabled={disabled()}
            value={search()}
            onInput={(event) => setSearch(event.currentTarget.value)}
          />
        )}
        <ul
          role="listbox"
          class={`${prefixCls()}-list`}
          aria-label={isSource ? 'source' : 'target'}
        >
          <For each={items()}>
            {(item) => (
              <li
                role="option"
                data-direction={direction}
                aria-selected={includesKey(selectedKeys(), item.key)}
                aria-disabled={disabled() || Boolean(item.disabled)}
                class={classNames(
                  `${prefixCls()}-item`,
                  includesKey(selectedKeys(), item.key) && `${prefixCls()}-item-selected`,
                  (disabled() || item.disabled) && `${prefixCls()}-item-disabled`,
                )}
                onClick={() => toggleSelect(item)}
              >
                <span class={`${prefixCls()}-item-title`}>{item.title}</span>
                {item.description && (
                  <span class={`${prefixCls()}-item-description`}>{item.description}</span>
                )}
              </li>
            )}
          </For>
        </ul>
      </div>
    )
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      {renderPanel('left')}
      <div class={`${prefixCls()}-operations`}>
        <button
          type="button"
          aria-label="move selected right"
          class={`${prefixCls()}-operation`}
          disabled={disabled() || !sourceSelectedKeys().length}
          onClick={() => move('right')}
        >
          {local.operations?.[0] ?? '>'}
        </button>
        <button
          type="button"
          aria-label="move selected left"
          class={`${prefixCls()}-operation`}
          disabled={disabled() || !targetSelectedKeys().length}
          onClick={() => move('left')}
        >
          {local.operations?.[1] ?? '<'}
        </button>
      </div>
      {renderPanel('right')}
    </div>
  )
}
