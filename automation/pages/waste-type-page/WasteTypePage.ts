import { type Page, type Locator } from '@playwright/test';
import { WasteType } from './WasteType';

export class WasteTypePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly generalWasteOption: Locator;
  readonly heavyWasteOption: Locator;
  readonly plasterboardOption: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly postcodeStepIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'What type of waste?' });
    this.generalWasteOption = page.getByTestId('waste-type-general');
    this.heavyWasteOption = page.getByTestId('waste-type-heavy');
    this.plasterboardOption = page.getByTestId('waste-type-plasterboard');
    this.continueButton = page.getByTestId('step2-next-button');
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.postcodeStepIndicator = page.getByRole('button', { name: /✓.*Postcode/ });
  }

  async  selectWasteType(testId: WasteType): Promise<void> {
    await this.page.getByTestId(testId).click();
  }

  async getOptionByWatesteType(wasteType: WasteType): Promise<Locator> {
    return this.page.getByTestId(wasteType);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }
}

