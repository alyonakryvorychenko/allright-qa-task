import { Locator, Page, expect } from '@playwright/test';

const STACK_FIRST_ANSWER = 'div[class*="[ stack ]"] button[data-mode]:first-of-type';
const INFO_PAGE_NEXT_BTN = 'button.btn.fuchsia-secondary';
const IMAGE_PAGE_NEXT_BTN = 'button.btn.fuchsia-secondary';
const HOBBY_OPTION = 'button[data-mode][data-radius="pill"]';
const HOBBY_CONTINUE_BTN = 'button.btn.orange.large';

const CLICK_TIMEOUT = 10000;

export class QuizChoiceSteps {
  readonly stackFirstAnswer: Locator;
  readonly infoNextBtn: Locator;
  readonly imageNextBtn: Locator;
  readonly hobbyOption: Locator;
  readonly hobbyContinueBtn: Locator;

  constructor(page: Page) {
    this.stackFirstAnswer = page.locator(STACK_FIRST_ANSWER);
    this.infoNextBtn = page.locator(INFO_PAGE_NEXT_BTN);
    this.imageNextBtn = page.locator(IMAGE_PAGE_NEXT_BTN);
    this.hobbyOption = page.locator(HOBBY_OPTION);
    this.hobbyContinueBtn = page.locator(HOBBY_CONTINUE_BTN);
  }

  async answerStackQuestion(): Promise<void> {
    await this.stackFirstAnswer.first().click({ timeout: CLICK_TIMEOUT });
  }

  async answerInformationQuestion(): Promise<void> {
    await this.infoNextBtn.click({ timeout: CLICK_TIMEOUT });
  }

  async answerImageQuestion(): Promise<void> {
    await this.imageNextBtn.click({ timeout: CLICK_TIMEOUT });
  }

  async answerChooseHobbyQuestion(): Promise<void> {
    await this.hobbyOption.first().waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });
    await this.hobbyOption.first().click();
    await expect(this.hobbyContinueBtn).toBeEnabled({ timeout: CLICK_TIMEOUT });
    await this.hobbyContinueBtn.click({ timeout: CLICK_TIMEOUT });
  }
}
