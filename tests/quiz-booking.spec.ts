import { test } from '@playwright/test';
import { QuizDriver } from '../helpers/QuizDriver';

const QUIZ_URL = 'https://stage.allright.com/uk/app/sign-up/long/charlie/age-range';

test('Quiz completion creates user and books trial lesson', async ({ page }) => {
  const quiz = new QuizDriver(page);

  await page.goto(QUIZ_URL);
  await quiz.acceptCookies();
  await quiz.completeQuiz();
  await page.close()
});
