import type { JSX } from 'solid-js'
import type { CascaderOption } from './interface'
import { flattenOptionPaths } from './path-utils'
import type { NormalizedShowSearch, ShowSearchInput } from './types'

function labelText(label: JSX.Element): string {
  if (typeof label === 'string' || typeof label === 'number' || typeof label === 'boolean')
    return String(label)
  return ''
}

function defaultFilter(inputValue: string, path: CascaderOption[]): boolean {
  const normalized = inputValue.trim().toLowerCase()
  if (!normalized) return true
  return path.some((option) => labelText(option.label).toLowerCase().includes(normalized))
}

export function normalizeShowSearch(showSearch: ShowSearchInput): NormalizedShowSearch {
  if (!showSearch) {
    return { enabled: false, filter: defaultFilter, limit: 50, matchInputWidth: true }
  }

  if (showSearch === true) {
    return { enabled: true, filter: defaultFilter, limit: 50, matchInputWidth: true }
  }

  return {
    enabled: true,
    filter: showSearch.filter ?? defaultFilter,
    limit: showSearch.limit ?? 50,
    matchInputWidth: showSearch.matchInputWidth ?? true,
    render: showSearch.render,
    sort: showSearch.sort,
    searchValue: showSearch.searchValue,
    onSearch: showSearch.onSearch,
    autoClearSearchValue: showSearch.autoClearSearchValue,
    searchIcon: showSearch.searchIcon,
  }
}

export interface SearchResult {
  path: CascaderOption[]
  label: JSX.Element
}

export function pathLabel(path: CascaderOption[]): string {
  return path.map((option) => labelText(option.label)).join(' / ')
}

export function getSearchResults(
  options: CascaderOption[],
  inputValue: string,
  config: NormalizedShowSearch,
): SearchResult[] {
  if (!config.enabled) return []
  let paths = flattenOptionPaths(options).filter((path) => {
    const last = path[path.length - 1]
    return Boolean(last && !last.disabled && (!last.children?.length || last.isLeaf === true))
  })
  paths = paths.filter((path) => config.filter(inputValue, path))
  if (config.sort) paths = [...paths].sort((a, b) => config.sort!(a, b, inputValue))
  if (config.limit !== false) paths = paths.slice(0, config.limit)

  return paths.map((path) => ({
    path,
    label: config.render ? config.render(inputValue, path) : pathLabel(path),
  }))
}
