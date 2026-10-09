import { expect, test } from '@playwright/test'

test('Listy docs virtualize records and expose imperative scrolling', async ({ page }) => {
  await page.goto('/components/listy')
  await page.locator('html[data-docs-hydrated="true"]').waitFor()

  const virtualHeading = page.getByRole('heading', { name: 'Virtual list' })
  const virtualPreview = virtualHeading
    .locator('xpath=following-sibling::*[@data-preview-root][1]')
    .locator('[data-preview-stage]')
  const virtualList = virtualPreview.locator('.ads-listy')

  await expect(virtualList).toBeVisible()
  const renderedItems = virtualList.locator('.ads-listy-item')
  await expect(renderedItems.first()).toBeVisible()
  expect(await renderedItems.count()).toBeLessThan(1000)

  const scrollHeading = page.getByRole('heading', { name: 'Imperative scrolling' })
  const scrollPreview = scrollHeading
    .locator('xpath=following-sibling::*[@data-preview-root][1]')
    .locator('[data-preview-stage]')
  const scrollList = scrollPreview.locator('.ads-listy')

  await scrollPreview.getByRole('button', { name: 'Item 100' }).click()
  await expect.poll(() => scrollList.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
})
