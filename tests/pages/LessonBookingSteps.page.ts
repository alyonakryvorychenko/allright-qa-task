import { Locator, Page } from '@playwright/test';

const BOOK_LESSON_BTN = 'button.btn.orange';
const CLICK_TIMEOUT = 10000;

export class LessonBookingSteps {
  readonly bookLessonBtn: Locator;

  constructor(page: Page) {
    this.bookLessonBtn = page.locator(BOOK_LESSON_BTN);
  }

  async handleLessonSelectTime(): Promise<void> {
    await this.bookLessonBtn.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });
    await this.bookLessonBtn.click({ timeout: CLICK_TIMEOUT });
  }
}
