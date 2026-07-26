// @ts-check
const { expect } = require('@playwright/test');
const { generateTestEmail, generateTestPhone } = require('./test-data');

const COOKIE_POPUP = '.cp-eea';
const COOKIE_ACCEPT_BTN = 'button.cp-eea__btn--secondary:last-of-type';

const STACK_FIRST_ANSWER = 'div[class*="[ stack ]"] button[data-mode]:first-of-type';
const INFO_PAGE_NEXT_BTN = 'button.btn.fuchsia-secondary';
const IMAGE_PAGE_NEXT_BTN = 'button.btn.fuchsia-secondary';
const INPUT_FIELD = 'input:visible:placeholder-shown';
const INPUT_PHONE_FIELD = 'input[data-intl-tel-input-id="0"]';
const PHONE_COUNTRY_SELECTOR_BTN = 'button.iti__selected-country';
const PHONE_COUNTRY_UKRAINE_OPTION = 'li.iti__country[data-dial-code="380"][data-country-code="ua"]';
const INPUT_CONTINUE_BTN = 'form > button';
const HOBBY_OPTION = 'button[data-mode][data-radius="pill"]';
const HOBBY_CONTINUE_BTN = 'button.btn.orange.large';
const BOOK_LESSON_BTN = 'button.btn.orange';

const USER_ROLE_MODAL = 'dialog.ui-modal[open]';
const USER_ROLE_PARENT_BTN = 'dialog.ui-modal button:has(img[src*="woman"])';

const STEP_COUNTER_SPANS = 'div[class*="step-counter"] span';

const DASHBOARD_URL_PATTERN = /\/dashboard(\/|$|\?)/;
const DASHBOARD_LESSON_TITLE = 'h3.text-title-1.text-white';
const DASHBOARD_LESSON_TITLE_TEXT = 'Підготуйтеся до уроку';

const QUIZ_BASE_URL_PATTERN = /^https:\/\/stage\.allright\.com\//;

const STACK_PAGES = [
  'age-range', 'plan-lesson', 'main-thing', 'schedule-flexibility',
  'child-device', 'speaking-clubs', 'progress', 'homework',
  'lesson-format', 'temperament-child', 'child-know-english'
];
const INFO_PAGES = ['child-device-advice', 'speaking-clubs-info'];
const IMAGE_PAGES = ['repeat-material', 'control-schedule'];
const INPUT_PAGES = ['child-name', 'user-info-name', 'user-info-phone', 'user-info-email'];
const HOBBY_PAGES = ['child-hobby'];
const LESSON_SELECT_TIME = ['lesson-time-select'];

const INPUT_CHILD_NAME = 'Test Child';
const INPUT_USER_NAME = 'Test User';
const CLICK_TIMEOUT = 10000;

class QuizDriver {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.cookiePopup       = page.locator(COOKIE_POPUP);
    this.cookieAcceptBtn   = page.locator(COOKIE_ACCEPT_BTN);
    this.stackFirstAnswer  = page.locator(STACK_FIRST_ANSWER);
    this.infoNextBtn       = page.locator(INFO_PAGE_NEXT_BTN);
    this.imageNextBtn      = page.locator(IMAGE_PAGE_NEXT_BTN);
    this.inputField        = page.locator(INPUT_FIELD);
    this.inputPhoneField   = page.locator(INPUT_PHONE_FIELD);
    this.phoneCountrySelectorBtn = page.locator(PHONE_COUNTRY_SELECTOR_BTN);
    this.phoneCountryUkraineOption = page.locator(PHONE_COUNTRY_UKRAINE_OPTION);
    this.inputContinueBtn  = page.locator(INPUT_CONTINUE_BTN);
    this.hobbyOption       = page.locator(HOBBY_OPTION);
    this.hobbyContinueBtn  = page.locator(HOBBY_CONTINUE_BTN);
    this.bookLessonBtn     = page.locator(BOOK_LESSON_BTN);
    this.userRoleModal     = page.locator(USER_ROLE_MODAL);
    this.userRoleParentBtn = page.locator(USER_ROLE_PARENT_BTN);
    this.dashboardLessonTitle = page.locator(DASHBOARD_LESSON_TITLE);
    this.stepCounterSpans  = page.locator(STEP_COUNTER_SPANS);

