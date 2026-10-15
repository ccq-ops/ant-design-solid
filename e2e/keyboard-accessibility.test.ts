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

  test('Tabs moves focus and selection while skipping disabled tabs', async ({ page }) => {
    await page.goto('/components/tabs')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const preview = previewAfterHeading(page, 'Basic')
    const overview = preview.getByRole('tab', { name: 'Overview' })
    const usage = preview.getByRole('tab', { name: 'Usage' })

    await overview.focus()
    await page.keyboard.press('ArrowRight')
    await expect(usage).toBeFocused()
    await expect(usage).toHaveAttribute('aria-selected', 'true')
    await expect(preview.getByRole('tabpanel')).toContainText('Usage content')

    await page.keyboard.press('ArrowRight')
    await expect(overview).toBeFocused()
    await expect(overview).toHaveAttribute('aria-selected', 'true')
  })

  test('Slider exposes keyboard value changes through ARIA', async ({ page }) => {
    await page.goto('/components/slider')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const slider = previewAfterHeading(page, 'Basic').getByRole('slider')

    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect(slider).toHaveAttribute('aria-valuenow', '31')
    await page.keyboard.press('PageUp')
    await expect(slider).toHaveAttribute('aria-valuenow', '41')
    await page.keyboard.press('End')
    await expect(slider).toHaveAttribute('aria-valuenow', '100')
  })

  test('Cascader opens and selects a nested path from the keyboard', async ({ page }) => {
    await page.goto('/components/cascader')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const combobox = previewAfterHeading(page, 'Basic').getByRole('combobox')

    await combobox.focus()
    await page.keyboard.press('ArrowDown')
    await expect(combobox).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: 'Hangzhou' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: 'West Lake' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(combobox).toContainText('Zhejiang / Hangzhou / West Lake')
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
  })

  test('TreeSelect opens and selects the first enabled node from the keyboard', async ({
    page,
  }) => {
    await page.goto('/components/tree-select')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const combobox = previewAfterHeading(page, 'Basic').getByRole('combobox')

    await combobox.focus()
    await page.keyboard.press('Enter')
    await expect(combobox).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Enter')
    await expect(combobox).toContainText('Asia')
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
  })

  test('Transfer selects and moves an item from the keyboard', async ({ page }) => {
    await page.goto('/components/transfer')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const preview = previewAfterHeading(page, 'Basic')
    const alpha = preview.getByRole('option', { name: /Alpha/ })
    const beta = preview.getByRole('option', { name: /Beta/ })

    await alpha.focus()
    await page.keyboard.press('ArrowDown')
    await expect(beta).toBeFocused()
    await page.keyboard.press('Home')
    await expect(alpha).toBeFocused()
    await page.keyboard.press('Space')
    await expect(alpha).toHaveAttribute('aria-selected', 'true')

    const moveRight = preview.getByRole('button', { name: 'move selected right' })
    await moveRight.focus()
    await page.keyboard.press('Enter')
    await expect(alpha).toHaveAttribute('data-direction', 'right')
  })

  test('ColorPicker opens from the keyboard and closes with Escape', async ({ page }) => {
    await page.goto('/components/color-picker')
    await page.locator('html[data-docs-hydrated="true"]').waitFor()

    const trigger = previewAfterHeading(page, 'Basic').getByRole('button', {
      name: 'Color Picker',
    })

    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Color Picker Panel' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})
