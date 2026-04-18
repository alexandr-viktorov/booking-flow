import { type Page, type Locator } from '@playwright/test';

export class PostcodePage {
  readonly page: Page;
  readonly postcodeInput: Locator;
  readonly findAddressButton: Locator;
  readonly addressListHeader: Locator;
  readonly continueButton: Locator;
  readonly firstStepIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.postcodeInput = page.getByTestId('postcode-input');
    this.findAddressButton = page.getByTestId('postcode-lookup-button');
    this.continueButton = page.getByTestId('step1-next-button');
    this.addressListHeader = page.locator('[data-testid="address-list"] p');
    this.firstStepIndicator = page.getByRole('button', {  name: /✓/ });
  }

  async enterPostcode(postcode: string): Promise<void> {
    await this.postcodeInput.fill(postcode);
  }

  async findAddress(): Promise<void> {
    await this.findAddressButton.click();
  }

  async selectAddress(testId: string): Promise<void> {
    await this.page.getByTestId(testId).click();
  }

  async selectAddressByText(address: string): Promise<void> {
    await this.page.getByRole('button', { name: address }).click();
  }

  addressOption(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }
  async getAddressByText(address: string): Promise<Locator> {
    return this.page.getByRole('button', { name: address });
  }
}
