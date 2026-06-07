import { LoadingOutlined, SearchOutlined } from '@ant-design-solid/icons'
import { classNames } from '../shared/class-names'
import { Input } from './input'
import type { JSX } from 'solid-js'
import type { SearchProps } from './interface'

export function Search(props: SearchProps) {
  let inputRef: HTMLInputElement | undefined
  const currentValue = () => inputRef?.value ?? String(props.value ?? props.defaultValue ?? '')
  const triggerSearch = (
    event: MouseEvent | KeyboardEvent | Event,
    source: 'input' | 'clear' = 'input',
  ) => {
    props.onSearch?.(currentValue(), event, { source })
  }
  const searchIcon = () =>
    props.searchIcon ?? (props.loading ? <LoadingOutlined /> : <SearchOutlined />)
  const suffix = () => (
    <button
      type="button"
      aria-label="search"
      class={classNames('ads-input-search-icon', props.loading && 'ads-input-search-loading')}
      onClick={(event) => triggerSearch(event)}
    >
      {searchIcon()}
    </button>
  )
  const enterButton = () => {
    if (!props.enterButton) return undefined
    return (
      <button
        type="button"
        aria-label={typeof props.enterButton === 'string' ? props.enterButton : 'search'}
        class={classNames('ads-input-search-button', props.loading && 'ads-input-search-loading')}
        onClick={(event) => triggerSearch(event)}
      >
        {props.loading && <LoadingOutlined />}
        {props.enterButton === true ? 'Search' : props.enterButton}
      </button>
    )
  }

  return (
    <Input
      {...props}
      ref={(el) => {
        inputRef = el
        const ref = props.ref
        if (typeof ref === 'function') ref(el)
      }}
      class={classNames('ads-input-search', props.class)}
      suffix={props.enterButton ? enterButton() : (props.suffix ?? suffix())}
      onPressEnter={(event) => {
        ;(props.onPressEnter as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined)?.(
          event,
        )
        triggerSearch(event)
      }}
      onClear={() => {
        props.onClear?.()
        props.onSearch?.('', new Event('clear'), { source: 'clear' })
      }}
    />
  )
}
