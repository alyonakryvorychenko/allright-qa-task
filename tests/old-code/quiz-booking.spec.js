// @ts-check
const { test, expect } = require('@playwright/test');
const { QuizDriver } = require('./helpers/quiz-driver');

const QUIZ_URL = 'https://stage.allright.com/uk/app/sign-up/long/charlie/age-range';

test('opens quiz age-range page', async ({ page }) => {
  const quiz = new QuizDriver(page);

  await page.goto(QUIZ_URL);
  await quiz.acceptCookies();
  await quiz.completeQuiz();
  await page.close();
});
