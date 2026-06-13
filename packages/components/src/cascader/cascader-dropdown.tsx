import { For, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { CascaderOption, CascaderSemanticSlot } from './interface'
import type { SearchResult } from './search-utils'

type SemanticClasses = Partial<Record<CascaderSemanticSlot, string>>
type SemanticStyles = Partial<Record<CascaderSemanticSlot, JSX.CSSProperties>>

export interface CascaderDropdownProps {
  prefixCls: string
  rootClass?: string
  columns: CascaderOption[][]
  searchActive: boolean
  searchResults: SearchResult[]
  dropdownPosition: JSX.CSSProperties
  placementClass?: string
  dropdownRef: (element: HTMLDivElement) => void
  multiple: boolean
  loadingIcon?: JSX.Element
  expandIcon?: JSX.Element
  notFoundContent?: JSX.Element
  optionRender?: (option: CascaderOption) => JSX.Element
  classNames?: SemanticClasses
  styles?: SemanticStyles
  isSelected: (option: CascaderOption, depth: number) => boolean
  isActive: (option: CascaderOption, depth: number) => boolean
  isChecked: (option: CascaderOption, depth: number) => boolean
  isIndeterminate: (option: CascaderOption, depth: number) => boolean
  isLoading: (option: CascaderOption, depth: number) => boolean
  onOptionActivate: (option: CascaderOption, depth: number, commitSelection?: boolean) => void
  onSearchSelect: (path: CascaderOption[]) => void
}

export function CascaderDropdown(props: CascaderDropdownProps) {
  const emptyNode = () => props.notFoundContent ?? 'Not Found'
  const optionNode = (option: CascaderOption) => props.optionRender?.(option) ?? option.label
  const hasSearchResults = () => props.searchResults.length > 0
  const hasColumns = () => props.columns.some((column) => column.length > 0)

  return (
    <div
      ref={props.dropdownRef}
      class={classNames(
        `${props.prefixCls}-dropdown`,
        props.placementClass,
        props.rootClass,
        props.classNames?.popup,
      )}
      style={props.dropdownPosition}
    >
      <Show
        when={props.searchActive}
        fallback={
          <Show
            when={hasColumns()}
            fallback={
              <div
                class={classNames(`${props.prefixCls}-empty`, props.classNames?.empty)}
                style={props.styles?.empty}
              >
                {emptyNode()}
              </div>
            }
          >
            <For each={props.columns}>
              {(column, columnIndex) => (
                <ul
                  role="menu"
                  class={classNames(`${props.prefixCls}-menu`, props.classNames?.menu)}
                  style={props.styles?.menu}
                >
                  <For each={column}>
                    {(option) => (
                      <li
                        role="menuitem"
                        aria-selected={props.isSelected(option, columnIndex())}
                        aria-checked={
                          props.multiple ? props.isChecked(option, columnIndex()) : undefined
                        }
                        aria-disabled={Boolean(option.disabled)}
                        data-indeterminate={
                          props.multiple && props.isIndeterminate(option, columnIndex())
                            ? 'true'
                            : undefined
                        }
                        class={classNames(
                          `${props.prefixCls}-menu-item`,
                          props.isSelected(option, columnIndex()) &&
                            `${props.prefixCls}-menu-item-selected`,
                          props.isActive(option, columnIndex()) &&
                            `${props.prefixCls}-menu-item-active`,
                          option.disabled && `${props.prefixCls}-menu-item-disabled`,
                          props.classNames?.item,
                        )}
                        style={props.styles?.item}
                        onClick={() => props.onOptionActivate(option, columnIndex())}
                        onPointerEnter={() => props.onOptionActivate(option, columnIndex(), false)}
                      >
                        <Show when={props.multiple}>
                          <span class={`${props.prefixCls}-checkbox`} aria-hidden="true">
                            {props.isChecked(option, columnIndex())
                              ? '✓'
                              : props.isIndeterminate(option, columnIndex())
                                ? '−'
                                : ''}
                          </span>
                        </Show>
                        <span
                          class={classNames(
                            `${props.prefixCls}-menu-item-content`,
                            props.classNames?.itemContent,
                          )}
                          style={props.styles?.itemContent}
                        >
                          {optionNode(option)}
                        </span>
                        <Show
                          when={props.isLoading(option, columnIndex())}
                          fallback={
                            <Show when={option.children?.length || option.isLeaf === false}>
                              <span
                                aria-hidden="true"
                                class={classNames(
                                  `${props.prefixCls}-menu-item-expand-icon`,
                                  props.classNames?.expandIcon,
                                )}
                                style={props.styles?.expandIcon}
                              >
                                {props.expandIcon ?? '›'}
                              </span>
                            </Show>
                          }
                        >
                          <span
                            class={classNames(
                              `${props.prefixCls}-loading-icon`,
                              props.classNames?.loadingIcon,
                            )}
                            style={props.styles?.loadingIcon}
                          >
                            {props.loadingIcon ?? '…'}
                          </span>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
              )}
            </For>
          </Show>
        }
      >
        <Show
          when={hasSearchResults()}
          fallback={
            <div
              class={classNames(`${props.prefixCls}-empty`, props.classNames?.empty)}
              style={props.styles?.empty}
            >
              {emptyNode()}
            </div>
          }
        >
          <ul role="listbox" class={`${props.prefixCls}-search-list`}>
            <For each={props.searchResults}>
              {(result) => (
                <li
                  role="option"
                  class={`${props.prefixCls}-search-item`}
                  onClick={() => props.onSearchSelect(result.path)}
                >
                  {result.label}
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </div>
  )
}
