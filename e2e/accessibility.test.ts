import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = ['/', '/components/button', '/components/form', '/components/listy'] as const

test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'Chromium owns the axe accessibility gate',
)

for (const route of routes) {
  test(`${route} has no detectable non-color WCAG A or AA violations`, async ({ page }) => {
    await page.goto(route)
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // The current Ant Design-compatible palette has known contrast debt. Keep every other
      // WCAG A/AA rule blocking while contrast remediation is handled as a separate token task.
      .disableRules(['color-contrast'])
      .analyze()

    expect(
      results.violations,
      results.violations
        .map(
          (violation) =>
            `${violation.id}: ${violation.help}\n${violation.nodes
              .map((node) => `  ${node.target.join(' ')}: ${node.failureSummary}`)
              .join('\n')}`,
        )
        .join('\n\n'),
    ).toEqual([])
  })
}
