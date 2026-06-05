import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'
import type { CascaderOption, CascaderShowSearch } from './interface'

export interface CascaderPathEntity {
  value: OptionValue[]
  options: CascaderOption[]
  key: string
  label: JSX.Element
}

export interface NormalizedShowSearch {
  enabled: boolean
  filter: (inputValue: string, path: CascaderOption[]) => boolean
  limit: number | false
  matchInputWidth: boolean
  render?: (inputValue: string, path: CascaderOption[]) => JSX.Element
  sort?: (a: CascaderOption[], b: CascaderOption[], inputValue: string) => number
  searchValue?: string
  onSearch?: (search: string) => void
  autoClearSearchValue?: boolean
  searchIcon?: JSX.Element
}

export type ShowSearchInput = boolean | CascaderShowSearch | undefined
