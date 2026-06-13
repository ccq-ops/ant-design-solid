import { CloseCircleFilled, CloseOutlined, DownOutlined } from '@ant-design-solid/icons'
import {
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  For,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { callRef } from '../radio/context'
import { classNames } from '../shared/class-names'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import { Tree } from '../tree'
import type { TreeDataNode, TreeKey } from '../tree/interface'
import type {
  NormalizedTreeSelectNode,
  TreeSelectLabeledValue,
  TreeSelectProps,
  TreeSelectRawValue,
  TreeSelectRef,
  TreeSelectTreeEntity,
  TreeSelectValue,
} from './interface'
import { filterTreeDataBySearch, normalizeTreeSelectSearch } from './search-utils'
import {
  buildTreeEntities,
  collectTreeSelectChildren,
  findEntityByKey,
  normalizeTreeData,
} from './tree-data-utils'
import {
  displayEntitiesByStrategy,
  outputTreeSelectValue,
  treeSelectLabels,
  truncateTreeSelectLabel,
  valueEntities,
} from './value-utils'
import { useTreeSelectStyle } from './tree-select.style'

function clearIcon(allowClear: TreeSelectProps['allowClear']): JSX.Element {
  if (typeof allowClear === 'object' && allowClear.clearIcon) return allowClear.clearIcon
  return <CloseCircleFilled />
}

function firstValue(value: TreeSelectValue): TreeSelectRawValue | undefined {
  if (value === undefined) return undefined
  if (Array.isArray(value)) {
    const first = value[0]
    if (first && typeof first === 'object' && 'value' in first) return first.value
    return first as TreeSelectRawValue | undefined
  }
  if (typeof value === 'object' && 'value' in value) return value.value
  return value
}

function entityToPublicNode(entity: TreeSelectTreeEntity | undefined) {
  return entity?.node
}

function entityToSelectValue(entity: TreeSelectTreeEntity, labelInValue?: boolean) {
  if (!labelInValue) return entity.value
  return outputTreeSelectValue([entity], { labelInValue: true, multiple: false }) as
    | TreeSelectRawValue
    | TreeSelectLabeledValue
}

function treeDataForTree(entities: TreeSelectTreeEntity[]): TreeDataNode[] {
  const rootEntities = entities.filter((entity) => !entity.parent)
  const convert = (entity: TreeSelectTreeEntity): TreeDataNode => ({
    ...entity.node,
    children: entity.children.map(convert),
    key: entity.key,
    title: entity.node.title,
  })
  return rootEntities.map(convert)
}

export function TreeSelect(props: TreeSelectProps) {
  const [local, rest] = splitProps(props, [
    'ref',
    'children',
    'treeData',
    'fieldNames',
    'treeDataSimpleMode',
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'placeholder',
    'disabled',
    'allowClear',
    'multiple',
    'treeCheckable',
    'treeCheckStrictly',
    'showCheckedStrategy',
    'maxCount',
    'maxTagCount',
    'maxTagPlaceholder',
    'maxTagTextLength',
    'tagRender',
    'defaultExpandedKeys',
    'treeDefaultExpandedKeys',
    'treeDefaultExpandAll',
    'treeExpandedKeys',
    'treeExpandAction',
    'onTreeExpand',
    'treeNodeLabelProp',
    'labelInValue',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onOpenChange',
    'onDropdownVisibleChange',
    'onSelect',
    'onKeyDown',
    'zIndex',
    'getPopupContainer',
    'showSearch',
    'searchValue',
    'onSearch',
    'filterTreeNode',
    'treeNodeFilterProp',
    'autoClearSearchValue',
    'notFoundContent',
    'listHeight',
    'virtual',
    'loadData',
    'treeLoadedKeys',
    'popupRender',
    'dropdownRender',
    'popupMatchSelectWidth',
    'dropdownMatchSelectWidth',
    'placement',
    'popupClassName',
    'dropdownClassName',
    'dropdownStyle',
    'classNames',
    'styles',
    'prefix',
    'suffixIcon',
    'showArrow',
    'switcherIcon',
    'treeIcon',
    'treeLine',
    'treeTitleRender',
    'size',
    'status',
    'variant',
    'bordered',
    'onPopupScroll',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-tree-select`
  const treePrefixCls = () => `${prefixCls()}-tree`
  const [, hashId] = useTreeSelectStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerValue, setInnerValue] = createSignal<TreeSelectValue>(local.defaultValue)
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [innerExpandedKeys, setInnerExpandedKeys] = createSignal<TreeSelectRawValue[]>(
    local.treeDefaultExpandedKeys ?? local.defaultExpandedKeys ?? [],
  )
  const [innerSearchValue, setInnerSearchValue] = createSignal('')
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const api: TreeSelectRef = {
    blur: () => selectorRef?.blur(),
    focus: () => selectorRef?.focus(),
  }
  callRef(
    local.ref as { current?: TreeSelectRef } | ((ref: TreeSelectRef) => void) | undefined,
    api,
  )

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue(formItem.value() as TreeSelectValue)
  })

  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
  const size = () => local.size ?? formItem?.size?.()
  const variant = () =>
    local.variant ??
    (local.bordered === false ? 'borderless' : (formItem?.variant?.() ?? 'outlined'))
  const sourceTreeData = createMemo(() =>
    local.treeData !== undefined ? local.treeData : collectTreeSelectChildren(local.children),
  )
  const normalizedTreeData = createMemo(() =>
    normalizeTreeData(sourceTreeData(), {
      fieldNames: local.fieldNames,
      treeDataSimpleMode: local.treeDataSimpleMode,
    }),
  )
  const searchConfig = createMemo(() => normalizeTreeSelectSearch(local))
  const searchValue = () => searchConfig().searchValue ?? innerSearchValue()
  const displayedTreeData = createMemo(() =>
    filterTreeDataBySearch(normalizedTreeData(), searchValue(), searchConfig()),
  )
  const entities = createMemo(() => buildTreeEntities(normalizedTreeData()))
  const displayedEntities = createMemo(() => buildTreeEntities(displayedTreeData()))
  const treeData = createMemo(() => treeDataForTree(displayedEntities()))
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return formItem.value() as TreeSelectValue
    if (isValueControlled()) return local.value
    return innerValue()
  }
  const multiple = () => Boolean(local.multiple || local.treeCheckable)
  const labelInValue = () => Boolean(local.labelInValue || local.treeCheckStrictly)
  const selectedEntities = createMemo(() => valueEntities(entities(), value()))
  const displayEntities = createMemo(() =>
    local.treeCheckable
      ? displayEntitiesByStrategy(selectedEntities(), local.showCheckedStrategy ?? 'SHOW_CHILD')
      : selectedEntities(),
  )
  const selectedEntity = createMemo(() => displayEntities()[0])
  const selectedKeys = createMemo<TreeKey[]>(() => selectedEntities().map((entity) => entity.key))
  const checkedKeys = createMemo<TreeKey[]>(() =>
    local.treeCheckable ? selectedEntities().map((entity) => entity.key) : [],
  )
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const expandedKeys = () => {
    if (local.treeExpandedKeys) return local.treeExpandedKeys
    if (local.treeDefaultExpandAll && innerExpandedKeys().length === 0)
      return entities().map((entity) => entity.key as TreeSelectRawValue)
    return innerExpandedKeys()
  }
  const displayLabel = () =>
    selectedEntity()
      ? (treeSelectLabels([selectedEntity()!], local.treeNodeLabelProp) as JSX.Element)
      : local.placeholder
  const hasValue = () => firstValue(value()) !== undefined
  const showClear = () => local.allowClear !== false && !disabled() && hasValue()
  const showSearchInput = () => searchConfig().enabled && open() && !multiple()
  const visibleTags = createMemo(() => {
    const maxTagCount = local.maxTagCount === 'responsive' ? undefined : local.maxTagCount
    return maxTagCount === undefined ? displayEntities() : displayEntities().slice(0, maxTagCount)
  })
  const omittedTags = createMemo(() => {
    const maxTagCount = local.maxTagCount === 'responsive' ? undefined : local.maxTagCount
    return maxTagCount === undefined ? [] : displayEntities().slice(maxTagCount)
  })
  const omittedPlaceholder = () => {
    const omitted = omittedTags()
    if (!omitted.length) return undefined
    const omittedNodes = omitted.map((entity) => entity.node)
    return typeof local.maxTagPlaceholder === 'function'
      ? local.maxTagPlaceholder(omittedNodes)
      : (local.maxTagPlaceholder ?? `+ ${omitted.length} ...`)
  }

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    const placement = local.placement ?? 'bottomLeft'
    const widthMatch = local.popupMatchSelectWidth ?? local.dropdownMatchSelectWidth
    const width =
      typeof widthMatch === 'number'
        ? `${widthMatch}px`
        : widthMatch === false
          ? undefined
          : `${rect.width}px`
    setDropdownPosition({
      position: 'fixed',
      top: `${placement.startsWith('top') ? rect.top - 4 : rect.bottom + 4}px`,
      left: `${placement.endsWith('Right') ? rect.right - (typeof widthMatch === 'number' ? widthMatch : rect.width) : rect.left}px`,
      width,
      'z-index': `${dropdownZIndex}`,
    })
  }

  function containsPopupTarget(target: EventTarget | null): boolean {
    return Boolean(
      target instanceof Node &&
      ((selectorRef && selectorRef.contains(target)) ||
        (dropdownRef && dropdownRef.contains(target))),
    )
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled() && nextOpen) return
    if (nextOpen) updateDropdownPosition()
    if (!isOpenControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
    local.onDropdownVisibleChange?.(nextOpen)
  }

  function setSearch(nextSearch: string): void {
    if (searchConfig().searchValue === undefined) setInnerSearchValue(nextSearch)
    searchConfig().onSearch?.(nextSearch)
  }

  createRenderEffect(() => {
    if (open()) updateDropdownPosition()
  })

  createEffect(() => {
    if (!open()) return
    const removeListeners = addPositionUpdateListeners(updateDropdownPosition)
    onCleanup(removeListeners)
  })

  createEffect(() => {
    if (!open()) return
    const removePointerDown = addDocumentPointerDown((event) => {
      if (!containsPopupTarget(event.target)) setOpen(false)
    })
    onCleanup(removePointerDown)
  })

  function commitValue(nextEntities: TreeSelectTreeEntity[], extra: Record<string, unknown>): void {
    const nextValue = outputTreeSelectValue(nextEntities, {
      labelInValue: labelInValue(),
      multiple: multiple(),
      treeNodeLabelProp: local.treeNodeLabelProp,
    })
    const nextLabels = treeSelectLabels(nextEntities, local.treeNodeLabelProp)
    const outputLabels =
      multiple() && nextLabels !== undefined && !Array.isArray(nextLabels)
        ? [nextLabels]
        : nextLabels
    if (
      !isValueControlled() &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    )
      setInnerValue(nextValue)
    local.onChange?.(nextValue, outputLabels, extra)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextValue)
  }

  function selectTreeNode(
    selectedKeysInput: TreeKey[],
    info: { node: TreeDataNode; selected: boolean },
  ): void {
    const entity =
      findEntityByKey(entities(), selectedKeysInput[selectedKeysInput.length - 1]) ??
      findEntityByKey(entities(), info.node.key)
    if (!entity || entity.node.selectable === false) return
    const nextEntities = multiple()
      ? info.selected
        ? [...selectedEntities(), entity]
        : selectedEntities().filter((item) => item.value !== entity.value)
      : [entity]
    if (local.maxCount !== undefined && info.selected && nextEntities.length > local.maxCount)
      return
    commitValue(nextEntities, {
      selected: info.selected,
      triggerNode: entityToPublicNode(entity),
      triggerValue: entity.value,
    })
    local.onSelect?.(entityToSelectValue(entity, labelInValue()), entity.node, {
      selected: info.selected,
    })
    if (!multiple()) setOpen(false)
  }

  function checkTreeNode(
    checkedKeysInput: TreeKey[] | { checked: TreeKey[]; halfChecked: TreeKey[] },
    info: {
      checked: boolean
      checkedNodes: TreeDataNode[]
      halfCheckedKeys: TreeKey[]
      node: TreeDataNode
    },
  ): void {
    const keys = Array.isArray(checkedKeysInput) ? checkedKeysInput : checkedKeysInput.checked
    const nextEntities = keys
      .map((key) => findEntityByKey(entities(), key))
      .filter((entity): entity is TreeSelectTreeEntity => entity !== undefined)
    const triggerEntity = findEntityByKey(entities(), info.node.key)
    commitValue(nextEntities, {
      checked: info.checked,
      checkedNodes: nextEntities.map((entity) => entity.node),
      halfCheckedKeys: info.halfCheckedKeys,
      triggerNode: entityToPublicNode(triggerEntity),
      triggerValue: triggerEntity?.value,
    })
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    commitValue([], {})
  }

  function loadTreeNode(node: TreeDataNode): Promise<unknown> | unknown {
    const entity = findEntityByKey(entities(), node.key)
    return local.loadData?.(entity?.node ?? (node as NormalizedTreeSelectNode))
  }

  function removeEntity(event: MouseEvent, entity: TreeSelectTreeEntity): void {
    event.stopPropagation()
    commitValue(
      selectedEntities().filter((item) => item.value !== entity.value),
      {
        selected: false,
        triggerNode: entity.node,
        triggerValue: entity.value,
      },
    )
  }

  function selectFirstEnabled(): void {
    const first = entities().find(
      (entity) => !entity.node.disabled && entity.node.selectable !== false,
    )
    if (first) {
      commitValue([first], {
        selected: true,
        triggerNode: first.node,
        triggerValue: first.value,
      })
      setOpen(false)
    }
  }

  function changeExpandedKeys(nextKeys: TreeKey[]): void {
    if (!('treeExpandedKeys' in props)) setInnerExpandedKeys(nextKeys as TreeSelectRawValue[])
    local.onTreeExpand?.(nextKeys as TreeSelectRawValue[])
  }

  function mergeStyle(
    ...styles: Array<JSX.CSSProperties | undefined>
  ): JSX.CSSProperties | undefined {
    return Object.assign({}, ...styles.filter(Boolean))
  }

  function popupWidthStyle(): JSX.CSSProperties | undefined {
    const widthMatch = local.popupMatchSelectWidth ?? local.dropdownMatchSelectWidth
    if (typeof widthMatch === 'number') return { width: `${widthMatch}px` }
    return undefined
  }

  function dropdownNode(): JSX.Element {
    return (
      <div
        ref={(element) => {
          dropdownRef = element
        }}
        class={classNames(
          `${prefixCls()}-dropdown`,
          local.popupClassName,
          local.dropdownClassName,
          local.classNames?.popup,
          local.classNames?.['popup.root'],
        )}
        style={mergeStyle(
          popupWidthStyle(),
          dropdownPosition(),
          local.dropdownStyle,
          local.styles?.popup,
          local.styles?.['popup.root'],
        )}
        onScroll={(event) =>
          local.onPopupScroll?.(
            event as unknown as UIEvent & { currentTarget: HTMLDivElement; target: Element },
          )
        }
      >
        <Show
          when={treeData().length}
          fallback={
            <div class={`${prefixCls()}-empty`}>{local.notFoundContent ?? 'Not Found'}</div>
          }
        >
          <Tree
            treeData={treeData()}
            prefixCls={treePrefixCls()}
            selectedKeys={local.treeCheckable ? [] : selectedKeys()}
            checkedKeys={local.treeCheckable ? checkedKeys() : undefined}
            checkable={local.treeCheckable}
            checkStrictly={local.treeCheckStrictly}
            multiple={multiple()}
            expandedKeys={expandedKeys()}
            defaultExpandAll={local.treeDefaultExpandAll}
            expandAction={local.treeExpandAction}
            height={local.listHeight}
            virtual={local.virtual}
            loadedKeys={local.treeLoadedKeys}
            loadData={local.loadData ? loadTreeNode : undefined}
            showIcon={local.treeIcon}
            showLine={local.treeLine}
            switcherIcon={local.switcherIcon}
            titleRender={
              local.treeTitleRender
                ? (node) => local.treeTitleRender?.(node as NormalizedTreeSelectNode)
                : undefined
            }
            onSelect={selectTreeNode}
            onCheck={checkTreeNode}
            onExpand={(nextKeys) => changeExpandedKeys(nextKeys)}
          />
        </Show>
      </div>
    )
  }

  function popupNode(): JSX.Element {
    const origin = dropdownNode()
    return (local.popupRender ?? local.dropdownRender)?.(origin) ?? origin
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        showClear() && `${prefixCls()}-has-clear`,
        size() && size() !== 'middle' && `${prefixCls()}-${size()}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        local.bordered === false ? `${prefixCls()}-borderless` : `${prefixCls()}-${variant()}`,
        hashId(),
        local.class,
        local.classNames?.root,
      )}
      style={
        typeof local.style === 'string'
          ? local.style
          : mergeStyle(local.style as JSX.CSSProperties | undefined, local.styles?.root)
      }
    >
      <div
        role="combobox"
        tabindex={disabled() ? undefined : 0}
        aria-expanded={open()}
        aria-disabled={disabled()}
        ref={(element) => {
          selectorRef = element
        }}
        class={classNames(`${prefixCls()}-selector`, local.classNames?.selector)}
        style={local.styles?.selector}
        onClick={() => setOpen(!open())}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'Enter' && open()) selectFirstEnabled()
        }}
      >
        <Show when={local.prefix}>
          <span class={classNames(`${prefixCls()}-prefix`, local.classNames?.prefix)}>
            {local.prefix}
          </span>
        </Show>
        <Show when={showSearchInput()}>
          <span class={`${prefixCls()}-selection-search`}>
            <input
              class={`${prefixCls()}-search-input`}
              value={searchValue()}
              onClick={(event) => event.stopPropagation()}
              onInput={(event) => setSearch(event.currentTarget.value)}
            />
          </span>
        </Show>
        <Show when={!showSearchInput() && multiple()}>
          <span class={`${prefixCls()}-selection-overflow`}>
            <For each={visibleTags()}>
              {(entity) => {
                const label = () =>
                  truncateTreeSelectLabel(
                    treeSelectLabels([entity], local.treeNodeLabelProp) as JSX.Element,
                    local.maxTagTextLength,
                  )
                return (
                  <Show
                    when={local.tagRender}
                    fallback={
                      <span class={`${prefixCls()}-selection-item ${prefixCls()}-tag`}>
                        <span class={`${prefixCls()}-tag-label`}>{label()}</span>
                        <button
                          type="button"
                          aria-label={`remove ${String(entity.node.title)}`}
                          class={`${prefixCls()}-tag-close`}
                          onClick={(event) => removeEntity(event, entity)}
                        >
                          <CloseOutlined />
                        </button>
                      </span>
                    }
                  >
                    {local.tagRender?.({
                      label: label(),
                      value: entity.value,
                      disabled: disabled(),
                      closable: !disabled(),
                      onClose: () =>
                        commitValue(
                          selectedEntities().filter((item) => item.value !== entity.value),
                          {
                            selected: false,
                            triggerNode: entity.node,
                            triggerValue: entity.value,
                          },
                        ),
                    })}
                  </Show>
                )
              }}
            </For>
            <Show when={omittedPlaceholder()}>
              <span class={`${prefixCls()}-selection-item ${prefixCls()}-tag`}>
                {omittedPlaceholder()}
              </span>
            </Show>
            <Show when={!hasValue()}>
              <span class={`${prefixCls()}-placeholder`}>{local.placeholder}</span>
            </Show>
            <Show when={searchConfig().enabled && open()}>
              <span class={`${prefixCls()}-selection-search`}>
                <input
                  class={`${prefixCls()}-search-input`}
                  value={searchValue()}
                  onClick={(event) => event.stopPropagation()}
                  onInput={(event) => setSearch(event.currentTarget.value)}
                />
              </span>
            </Show>
          </span>
        </Show>
        <Show when={!showSearchInput() && !multiple()}>
          <span class={hasValue() ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`}>
            {displayLabel()}
          </span>
        </Show>
        <span class={`${prefixCls()}-suffix`}>
          <Show when={local.showArrow !== false && local.suffixIcon !== null}>
            <span class={`${prefixCls()}-arrow`}>
              {local.suffixIcon ?? <DownOutlined width="0.8em" height="0.8em" />}
            </span>
          </Show>
          <Show when={showClear()}>
            <button
              type="button"
              aria-label="clear tree select"
              class={`${prefixCls()}-clear`}
              onClick={clearValue}
            >
              {clearIcon(local.allowClear)}
            </button>
          </Show>
        </span>
      </div>
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          {popupNode()}
        </InternalPortal>
      </Show>
    </div>
  )
}
