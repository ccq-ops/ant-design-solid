import { describe, expect, it } from 'vitest'
import type { CascaderOption } from './interface'
import {
  SHOW_CHILD,
  SHOW_PARENT,
  collectSelectableLeafPaths,
  filterDisplayedPaths,
  findOptionPath,
  pathKey,
} from './path-utils'

const strategyOptions: CascaderOption[] = [
  {
    label: 'Parent',
    value: 'parent',
    children: [
      { label: 'Child A', value: 'a' },
      { label: 'Child B', value: 'b', disabled: true },
      { label: 'Child C', value: 'c' },
    ],
  },
]

describe('cascader path utils', () => {
  it('finds option paths by value path', () => {
    expect(findOptionPath(strategyOptions, ['parent', 'a']).map((option) => option.value)).toEqual([
      'parent',
      'a',
    ])
  })

  it('collects selectable leaf paths and ignores disabled leaves', () => {
    expect(
      collectSelectableLeafPaths(strategyOptions[0]).map((path) =>
        pathKey(path.map((option) => option.value)),
      ),
    ).toEqual(['parent\u0000a', 'parent\u0000c'])
  })

  it('filters displayed paths using SHOW_PARENT and SHOW_CHILD', () => {
    const parent = findOptionPath(strategyOptions, ['parent'])
    const childA = findOptionPath(strategyOptions, ['parent', 'a'])
    const childC = findOptionPath(strategyOptions, ['parent', 'c'])

    expect(
      filterDisplayedPaths([childA, childC], SHOW_CHILD, strategyOptions).map((path) =>
        pathKey(path.map((option) => option.value)),
      ),
    ).toEqual(['parent\u0000a', 'parent\u0000c'])
    expect(
      filterDisplayedPaths([childA, childC], SHOW_PARENT, strategyOptions).map((path) =>
        pathKey(path.map((option) => option.value)),
      ),
    ).toEqual(['parent'])
    expect(
      filterDisplayedPaths([parent, childA], SHOW_PARENT, strategyOptions).map((path) =>
        pathKey(path.map((option) => option.value)),
      ),
    ).toEqual(['parent'])
  })
})
