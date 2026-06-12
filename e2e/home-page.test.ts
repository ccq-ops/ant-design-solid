import { expect, test } from '@playwright/test'

test('docs home page renders hero content', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Ant Design Solid', level: 1 })).toBeVisible()
  await expect(page.getByText('SolidJS · Design System · Token Driven')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Components' })).toBeVisible()
})
