import { For, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { CascaderOption } from './interface'
import type { SearchResult } from './search-utils'

export interface CascaderDropdownProps {
  prefixCls: string
  columns: CascaderOption[][]
  searchActive: boolean
  searchResults: SearchResult[]
  dropdownPosition: JSX.CSSProperties
  dropdownRef: (element: HTMLDivElement) => void
  multiple: boolean
  loadingIcon?: JSX.Element
  isSelected: (option: CascaderOption, depth: number) => boolean
  isActive: (option: CascaderOption, depth: number) => boolean
  isChecked: (option: CascaderOption, depth: number) => boolean
  isIndeterminate: (option: CascaderOption, depth: number) => boolean
  isLoading: (option: CascaderOption, depth: number) => boolean
  onOptionActivate: (option: CascaderOption, depth: number, commitSelection?: boolean) => void
  onSearchSelect: (path: CascaderOption[]) => void
}

export function CascaderDropdown(props: CascaderDropdownProps) {
  return (
    <div ref={props.dropdownRef} class={`${props.prefixCls}-dropdown`} style={props.dropdownPosition}>
      <Show
        when={props.searchActive}
        fallback={
          <For each={props.columns}>
            {(column, columnIndex) => (
              <ul role="menu" class={`${props.prefixCls}-menu`}>
                <For each={column}>
                  {(option) => (
                    <li
                      role="menuitem"
                      aria-selected={props.isSelected(option, columnIndex())}
                      aria-checked={props.multiple ? props.isChecked(option, columnIndex()) : undefined}
                      aria-disabled={Boolean(option.disabled)}
                      data-indeterminate={
                        props.multiple && props.isIndeterminate(option, columnIndex()) ? 'true' : undefined
                      }
                      class={classNames(
                        `${props.prefixCls}-menu-item`,
                        props.isSelected(option, columnIndex()) && `${props.prefixCls}-menu-item-selected`,
                        props.isActive(option, columnIndex()) && `${props.prefixCls}-menu-item-active`,
                        option.disabled && `${props.prefixCls}-menu-item-disabled`,
                      )}
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
                      <span>{option.label}</span>
                      <Show when={props.isLoading(option, columnIndex())} fallback={
                        <Show when={option.children?.length || option.isLeaf === false}>
                          <span aria-hidden="true" class={`${props.prefixCls}-menu-item-expand-icon`}>
                            ›
                          </span>
                        </Show>
                      }>
                        <span class={`${props.prefixCls}-loading-icon`}>
                          {props.loadingIcon ?? '…'}
                        </span>
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            )}
          </For>
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
    </div>
  )
}
