// @ts-check
const { test, expect } = require('@playwright/test');

const QUIZ_URL = 'https://stage.allright.com/uk/app/sign-up/long/charlie/age-range';

test('opens quiz age-range page', async ({ page }) => {
  await page.goto(QUIZ_URL);
  await expect(page).toHaveURL(QUIZ_URL);
  await page.close();
});
