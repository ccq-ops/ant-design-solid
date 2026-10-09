import { expect, test } from '@playwright/test'

test.describe('component visual baselines', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium owns canonical snapshots')

  test.use({
    colorScheme: 'light',
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
  })

  test('Button type and variant examples', async ({ page }) => {
    await page.goto('/components/button')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const heading = page.getByRole('heading', { name: 'Color and variant' })
    const stage = heading
      .locator('xpath=following-sibling::*[@data-preview-root][1]')
      .locator('[data-preview-stage]')

    await expect(stage).toHaveScreenshot('button-color-variants.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.03,
    })
  })

  test('Listy grouped sticky list', async ({ page }) => {
    await page.goto('/components/listy')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const heading = page.getByRole('heading', { name: 'Grouping and sticky headers' })
    const stage = heading
      .locator('xpath=following-sibling::*[@data-preview-root][1]')
      .locator('[data-preview-stage]')
    const list = stage.locator('.ads-listy')

    await list.evaluate((element) => {
      element.scrollTop = 260
      element.dispatchEvent(new Event('scroll'))
    })

    await expect(stage).toHaveScreenshot('listy-grouped-sticky.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.03,
    })
  })

  test('Form component controls', async ({ page }) => {
    await page.goto('/components/form')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const heading = page.getByRole('heading', { name: 'Form methods' })
    const stage = heading
      .locator('xpath=following-sibling::*[@data-preview-root][1]')
      .locator('[data-preview-stage]')

    await expect(stage).toHaveScreenshot('form-methods.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.03,
    })
  })
})
