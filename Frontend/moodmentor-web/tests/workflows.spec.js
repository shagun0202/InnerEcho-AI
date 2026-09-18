import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const email = `refresh-${Date.now()}@example.com`,
  password = 'Qa-password-123'
let account
test.describe.configure({ mode: 'serial' })
async function signIn(page) {
  await page.goto('/')
  await page.evaluate(
    (a) => sessionStorage.setItem('moodmentor-session-v2', JSON.stringify(a)),
    account,
  )
  await page.reload()
  await expect(page.getByLabel('Your message', { exact: true })).toBeVisible()
}
async function accessible(page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([])
}
async function fits(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
}

test('editorial landing, signup, onboarding and mobile companion', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /A healthier workday/ }),
  ).toBeVisible()
  for (const photo of await page.locator('.wellness-photo').all()) {
    await photo.scrollIntoViewIfNeeded()
    await expect(photo).toHaveJSProperty('complete', true)
    expect(await photo.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: 'test-results/landing-desktop.png',
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Connect', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Come back to connection.' }),
  ).toBeVisible()
  await accessible(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await fits(page)
  await page.getByRole('button', { name: 'Make room for yourself' }).click()
  await page.getByLabel('Your name').fill('Wellness QA')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'calm', exact: true }).click()
  await page.getByRole('button', { name: /Enter my wellness space/ }).click()
  await expect(
    page.getByRole('heading', { name: /How’s your mind today/ }),
  ).toBeVisible()
  await expect(
    page.getByRole('complementary', { name: 'Your recommendations' }),
  ).toHaveCount(0)
  await fits(page)
  await accessible(page)
  await page.screenshot({
    path: 'test-results/companion-mobile.png',
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Open navigation' }),
  ).toBeFocused()
  account = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('moodmentor-session-v2')),
  )
  expect(errors).toEqual([])
})

