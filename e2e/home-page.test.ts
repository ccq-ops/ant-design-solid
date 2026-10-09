import { expect, test } from '@playwright/test'

test('docs home page renders hero content', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Ant Design Solid', level: 1 })).toBeVisible()
  await expect(
    page.getByText(
      'Build polished product interfaces with Ant Design-inspired semantics, Solid-native performance, and token-driven theming.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Components' })).toBeVisible()
})
