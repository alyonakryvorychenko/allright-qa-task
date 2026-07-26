import { Locator, Page, expect } from '@playwright/test';
import { generateTestEmail, generateTestPhone } from '../helpers/test-data';

const INPUT_FIELD = 'input:visible:placeholder-shown';
const INPUT_PHONE_FIELD = 'input[data-intl-tel-input-id="0"]';
const PHONE_COUNTRY_SELECTOR_BTN = 'button.iti__selected-country';
const PHONE_COUNTRY_UKRAINE_OPTION = 'li.iti__country[data-dial-code="380"][data-country-code="ua"]';
const INPUT_CONTINUE_BTN = 'form > button';

const USER_ROLE_MODAL = 'dialog.ui-modal[open]';
const USER_ROLE_PARENT_BTN = 'dialog.ui-modal button:has(img[src*="woman"])';

const INPUT_CHILD_NAME = 'Test Child';
const INPUT_USER_NAME = 'Test User';
const CLICK_TIMEOUT = 10000;

export type InputStepSuffix = 'child-name' | 'user-info-name' | 'user-info-phone' | 'user-info-email';

export class QuizInputSteps {
  readonly inputField: Locator;
  readonly inputPhoneField: Locator;
  readonly phoneCountrySelectorBtn: Locator;
  readonly phoneCountryUkraineOption: Locator;
  readonly inputContinueBtn: Locator;
  readonly userRoleModal: Locator;
  readonly userRoleParentBtn: Locator;

  private userEmail = '';

  constructor(page: Page) {
    this.inputField = page.locator(INPUT_FIELD);
    this.inputPhoneField = page.locator(INPUT_PHONE_FIELD);
    this.phoneCountrySelectorBtn = page.locator(PHONE_COUNTRY_SELECTOR_BTN);
    this.phoneCountryUkraineOption = page.locator(PHONE_COUNTRY_UKRAINE_OPTION);
    this.inputContinueBtn = page.locator(INPUT_CONTINUE_BTN);
    this.userRoleModal = page.locator(USER_ROLE_MODAL);
    this.userRoleParentBtn = page.locator(USER_ROLE_PARENT_BTN);
  }

  async answerInputQuestion(suffix: InputStepSuffix): Promise<void> {
    const INPUT_VALUES: Record<InputStepSuffix, string> = {
      'child-name': INPUT_CHILD_NAME,
      'user-info-name': INPUT_USER_NAME,
      'user-info-phone': generateTestPhone(),
      'user-info-email': generateTestEmail(),
    };
    const value = INPUT_VALUES[suffix];

    if (suffix === 'user-info-email') {
      this.userEmail = value;
    }

    if (suffix === 'user-info-phone') {
      await this.fillPhoneField(value);
    } else {
      await this.inputField.fill(value);
    }

    await this.inputContinueBtn.filter({ visible: true }).first().click({ timeout: CLICK_TIMEOUT });

    if (suffix === 'user-info-name') {
      await this.selectUserRoleInModal();
    }
  }

  async selectPhoneCountryUkraine(): Promise<void> {
    await this.phoneCountrySelectorBtn.click({ timeout: CLICK_TIMEOUT });
    await this.phoneCountryUkraineOption.click({ timeout: CLICK_TIMEOUT });
    await expect(this.phoneCountrySelectorBtn, 'Country selector does not show Ukraine as selected')
      .toHaveAttribute('title', 'Ukraine', { timeout: CLICK_TIMEOUT });
  }

  async fillPhoneField(value: string): Promise<void> {
    await this.selectPhoneCountryUkraine();
    await this.inputPhoneField.click();
    await this.inputPhoneField.pressSequentially(value, { delay: 50 });
    await expect(this.inputContinueBtn.filter({ visible: true }).first(), `Continue button did not become enabled after entering phone "${value}"`)
      .toBeEnabled({ timeout: CLICK_TIMEOUT });
  }

  async selectUserRoleInModal(): Promise<void> {
    await this.userRoleModal.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });
    await this.userRoleParentBtn.click({ timeout: CLICK_TIMEOUT });
  }

  getUserEmail(): string {
    return this.userEmail;
  }
}
