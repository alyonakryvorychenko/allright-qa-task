import { Locator, Page } from '@playwright/test';

const COOKIE_POPUP = '.cp-eea';
const COOKIE_ACCEPT_BTN = 'button.cp-eea__btn--secondary:last-of-type';

export class CookieBanner {
  readonly popup: Locator;
  readonly acceptBtn: Locator;

  constructor(page: Page) {
    this.popup = page.locator(COOKIE_POPUP);
    this.acceptBtn = page.locator(COOKIE_ACCEPT_BTN);
  }

  async accept(): Promise<void> {
    await this.popup.waitFor({ state: 'visible' });
    await this.acceptBtn.click();
  }
}
