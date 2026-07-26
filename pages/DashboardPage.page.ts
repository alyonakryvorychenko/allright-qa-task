import { Locator, Page, expect } from '@playwright/test';

const DASHBOARD_URL_PATTERN = /\/dashboard(\/|$|\?)/;
const TERMINAL_URL_PATTERN = /\/(dashboard|request-gotten)(\/|$|\?)/;
const DASHBOARD_LESSON_TITLE = 'h3.text-title-1.text-white';
const DASHBOARD_LESSON_TITLE_TEXT = 'Підготуйтеся до уроку';
const CLICK_TIMEOUT = 10000;

export class DashboardPage {
  readonly page: Page;
  readonly lessonTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lessonTitle = page.locator(DASHBOARD_LESSON_TITLE);
  }

  /** True once the quiz has landed on either the dashboard or the "request-gotten" A/B variant. */
  isTerminalPage(): boolean {
    return TERMINAL_URL_PATTERN.test(this.page.url());
  }

  async expectLessonReady(): Promise<void> {
    await expect(this.page, 'Quiz did not finish on the dashboard or request-received page')
      .toHaveURL(TERMINAL_URL_PATTERN, { timeout: CLICK_TIMEOUT });

    if (DASHBOARD_URL_PATTERN.test(this.page.url())) {
      await expect(this.lessonTitle, 'Dashboard "prepare for lesson" title is missing')
        .toHaveText(DASHBOARD_LESSON_TITLE_TEXT, { timeout: CLICK_TIMEOUT });
    }
  }
}
