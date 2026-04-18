import { type Page, type Locator } from '@playwright/test';
import { SkipSize } from './SkipSize';

export class SkipSizePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly heavyWasteNotice: Locator;
  readonly reviewBookingButton: Locator;
  readonly backButton: Locator;
  readonly wasteTypeStepIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Choose your skip size' });
    this.heavyWasteNotice = page.getByText('Heavy waste — some sizes unavailable');
    this.reviewBookingButton = page.getByTestId('step3-next-button');
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.wasteTypeStepIndicator = page.getByRole('button', { name: /✓.*Waste type/ });
  }

  skipOption(testId: SkipSize): Locator {
    return this.page.getByTestId(testId);
  }

  async selectSkipSize(testId: SkipSize): Promise<void> {
    await this.page.getByTestId(testId).click();
  }

  async getSkipOptionBySize(testId: SkipSize): Promise<Locator> {
    return this.page.getByTestId(testId);
  }

  async reviewBooking(): Promise<void> {
    await this.reviewBookingButton.click();
  }
}
