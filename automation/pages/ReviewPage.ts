import { type Page, type Locator } from '@playwright/test';

export class ReviewPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly bookingSummary: Locator;
  readonly summaryPostcode: Locator;
  readonly summaryAddress: Locator;
  readonly summaryWasteType: Locator;
  readonly summarySkipSize: Locator;
  readonly priceBreakdown: Locator;
  readonly priceSkipHire: Locator;
  readonly priceHeavySurcharge: Locator;
  readonly pricePlasterboardSurcharge: Locator;
  readonly priceTotal: Locator;
  readonly confirmButton: Locator;
  readonly backButton: Locator;
  readonly skipSizeStepIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Review your booking' });
    this.bookingSummary = page.getByTestId('booking-summary');
    this.summaryPostcode = page.getByTestId('summary-postcode');
    this.summaryAddress = page.getByTestId('summary-address');
    this.summaryWasteType = page.getByTestId('summary-waste-type');
    this.summarySkipSize = page.getByTestId('summary-skip-size');
    this.priceBreakdown = page.getByTestId('price-breakdown');
    this.priceSkipHire = page.getByTestId('price-skip-hire').locator('..');
    this.priceHeavySurcharge = page.getByTestId('price-heavy-surcharge').locator('..');
    this.pricePlasterboardSurcharge = page.getByTestId('price-plasterboard-surcharge').locator('..');
    this.priceTotal = page.getByTestId('price-total');
    this.confirmButton = page.getByTestId('confirm-button');
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.skipSizeStepIndicator = page.getByRole('button', { name: /✓.*Skip size/ });
  }

  async confirmBooking(): Promise<void> {
    await this.confirmButton.click();
  }

  priceLineItems(): Locator {
    return this.priceBreakdown.locator('[data-testid^="price-"]').filter({ hasNot: this.page.getByTestId('price-total') });
  }
}