test('unified reflections, recommendations and tools preserve conversation', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await signIn(page)
  await expect(page.locator('.arrival-moments img')).toHaveCount(3)
  await page
    .locator('.arrival-moments img')
    .evaluateAll((images) => Promise.all(images.map((image) => image.decode())))
  await page.screenshot({
    path: 'test-results/companion-desktop.png',
    fullPage: true,
  })
  await accessible(page)
  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await expect(
    page.getByRole('button', { name: 'Collapse sidebar' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  const draft =
    'After several meetings, I felt exhausted and wanted a small break.'
  await page.getByLabel('Your message', { exact: true }).fill(draft)
  await page.getByRole('button', { name: 'Tools', exact: true }).click()
  await page.getByRole('button', { name: /Private reflection Save/ }).click()
  await expect(
    page.getByLabel('Private reflection', { exact: true }),
  ).toHaveValue(draft)
  await page
    .getByRole('button', { name: 'Save reflection', exact: true })
    .click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Reflection saved' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Back to chat' }).click()
  await page
    .getByLabel('Your message', { exact: true })
    .fill('I would like to focus on one small task.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('.conversation-message.assistant')).toHaveCount(2)
  await expect(page.locator('.canvas-plan .plan-card')).toBeVisible()
  await page.screenshot({
    path: 'test-results/companion-conversation.png',
    fullPage: true,
  })
  await page.reload()
  await expect(
    page.locator('.conversation-message.user').filter({ hasText: draft }),
  ).toHaveCount(1)
  await expect(page.locator('.conversation-message.assistant')).toHaveCount(2)
  await page
    .getByLabel('Your message', { exact: true })
    .fill('Keep this unsent thought.')
  await page.getByRole('button', { name: 'Music', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Open Spotify' }),
  ).toHaveAttribute('href', /calm%20instrumental/)
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue(
    'Keep this unsent thought.',
  )
  await page.getByRole('button', { name: 'Step outside' }).click()
  await page.getByLabel('City or area (optional)').fill('Pune')
  await expect(
    page.getByRole('link', { name: 'Search in Google Maps' }),
  ).toHaveAttribute('href', /parks%20Pune/)
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.getByRole('button', { name: 'Meditation', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'A softer pace starts here.' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: /Add The quiet between tasks to favorites/ })
    .click()
  await expect(
    page.getByRole('button', {
      name: /Remove The quiet between tasks from favorites/,
    }),
  ).toBeVisible()
  await page.screenshot({
    path: 'test-results/meditation-tools.png',
    fullPage: true,
  })
  await accessible(page)
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page
    .getByLabel('Your message', { exact: true })
    .fill('I want to kill myself')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(
    page.getByRole('dialog', { name: 'You deserve support.' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Tele-MANAS/ })).toHaveAttribute(
    'href',
    'tel:14416',
  )
  await page.getByRole('button', { name: 'Close support options' }).click()
  expect(errors).toEqual([])
})

test('activity resumes and persists a real two-minute outcome', async ({
  page,
}) => {
  await signIn(page)
  await page.getByRole('button', { name: 'Meditation', exact: true }).click()
  const card = page.locator('.library-card').filter({
    has: page.getByRole('heading', { name: 'Come back to this moment' }),
  })
  await card.getByRole('button', { name: 'Start', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveCount(1)
  await dialog.getByRole('button', { name: 'Low', exact: true }).click()
  await dialog.getByRole('button', { name: 'Begin this moment' }).click()
  await expect(
    dialog.getByRole('button', { name: 'Pause', exact: true }),
  ).toBeVisible()
  await page.waitForTimeout(3000)
  await dialog.getByRole('button', { name: 'Pause', exact: true }).click()
  await dialog.getByRole('button', { name: 'Save & close' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Resume your moment' }).click()
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.screenshot({ path: 'test-results/session-player.png' })
  await expect(
    dialog.getByRole('heading', { name: 'You made a little room.' }),
  ).toBeVisible({ timeout: 135000 })
  await dialog.getByRole('button', { name: 'Good', exact: true }).click()
  await dialog.getByRole('button', { name: 'Yes, it helped' }).click()
  await dialog.getByRole('button', { name: 'Save my check-in' }).click()
  await expect(
    dialog.getByRole('heading', { name: 'One moment, remembered.' }),
  ).toBeVisible()
  await expect(dialog.getByText(/Mood change: \+2/)).toBeVisible()
  await dialog.getByRole('button', { name: /Back to my day/ }).click()
  await expect(page.getByLabel('Your message', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Progress', exact: true }).click()
  await expect(page.getByText('+2 mood', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Moments & reflections' }).click()
  await expect(
    page.getByText(
      'After several meetings, I felt exhausted and wanted a small break.',
    ),
  ).toBeVisible()
})

test('failed login and failed send preserve input and recover', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in to your space' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Invalid email or password',
  )
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in to your space' }).click()
  await page
    .getByLabel('Your message', { exact: true })
    .fill('A draft that should survive a failed request.')
  await page.route('**/chat', (route) => route.abort())
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('alert')).toContainText('Cannot reach MoodMentor')
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue(
    'A draft that should survive a failed request.',
  )
  await page.unroute('**/chat')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue('')
})

test('mobile navigation, recommendations, camera styles and dark mode', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 375, height: 812 })
  await signIn(page)
  await page.getByRole('button', { name: 'Show recommendations' }).click()
  await expect(
    page.getByRole('complementary', { name: 'Your recommendations' }),
  ).toBeVisible()
  await fits(page)
  await page.getByRole('button', { name: 'Close recommendations' }).click()
  for (const name of [
    'Progress',
    'Workplace',
    'Profile',
    'Settings',
    'Companion',
  ]) {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await page.getByRole('link', { name, exact: true }).click()
    await expect(page.locator('.mm-sidebar')).not.toHaveClass(/is-open/)
    await expect(page.locator('.skeleton-grid')).toHaveCount(0)
    await fits(page)
  }
  const before = await page
    .locator('.mm-sidebar')
    .evaluate((el) => getComputedStyle(el).backgroundColor)
  await page.getByRole('button', { name: 'Mood Lens', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Mood Lens', exact: true, level: 1 }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Close dialog' }).click()
  expect(
    await page
      .locator('.mm-sidebar')
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe(before)
  await fits(page)
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await accessible(page)
  await page.screenshot({
    path: 'test-results/companion-dark-mobile.png',
    fullPage: true,
  })
  expect(errors).toEqual([])
})