    this._handlers = [
      { pages: STACK_PAGES,        method: () => this.answerStackQuestion() },
      { pages: INFO_PAGES,         method: () => this.answerInformationQuestion() },
      { pages: IMAGE_PAGES,        method: () => this.answerImageQuestion() },
      { pages: INPUT_PAGES,        method: () => this.answerInputQuestion() },
      { pages: HOBBY_PAGES,        method: () => this.answerChooseHobbyQuestion() },
      { pages: LESSON_SELECT_TIME, method: () => this.handleLessonSelectTime() },
    ];
  }

  async acceptCookies() {
    await this.cookiePopup.waitFor({ state: 'visible' });
    await this.cookieAcceptBtn.click();
  }

  async answerCurrentQuestion() {
    await expect(this.page, 'Page did not settle on a quiz URL before answering')
      .toHaveURL(QUIZ_BASE_URL_PATTERN, { timeout: CLICK_TIMEOUT });
    await this.page.waitForLoadState('load');

    const suffix = /** @type {string} */ (new URL(this.page.url()).pathname.split('/').pop());
    const handler = this._handlers.find(h => h.pages.includes(suffix));

    if (!handler) throw new Error(`No handler found for quiz page: "${suffix}"`);

    await handler.method();
  }

  async answerStackQuestion() {
    await this.stackFirstAnswer.first().click({ timeout: CLICK_TIMEOUT });
  }

  async answerInformationQuestion() {
    await this.infoNextBtn.click({ timeout: CLICK_TIMEOUT });
  }

  async answerImageQuestion() {
    await this.imageNextBtn.click({ timeout: CLICK_TIMEOUT });
  }

  async selectPhoneCountryUkraine() {
    await this.phoneCountrySelectorBtn.click({ timeout: CLICK_TIMEOUT });
    await this.phoneCountryUkraineOption.click({ timeout: CLICK_TIMEOUT });
    await expect(this.phoneCountrySelectorBtn, 'Country selector does not show Ukraine as selected')
      .toHaveAttribute('title', 'Ukraine', { timeout: CLICK_TIMEOUT });
  }

  /** @param {string} value */
  async fillPhoneField(value) {
    await this.selectPhoneCountryUkraine();
    await this.inputPhoneField.click();
    await this.inputPhoneField.pressSequentially(value, { delay: 50 });
    await expect(this.inputContinueBtn.filter({ visible: true }), `Continue button did not become enabled after entering phone "${value}"`)
    .toBeEnabled({ timeout: CLICK_TIMEOUT });
  }

  async answerInputQuestion() {
    const INPUT_VALUES = {
      'child-name':      INPUT_CHILD_NAME,
      'user-info-name':  INPUT_USER_NAME,
      'user-info-phone': generateTestPhone(),
      'user-info-email': generateTestEmail(),
    };
    const suffix = /** @type {string} */ (new URL(this.page.url()).pathname.split('/').pop());
    const value = /** @type {string} */ (INPUT_VALUES[/** @type {keyof typeof INPUT_VALUES} */ (suffix)]);
    if (suffix === 'user-info-phone') {
      await this.fillPhoneField(value);
    } else {   
      await this.inputField.fill(value);
    }
    await this.inputContinueBtn.first().click({ timeout: CLICK_TIMEOUT });
    if (suffix === 'user-info-name') {
      await this.selectUserRoleInModal();
    }
  }

  async selectUserRoleInModal() {
    await this.userRoleModal.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });
    await this.userRoleParentBtn.click({ timeout: CLICK_TIMEOUT });
  }

  async answerChooseHobbyQuestion() {
    await this.hobbyOption.first().waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });
    await this.hobbyOption.first().click();
    await expect(this.hobbyContinueBtn).toBeEnabled({ timeout: CLICK_TIMEOUT });
    await this.hobbyContinueBtn.click({ timeout: CLICK_TIMEOUT });
  }

  async handleLessonSelectTime() {
    await this.bookLessonBtn.first().waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });
    await this.bookLessonBtn.first().click({ timeout: CLICK_TIMEOUT });
  }

  async getTotalQuizSteps() {
    const totalStepsSpan = this.stepCounterSpans.last();
    await totalStepsSpan.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });

    const totalStepsText = await totalStepsSpan.textContent();
    const totalSteps = Number(totalStepsText?.trim());

    if (!Number.isFinite(totalSteps) || totalSteps <= 0) {
      throw new Error(`Could not determine total quiz steps from step counter, got: "${totalStepsText}"`);
    }

    return totalSteps;
  }

  async completeQuiz() {
    const totalQuizSteps = await this.getTotalQuizSteps();

    for (let step = 0; step < totalQuizSteps; step++) {
      const urlBefore = this.page.url();
      await this.answerCurrentQuestion();
      // await this.page.waitForURL(url => url.toString() !== urlBefore);
      await expect(this.page, `Step ${step + 1}: URL did not change after answering "${urlBefore}"`)
        .not.toHaveURL(urlBefore, { timeout: CLICK_TIMEOUT });
    }
  
    await expect(this.page, 'Quiz did not finish on the dashboard page')
      .toHaveURL(DASHBOARD_URL_PATTERN, { timeout: CLICK_TIMEOUT });
    await expect(this.dashboardLessonTitle, 'Dashboard "prepare for lesson" title is missing')
      .toHaveText(DASHBOARD_LESSON_TITLE_TEXT, { timeout: CLICK_TIMEOUT });
  }
}

module.exports = { QuizDriver };
