import { Show, splitProps } from 'solid-js'
import { SearchOutlined } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { Button } from '../button'
import { classNames } from '../shared/class-names'
import { Input } from './input'
import { useInputStyle } from './input.style'
import { resolveClassNames, resolveStyles } from './utils'
import type { JSX } from 'solid-js'
import type { SearchProps, SearchSemanticClassNames, SearchSemanticStyles } from './interface'

export function Search(props: SearchProps) {
  const [local, rest] = splitProps(props, [
    'ref',
    'rootClassName',
    'prefixCls',
    'inputPrefixCls',
    'class',
    'style',
    'size',
    'enterButton',
    'loading',
    'searchIcon',
    'addonAfter',
    'classNames',
    'styles',
    'onSearch',
    'onPressEnter',
    'onClear',
    'disabled',
    'variant',
  ])
  let inputRef: HTMLInputElement | undefined
  const config = useConfig()
  const currentValue = () => inputRef?.value ?? String(props.value ?? props.defaultValue ?? '')
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-input-search`
  const inputPrefixCls = () => local.inputPrefixCls ?? `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(inputPrefixCls())
  const semanticProps = (): SearchProps => ({ ...props })
  const semanticClassNames = (): SearchSemanticClassNames =>
    resolveClassNames(local.classNames, semanticProps())
  const semanticStyles = (): SearchSemanticStyles => resolveStyles(local.styles, semanticProps())
  const size = () => local.size ?? config.componentSize()
  const enterButton = () => local.enterButton ?? false
  const triggerSearch = (
    event: MouseEvent | KeyboardEvent | Event,
    source: 'input' | 'clear' = 'input',
  ) => {
    local.onSearch?.(currentValue(), event, { source })
  }
  const searchIcon = () =>
    typeof enterButton() === 'boolean' ? (local.searchIcon ?? <SearchOutlined />) : undefined
  const buttonContent = () => {
    if (!enterButton() || enterButton() === true) return undefined
    return enterButton()
  }
  const inputClassNames = (): SearchSemanticClassNames => {
    const { button: _button, root: _root, ...restClassNames } = semanticClassNames()
    return restClassNames
  }
  const inputStyles = (): SearchSemanticStyles => {
    const { button: _button, root: _root, ...restStyles } = semanticStyles()
    return restStyles
  }
  const searchButton = () => (
    <Button
      type={enterButton() ? 'primary' : 'default'}
      variant={
        local.variant === 'borderless' ||
        local.variant === 'filled' ||
        local.variant === 'underlined'
          ? 'text'
          : enterButton()
            ? 'solid'
            : undefined
      }
      size={size()}
      disabled={local.disabled}
      loading={local.loading}
      icon={searchIcon()}
      aria-label={typeof enterButton() === 'string' ? String(enterButton()) : 'search'}
      class={classNames(
        `${prefixCls()}-btn`,
        local.variant && `${prefixCls()}-btn-${local.variant}`,
        local.loading && `${prefixCls()}-loading`,
        semanticClassNames().button,
      )}
      style={semanticStyles().button}
      onMouseDown={(event: MouseEvent) => {
        if (document.activeElement === inputRef) event.preventDefault()
      }}
      onClick={(event) => triggerSearch(event)}
    >
      {buttonContent()}
    </Button>
  )

  return (
    <span
      class={classNames(
        prefixCls(),
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        Boolean(enterButton()) && `${prefixCls()}-with-button`,
        `${inputPrefixCls()}-group`,
        `${inputPrefixCls()}-group-compact`,
        hashId(),
        local.rootClassName,
        local.class,
        semanticClassNames().root,
      )}
      style={{ ...(semanticStyles().root ?? {}), ...(local.style as JSX.CSSProperties) }}
    >
      <Input
        {...rest}
        type="search"
        prefixCls={inputPrefixCls()}
        size={size()}
        disabled={local.disabled}
        variant={local.variant}
        classNames={inputClassNames()}
        styles={inputStyles()}
        ref={(el) => {
          inputRef = el.input ?? undefined
          const ref = local.ref
          if (typeof ref === 'function') ref(el)
        }}
        onPressEnter={(event) => {
          ;(local.onPressEnter as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined)?.(
            event,
          )
          if (!local.loading) triggerSearch(event)
        }}
        onClear={() => {
          local.onClear?.()
          local.onSearch?.('', new Event('clear'), { source: 'clear' })
        }}
      />
      {searchButton()}
      <Show when={local.addonAfter}>{local.addonAfter}</Show>
    </span>
  )
}
