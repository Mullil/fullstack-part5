const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('Log in to application')
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').fill('mluukkai')
      await page.getByTestId('password').fill('salainen')
      await page.getByTestId('submit-button').click()
      await expect(page.getByText('Matti Luukkainen is logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('mluukkai')
      await page.getByTestId('password').fill('eisalainen')
      await page.getByTestId('submit-button').click()
      await expect(page.getByText('Matti Luukkainen is logged in')).toBeHidden()
    })
  })
  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId('username').fill('mluukkai')
      await page.getByTestId('password').fill('salainen')
      await page.getByTestId('submit-button').click()
    })
  
    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('title').fill('playwrightTestTitle')
      await page.getByTestId('author').fill('playwrightTestAuthor')
      await page.getByTestId('url').fill('playwrightTestUrl')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('playwrightTestTitle playwrightTestAuthor')).toBeVisible()
    })

    test('a new blog can be liked', async ({ page }) => {
      /* create a blog */
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('title').fill('playwrightTestTitle')
      await page.getByTestId('author').fill('playwrightTestAuthor')
      await page.getByTestId('url').fill('playwrightTestUrl')
      await page.getByRole('button', { name: 'create' }).click()

      /* test liking */
      await page.getByRole('button', { name: 'view' }).first().click()
      let initialLikes = await page.getByTestId('like-count').innerText()
      initialLikes = parseInt(initialLikes.replace('likes', '').trim())
      const likeButton = page.getByTestId('like-button')
      await likeButton.click()
      await expect(page.getByTestId('like-count')).toHaveText(`likes ${initialLikes + 1}`)
    })

    test('a blog can be removed by the owner', async ({ page }) => {
      /* create a blog */
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('title').fill('playwrightTestTitle')
      await page.getByTestId('author').fill('playwrightTestAuthor')
      await page.getByTestId('url').fill('playwrightTestUrl')
      await page.getByRole('button', { name: 'create' }).click()

      /* test remove */
      await page.getByRole('button', { name: 'view' }).first().click()
      page.on('dialog', async dialog => {
        await dialog.accept()
      })
      await page.getByRole('button', { name: 'remove' }).first().click()
      await expect(page.getByText('playwrightTestTitle playwrightTestAuthor')).toBeHidden()
    })

    test('Only the blog creator can see the remove button', async ({ playwright, page }) => {
      /* Create another user */
      const request = await playwright.request.newContext()
      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Testing User',
          username: 'user',
          password: 'secret'
        }
      })

      /* create a blog */
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('title').fill('playwrightTestTitle')
      await page.getByTestId('author').fill('playwrightTestAuthor')
      await page.getByTestId('url').fill('playwrightTestUrl')
      await page.getByRole('button', { name: 'create' }).click()

      /* Logout and login with another user */
      await page.getByRole('button', { name: 'logout' }).click()
      await page.getByTestId('username').fill('user')
      await page.getByTestId('password').fill('secret')
      await page.getByTestId('submit-button').click()

      await page.getByRole('button', { name: 'view' }).first().click()
      await expect(page.getByRole('button', { name: 'remove' })).toBeHidden()
    })

    test('The blogs are sorted by their likes in descending order', async ({ page }) => {
      /* create  blogs */
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('title').fill('blog1')
      await page.getByTestId('author').fill('testAuthor')
      await page.getByTestId('url').fill('testUrl1')
      await page.getByRole('button', { name: 'create' }).click()
      await page.waitForTimeout(100)
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('title').fill('blog2')
      await page.getByTestId('author').fill('testAuthor')
      await page.getByTestId('url').fill('testUrl2')
      await page.getByRole('button', { name: 'create' }).click()
      await page.waitForTimeout(100)

      const buttons = await page.getByRole('button', { name: 'view' }).all()
      await buttons[0].click()
      await buttons[0].click()

      /* like blogs */
      const likeButtons = await page.getByTestId('like-button').all()
      await likeButtons[0].click()
      await page.waitForTimeout(100)
      await likeButtons[0].click()
      await page.waitForTimeout(100)
      await likeButtons[1].click()
      await page.waitForTimeout(100)

      let likes1 = await page.getByTestId('like-count').first().innerText()
      likes1 = parseInt(likes1.replace('likes', '').trim())
      expect(likes1).toBe(2)
      let likes2 = await page.getByTestId('like-count').last().innerText()
      likes2 = parseInt(likes2.replace('likes', '').trim())
      expect(likes2).toBe(1)

      await likeButtons[1].click()
      await page.waitForTimeout(100)
      await likeButtons[1].click()
      await page.waitForTimeout(100)

      let likes3 = await page.getByTestId('like-count').first().innerText()
      likes3 = parseInt(likes3.replace('likes', '').trim())
      expect(likes3).toBe(3)
      let likes4 = await page.getByTestId('like-count').last().innerText()
      likes4 = parseInt(likes4.replace('likes', '').trim())
      expect(likes4).toBe(2)

      /* Create one more blog */
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('title').fill('blog3')
      await page.getByTestId('author').fill('testAuthor')
      await page.getByTestId('url').fill('testUrl3')
      await page.getByRole('button', { name: 'create' }).click()
      await page.waitForTimeout(100)
      await page.getByRole('button', { name: 'view' }).click()

      /* Make sure that blogs are still sorted */
      const finalLikes = await page.getByTestId('like-count').allTextContents()
      const finalLikeCounts = finalLikes.map(likeText => parseInt(likeText.replace('likes', '').trim()))
      for (let i = 0; i < finalLikeCounts.length - 1; i++) {
        expect(finalLikeCounts[i]).toBeGreaterThan(finalLikeCounts[i+1])
      }
    })
  })
})