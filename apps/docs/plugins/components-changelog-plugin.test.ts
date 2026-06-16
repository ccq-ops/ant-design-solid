import { describe, expect, it } from 'vitest'
import { readComponentsChangelog } from './components-changelog-plugin'

describe('components changelog plugin', () => {
  it('loads the components changelog without the package title', () => {
    const changelog = readComponentsChangelog()

    expect(changelog).toMatch(/^## 0\./)
    expect(changelog).toContain('release v0.2.0')
    expect(changelog).not.toMatch(/^# @solid-ant-design\/core/m)
  })
})
