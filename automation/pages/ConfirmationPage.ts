import { type Page, type Locator } from '@playwright/test';

export class ConfirmationPage {
  readonly page: Page;
  readonly successSection: Locator;
  readonly heading: Locator;
  readonly bookingReferenceLabel: Locator;
  readonly bookingId: Locator;
  readonly makeAnotherBookingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successSection = page.getByTestId('booking-success');
    this.heading = page.getByRole('heading', { name: 'Booking confirmed' });
    this.bookingReferenceLabel = page.getByText('Your booking reference is:');
    this.bookingId = page.getByTestId('booking-id');
    this.makeAnotherBookingButton = page.getByTestId('new-booking-button');
  }

  async makeAnotherBooking(): Promise<void> {
    await this.makeAnotherBookingButton.click();
  }
}
