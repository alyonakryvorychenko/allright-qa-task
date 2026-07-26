import { Locator, Page, expect } from '@playwright/test';

const DASHBOARD_URL_PATTERN = /\/dashboard(\/|$|\?)/;
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

  async expectLessonReady(): Promise<void> {
    await expect(this.page, 'Quiz did not finish on the dashboard page')
      .toHaveURL(DASHBOARD_URL_PATTERN, { timeout: CLICK_TIMEOUT });
    await expect(this.lessonTitle, 'Dashboard "prepare for lesson" title is missing')
      .toHaveText(DASHBOARD_LESSON_TITLE_TEXT, { timeout: CLICK_TIMEOUT });
  }
}
