import { expect, test } from '@playwright/test'

test('button docs page hydrates and renders demos', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/components/button')
  await page.locator('html[data-docs-hydrated="true"]').waitFor()

  await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible()
  await expect(page.getByRole('complementary').getByRole('link', { name: 'Drawer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Primary Button' })).toBeVisible()
  await expect(page.locator('[data-preview-stage]').first()).toBeVisible()

  await expect(page.locator('aside').first()).toHaveCSS('display', 'flex')
  await expect(page.getByRole('button', { name: 'Primary Button' })).toHaveCSS(
    'background-color',
    'rgb(22, 119, 255)',
  )
  expect(pageErrors).toEqual([])
})
