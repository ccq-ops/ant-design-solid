import { CloseCircleFilled } from '@solid-ant-design/icons'
import { For, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { OptionValue } from '../shared/options'
import type { CascaderSelectedPath, CascaderSemanticSlot } from './interface'

type SemanticClasses = Partial<Record<CascaderSemanticSlot, string>>
type SemanticStyles = Partial<Record<CascaderSemanticSlot, JSX.CSSProperties>>

export interface CascaderDisplayPath extends CascaderSelectedPath {
  text: string
}

export interface CascaderSelectorProps {
  prefixCls: string
  disabled: boolean
  open: boolean
  selected: boolean
  displayValue: JSX.Element
  placeholder?: JSX.Element
  allowClear: boolean
  clearIcon?: JSX.Element
  multiple: boolean
  tags: CascaderDisplayPath[]
  omittedTags: CascaderDisplayPath[]
  maxTagPlaceholder?: JSX.Element | ((omittedValues: CascaderSelectedPath[]) => JSX.Element)
  maxTagTextLength?: number
  tagRender?: (label: JSX.Element, onClose: () => void, value: OptionValue[]) => JSX.Element
  removeIcon?: JSX.Element
  prefix?: JSX.Element
  suffixIcon?: JSX.Element | null
  searchIcon?: JSX.Element
  classNames?: SemanticClasses
  styles?: SemanticStyles
  searchEnabled: boolean
  searchValue: string
  selectorRef: (element: HTMLDivElement) => void
  onToggleOpen: () => void
  onClear: (event: MouseEvent) => void
  onSearchInput: (value: string) => void
  onTagClose: (value: OptionValue[]) => void
  onFocusOut: JSX.FocusEventHandler<HTMLDivElement, FocusEvent>
  onKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent>
}

function truncateLabel(label: JSX.Element, maxLength?: number): JSX.Element {
  if (!maxLength) return label
  const text = typeof label === 'string' || typeof label === 'number' ? String(label) : undefined
  if (!text || text.length <= maxLength) return label
  return `${text.slice(0, maxLength)}…`
}

export function CascaderSelector(props: CascaderSelectorProps) {
  const defaultRemoveIcon = () => props.removeIcon ?? '×'
  const omittedPlaceholder = () => {
    if (!props.omittedTags.length) return undefined
    if (typeof props.maxTagPlaceholder === 'function')
      return props.maxTagPlaceholder(props.omittedTags)
    return props.maxTagPlaceholder ?? `+ ${props.omittedTags.length} ...`
  }

  return (
    <div
      role="combobox"
      tabindex={props.disabled ? undefined : 0}
      aria-expanded={props.open}
      aria-disabled={props.disabled}
      ref={props.selectorRef}
      class={classNames(`${props.prefixCls}-selector`, props.classNames?.selector)}
      style={props.styles?.selector}
      onClick={props.onToggleOpen}
      onFocusOut={props.onFocusOut}
      onKeyDown={props.onKeyDown}
    >
      <Show when={props.prefix}>
        <span class={classNames(`${props.prefixCls}-prefix`, props.classNames?.prefix)}>
          {props.prefix}
        </span>
      </Show>
      <Show
        when={props.multiple}
        fallback={
          <span
            class={
              props.selected
                ? `${props.prefixCls}-selection-item`
                : `${props.prefixCls}-placeholder`
            }
          >
            {props.displayValue}
          </span>
        }
      >
        <span class={`${props.prefixCls}-selection-overflow`}>
          <For each={props.tags}>
            {(tag) => {
              const label = () => truncateLabel(tag.label, props.maxTagTextLength)
              const close = () => props.onTagClose(tag.value)
              return (
                <Show
                  when={props.tagRender}
                  fallback={
                    <span
                      class={classNames(
                        `${props.prefixCls}-selection-item`,
                        `${props.prefixCls}-tag`,
                        props.classNames?.tag,
                      )}
                      style={props.styles?.tag}
                    >
                      <span
                        class={classNames(
                          `${props.prefixCls}-tag-label`,
                          props.classNames?.tagLabel,
                        )}
                        style={props.styles?.tagLabel}
                      >
                        {label()}
                      </span>
                      <button
                        type="button"
                        class={classNames(
                          `${props.prefixCls}-tag-close`,
                          props.classNames?.tagClose,
                        )}
                        style={props.styles?.tagClose}
                        aria-label={`remove ${tag.text}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          close()
                        }}
                      >
                        {defaultRemoveIcon()}
                      </button>
                    </span>
                  }
                >
                  {props.tagRender?.(label(), close, tag.value)}
                </Show>
              )
            }}
          </For>
          <Show when={omittedPlaceholder()}>
            <span
              class={classNames(
                `${props.prefixCls}-selection-item`,
                `${props.prefixCls}-tag`,
                props.classNames?.tag,
              )}
              style={props.styles?.tag}
            >
              {omittedPlaceholder()}
            </span>
          </Show>
          <Show when={!props.tags.length && !props.searchEnabled}>
            <span class={`${props.prefixCls}-placeholder`}>{props.placeholder}</span>
          </Show>
        </span>
      </Show>
      <Show when={props.searchEnabled && props.open}>
        <span class={classNames(`${props.prefixCls}-search`, props.classNames?.search)}>
          <Show when={props.searchIcon}>
            <span
              class={classNames(`${props.prefixCls}-search-icon`, props.classNames?.searchIcon)}
              style={props.styles?.searchIcon}
            >
              {props.searchIcon}
            </span>
          </Show>
          <input
            class={`${props.prefixCls}-search-input`}
            value={props.searchValue}
            onClick={(event) => event.stopPropagation()}
            onInput={(event) => props.onSearchInput(event.currentTarget.value)}
          />
        </span>
      </Show>
      <Show when={props.allowClear && !props.disabled && props.selected}>
        <button
          type="button"
          aria-label="clear selection"
          class={classNames(`${props.prefixCls}-clear`, props.classNames?.clear)}
          style={props.styles?.clear}
          onClick={props.onClear}
        >
          {props.clearIcon ?? <CloseCircleFilled />}
        </button>
      </Show>
      <Show when={props.suffixIcon !== null}>
        <span class={classNames(`${props.prefixCls}-suffix`, props.classNames?.suffix)}>
          {props.suffixIcon ?? '⌄'}
        </span>
      </Show>
    </div>
  )
}
