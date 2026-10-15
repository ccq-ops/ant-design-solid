import { expect, test } from '@playwright/test'

const ownerlessComputationWarning =
  'computations created outside a `createRoot` or `render` will never be disposed'

const routes = [
  '/',
  '/components/cascader',
  '/components/color-picker',
  '/components/date-picker',
  '/components/form',
  '/components/menu',
  '/components/modal',
  '/components/select',
  '/components/slider',
  '/components/tabs',
  '/components/tree',
  '/components/tree-select',
  '/components/transfer',
] as const

for (const route of routes) {
  test(`${route} does not create ownerless Solid computations`, async ({ page }) => {
    const ownerlessWarnings: Array<{
      location: { columnNumber: number; lineNumber: number; url: string }
      text: string
    }> = []

    await page.addInitScript((warning) => {
      const originalWarn = console.warn

      Object.defineProperty(window, '__ownerlessSolidWarningStacks', {
        configurable: true,
        value: [] as string[],
      })
      console.warn = (...args: unknown[]) => {
        if (args.some((argument) => String(argument).includes(warning))) {
          ;(
            window as typeof window & { __ownerlessSolidWarningStacks: string[] }
          ).__ownerlessSolidWarningStacks.push(new Error().stack ?? '')
        }

        originalWarn(...args)
      }
    }, ownerlessComputationWarning)

    page.on('console', (message) => {
      if (message.type() === 'warning' && message.text().includes(ownerlessComputationWarning)) {
        ownerlessWarnings.push({
          location: message.location(),
          text: message.text(),
        })
      }
    })

    await page.goto(route)
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const warningStacks = await page.evaluate(
      () =>
        (window as typeof window & { __ownerlessSolidWarningStacks?: string[] })
          .__ownerlessSolidWarningStacks ?? [],
    )

    expect({ ownerlessWarnings, warningStacks }).toEqual({
      ownerlessWarnings: [],
      warningStacks: [],
    })
  })
}
