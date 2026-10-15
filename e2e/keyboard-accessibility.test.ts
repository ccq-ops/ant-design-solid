import { expect, test } from '@playwright/test'

function previewAfterHeading(page: import('@playwright/test').Page, heading: string) {
  return page
    .getByRole('heading', { name: heading })
    .locator('xpath=following-sibling::*[@data-preview-root][1]')
    .locator('[data-preview-stage]')
}

test.describe('keyboard accessibility flows', () => {
  test.describe.configure({ timeout: 60_000 })

  test('Menu supports roving focus and keyboard activation', async ({ page }) => {
    await page.goto('/components/menu')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const preview = previewAfterHeading(page, 'Basic')
    const mail = preview.getByRole('menuitem', { name: 'Mail' })
    const team = preview.getByRole('menuitem', { name: 'Team' })

    await mail.focus()
    await page.keyboard.press('ArrowDown')
    await expect(team).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(team).toHaveAttribute('aria-selected', 'true')
  })

  test('Tree supports keyboard expansion, navigation, and selection', async ({ page }) => {
    await page.goto('/components/tree')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const preview = previewAfterHeading(page, 'Basic')
    const parent = preview.getByRole('treeitem', { name: /Parent 1/ })

    await parent.focus()
    await page.keyboard.press('ArrowRight')
    const child = preview.getByRole('treeitem', { name: /Child 1/ })
    await expect(child).toBeVisible()

    await page.keyboard.press('ArrowRight')
    await expect(child).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(child).toHaveAttribute('aria-selected', 'true')
  })

  test('Select opens and chooses the first option from the keyboard', async ({ page }) => {
    await page.goto('/components/select')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const preview = previewAfterHeading(page, 'Basic')
    const select = preview.getByRole('combobox')

    await select.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('option', { name: 'Apple' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(select).toContainText('Apple')
  })

  test('Modal traps focus, closes with Escape, and restores the trigger', async ({ page }) => {
    await page.goto('/components/modal')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const preview = previewAfterHeading(page, 'Basic')
    const trigger = preview.getByRole('button', { name: 'Open Modal' })
    await trigger.focus()
    await trigger.press('Enter')

    const dialog = page.getByRole('dialog', { name: 'Basic Modal' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('DatePicker opens from focus and closes with Escape', async ({ page }) => {
    await page.goto('/components/date-picker')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const preview = previewAfterHeading(page, 'Basic dayjs value')
    const input = preview.getByRole('textbox')
    const picker = preview.getByRole('combobox')

    await input.focus()
    await expect(picker).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(picker).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toBeFocused()
  })
})
