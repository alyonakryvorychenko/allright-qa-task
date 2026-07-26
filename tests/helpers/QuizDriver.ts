import { Page, expect } from '@playwright/test';
import { CookieBanner } from '../pages/CookieBanner.page';
import { QuizChoiceSteps } from '../pages/QuizChoiceSteps.page';
import { QuizInputSteps, InputStepSuffix } from '../pages/QuizInputSteps.page';
import { LessonBookingSteps } from '../pages/LessonBookingSteps.page';
import { DashboardPage } from '../pages/DashboardPage.page';

const STEP_COUNTER_SPANS = 'div[class*="step-counter"] span';
const QUIZ_BASE_URL_PATTERN = /^https:\/\/stage\.allright\.com\//;
const CLICK_TIMEOUT = 10000;

const STACK_PAGES = [
  'age-range', 'plan-lesson', 'main-thing', 'schedule-flexibility',
  'child-device', 'speaking-clubs', 'progress', 'homework',
  'lesson-format', 'temperament-child', 'child-know-english',
];
const INFO_PAGES = ['child-device-advice', 'speaking-clubs-info'];
const IMAGE_PAGES = ['repeat-material', 'control-schedule'];
const INPUT_PAGES = ['child-name', 'user-info-name', 'user-info-phone', 'user-info-email'];
const HOBBY_PAGES = ['child-hobby'];
const LESSON_SELECT_TIME = ['lesson-time-select'];

export class QuizDriver {
  readonly page: Page;
  readonly cookieBanner: CookieBanner;
  readonly choiceSteps: QuizChoiceSteps;
  readonly inputSteps: QuizInputSteps;
  readonly lessonBooking: LessonBookingSteps;
  readonly dashboard: DashboardPage;

  private readonly stepCounterSpans;
  private readonly handlers: { pages: string[]; method: (suffix: string) => Promise<void> }[];

  constructor(page: Page) {
    this.page = page;
    this.cookieBanner = new CookieBanner(page);
    this.choiceSteps = new QuizChoiceSteps(page);
    this.inputSteps = new QuizInputSteps(page);
    this.lessonBooking = new LessonBookingSteps(page);
    this.dashboard = new DashboardPage(page);

    this.stepCounterSpans = page.locator(STEP_COUNTER_SPANS);

    this.handlers = [
      { pages: STACK_PAGES, method: () => this.choiceSteps.answerStackQuestion() },
      { pages: INFO_PAGES, method: () => this.choiceSteps.answerInformationQuestion() },
      { pages: IMAGE_PAGES, method: () => this.choiceSteps.answerImageQuestion() },
      { pages: INPUT_PAGES, method: (suffix) => this.inputSteps.answerInputQuestion(suffix as InputStepSuffix) },
      { pages: HOBBY_PAGES, method: () => this.choiceSteps.answerChooseHobbyQuestion() },
      { pages: LESSON_SELECT_TIME, method: () => this.lessonBooking.handleLessonSelectTime() },
    ];
  }

  async acceptCookies(): Promise<void> {
    await this.cookieBanner.accept();
  }

  private currentSuffix(): string {
    return new URL(this.page.url()).pathname.split('/').pop() ?? '';
  }

  async answerCurrentQuestion(): Promise<void> {
    await expect(this.page, 'Page did not settle on a quiz URL before answering')
      .toHaveURL(QUIZ_BASE_URL_PATTERN, { timeout: CLICK_TIMEOUT });
    await this.page.waitForLoadState('load');

    const suffix = this.currentSuffix();
    const handler = this.handlers.find((h) => h.pages.includes(suffix));

    if (!handler) throw new Error(`No handler found for quiz page: "${suffix}"`);

    await handler.method(suffix);
  }

  async getTotalQuizSteps(): Promise<number> {
    const totalStepsSpan = this.stepCounterSpans.last();
    await totalStepsSpan.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });

    const totalStepsText = await totalStepsSpan.textContent();
    const totalSteps = Number(totalStepsText?.trim());

    if (!Number.isFinite(totalSteps) || totalSteps <= 0) {
      throw new Error(`Could not determine total quiz steps from step counter, got: "${totalStepsText}"`);
    }

    return totalSteps;
  }

  async completeQuiz(): Promise<void> {
    const totalQuizSteps = await this.getTotalQuizSteps();

    for (let step = 0; step < totalQuizSteps; step++) {
      if (this.dashboard.isTerminalPage()) break;

      const urlBefore = this.page.url();
      await this.answerCurrentQuestion();
      await expect(this.page, `Step ${step + 1}: URL did not change after answering "${urlBefore}"`)
        .not.toHaveURL(urlBefore, { timeout: CLICK_TIMEOUT });
    }

    await this.dashboard.expectLessonReady();
  }
}
