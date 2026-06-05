import {
  For,
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { addPositionUpdateListeners } from '../shared/overlay'
import type { OptionValue } from '../shared/options'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import type { TreeSelectNode, TreeSelectProps } from './interface'
import { useTreeSelectStyle } from './tree-select.style'

interface VisibleNode {
  node: TreeSelectNode
  depth: number
}

function valuesEqual(a: OptionValue | undefined, b: OptionValue | undefined): boolean {
  return a === b
}

function includesValue(values: OptionValue[], value: OptionValue): boolean {
  return values.some((item) => item === value)
}

function findNode(
  nodes: TreeSelectNode[],
  value: OptionValue | undefined,
): TreeSelectNode | undefined {
  if (value === undefined) return undefined
  for (const node of nodes) {
    if (valuesEqual(node.value, value)) return node
    const child = findNode(node.children ?? [], value)
    if (child) return child
  }
  return undefined
}

function flattenVisible(
  nodes: TreeSelectNode[],
  expandedKeys: OptionValue[],
  depth = 0,
): VisibleNode[] {
  const result: VisibleNode[] = []
  for (const node of nodes) {
    result.push({ node, depth })
    if (node.children?.length && includesValue(expandedKeys, node.value))
      result.push(...flattenVisible(node.children, expandedKeys, depth + 1))
  }
  return result
}

export function TreeSelect(props: TreeSelectProps) {
  const [local, rest] = splitProps(props, [
    'treeData',
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'placeholder',
    'disabled',
    'allowClear',
    'defaultExpandedKeys',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onOpenChange',
    'onKeyDown',
    'zIndex',
    'getPopupContainer',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-tree-select`
  const [, hashId] = useTreeSelectStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerValue, setInnerValue] = createSignal<OptionValue | undefined>(local.defaultValue)
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [expandedKeys, setExpandedKeys] = createSignal<OptionValue[]>(
    local.defaultExpandedKeys ?? [],
  )
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue(formItem.value() as OptionValue | undefined)
  })

  const disabled = () => Boolean(local.disabled)
  const treeData = () => local.treeData ?? []
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return formItem.value() as OptionValue | undefined
    if (isValueControlled()) return local.value
    return innerValue()
  }
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const selectedNode = createMemo(() => findNode(treeData(), value()))
  const visibleNodes = createMemo(() => flattenVisible(treeData(), expandedKeys()))

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      'z-index': `${dropdownZIndex}`,
    })
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (nextOpen) updateDropdownPosition()
    if (!isOpenControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  createRenderEffect(() => {
    if (open()) updateDropdownPosition()
  })

  createEffect(() => {
    if (!open()) return
    const removeListeners = addPositionUpdateListeners(updateDropdownPosition)
    onCleanup(removeListeners)
  })

  function changeValue(nextValue: OptionValue | undefined, node: TreeSelectNode | undefined): void {
    if (
      !isValueControlled() &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    )
      setInnerValue(nextValue)
    local.onChange?.(nextValue, node)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextValue)
  }

  function selectNode(node: TreeSelectNode): void {
    if (disabled() || node.disabled) return
    changeValue(node.value, node)
    setOpen(false)
  }

  function toggleExpand(event: MouseEvent, node: TreeSelectNode): void {
    event.stopPropagation()
    const current = expandedKeys()
    setExpandedKeys(
      includesValue(current, node.value)
        ? current.filter((item) => item !== node.value)
        : [...current, node.value],
    )
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    changeValue(undefined, undefined)
  }

  function selectFirstEnabled(): void {
    const first = visibleNodes().find((item) => !item.node.disabled)
    if (first) selectNode(first.node)
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <div
        role="combobox"
        tabindex={disabled() ? undefined : 0}
        aria-expanded={open()}
        aria-disabled={disabled()}
        ref={(element) => {
          selectorRef = element
        }}
        class={`${prefixCls()}-selector`}
        onClick={() => setOpen(!open())}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'Enter' && open()) selectFirstEnabled()
        }}
      >
        <span
          class={selectedNode() ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`}
        >
          {selectedNode()?.title ?? local.placeholder}
        </span>
        <Show when={local.allowClear && !disabled() && value() !== undefined}>
          <button
            type="button"
            aria-label="clear tree select"
            class={`${prefixCls()}-clear`}
            onClick={clearValue}
          >
            ×
          </button>
        </Show>
      </div>
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          <div class={`${prefixCls()}-dropdown`} style={dropdownPosition()}>
            <ul role="tree" class={`${prefixCls()}-tree`}>
              <For each={visibleNodes()}>
                {({ node, depth }) => (
                  <li
                    role="treeitem"
                    aria-disabled={Boolean(node.disabled)}
                    aria-selected={value() === node.value}
                    class={classNames(
                      `${prefixCls()}-tree-node`,
                      value() === node.value && `${prefixCls()}-tree-node-selected`,
                      node.disabled && `${prefixCls()}-tree-node-disabled`,
                    )}
                    style={{ 'padding-left': `${8 + depth * 20}px` }}
                    onClick={() => selectNode(node)}
                  >
                    <Show
                      when={node.children?.length}
                      fallback={<span class={`${prefixCls()}-indent`} style={{ width: '16px' }} />}
                    >
                      <button
                        type="button"
                        aria-label={`${includesValue(expandedKeys(), node.value) ? 'collapse' : 'expand'} ${node.title}`}
                        class={`${prefixCls()}-expand`}
                        onClick={(event) => toggleExpand(event, node)}
                      >
                        {includesValue(expandedKeys(), node.value) ? '▾' : '▸'}
                      </button>
                    </Show>
                    <span>{node.title}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </InternalPortal>
      </Show>
    </div>
  )
}
