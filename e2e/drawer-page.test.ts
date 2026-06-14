import { expect, test } from '@playwright/test'

test('drawer getContainer false renders inside current container on docs page', async ({
  page,
}) => {
  await page.goto('/components/drawer')

  const heading = page.getByRole('heading', { name: 'Render In Current Container' })
  await heading.scrollIntoViewIfNeeded()

  const preview = heading
    .locator('xpath=following-sibling::section[1]')
    .locator('[data-preview-stage]')
  await preview.getByRole('button', { name: 'Open' }).click()

  const drawerRoot = preview.locator('.ads-drawer-root')
  await expect(drawerRoot).toHaveCount(1)

  const bounds = await drawerRoot.evaluate((root) => {
    const rect = root.getBoundingClientRect()
    const host = root.parentElement
    const hostRect = host?.getBoundingClientRect()

    return {
      root: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      host: hostRect
        ? {
            left: hostRect.left,
            top: hostRect.top,
            right: hostRect.right,
            bottom: hostRect.bottom,
          }
        : undefined,
    }
  })

  expect(bounds.host).toBeTruthy()
  expect(bounds.root.left).toBeGreaterThanOrEqual(bounds.host!.left)
  expect(bounds.root.top).toBeGreaterThanOrEqual(bounds.host!.top)
  expect(bounds.root.right).toBeLessThanOrEqual(bounds.host!.right)
  expect(bounds.root.bottom).toBeLessThanOrEqual(bounds.host!.bottom)
})
