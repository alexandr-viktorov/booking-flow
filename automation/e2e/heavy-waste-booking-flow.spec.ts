// spec: automation/heavy-waste-booking-flow.plan.md
// seed: automation/seed.spec.ts

import { test, expect } from '../fixtures';
import { WasteType } from '../pages/waste-type-page/WasteType';
import { SkipSize } from '../pages/skip-size-page/SkipSize';

test.describe('Complete booking flow — heavy waste, 6-yard skip', () => {
  test('Complete booking flow with heavy waste and 6-yard skip', async ({
    page,
    postcodePage,
    wasteTypePage,
    skipSizePage,
    reviewPage,
    confirmationPage,
  }) => {
    // 1. Navigate to / (baseURL)
    await page.goto('/');
    await expect(page).toHaveURL(/\/booking/);
    await expect(page.getByRole('heading', { name: 'Book a Waste Collection' })).toBeVisible();
    await expect(postcodePage.postcodeInput).toBeVisible();
    await expect(postcodePage.postcodeInput).toHaveValue('');
    await expect(postcodePage.continueButton).toBeDisabled();

    // 2. Type 'SW1A 1AA' into postcode input
    await postcodePage.enterPostcode('SW1A 1AA');
    await expect(postcodePage.postcodeInput).toHaveValue('SW1A 1AA');

    // 3. Click 'Find address' button
    await postcodePage.findAddress();
    await expect(postcodePage.addressListHeader).toBeVisible();
    await expect(postcodePage.addressListHeader).toHaveText("12 addresses found");
    await expect(await postcodePage.getAddressByText('10 Downing Street')).toBeVisible();

    // 4. Click address '10 Downing Street'
    await postcodePage.selectAddressByText('10 Downing Street');
    await expect(await postcodePage.getAddressByText('10 Downing Street')).toHaveClass(/border-indigo-500/);
    await expect(postcodePage.continueButton).toBeEnabled();

    // 5. Click Continue to step 2
    await postcodePage.continue();
    await expect(wasteTypePage.heading).toBeVisible();
    await expect(wasteTypePage.postcodeStepIndicator).toBeVisible();
    await expect(wasteTypePage.generalWasteOption).toBeVisible();
    await expect(wasteTypePage.heavyWasteOption).toBeVisible();
    await expect(wasteTypePage.plasterboardOption).toBeVisible();
    await expect(wasteTypePage.continueButton).toBeDisabled();

    // 6. Click 'Heavy waste'
    await wasteTypePage.selectWasteType(WasteType.Heavy);
    await expect(await wasteTypePage.getOptionByWatesteType(WasteType.Heavy)).toHaveClass(/border-indigo-500/);
    await expect(wasteTypePage.continueButton).toBeEnabled();

    // 7. Click Continue to step 3
    await wasteTypePage.continue();
    await expect(skipSizePage.heading).toBeVisible();
    await expect(skipSizePage.wasteTypeStepIndicator).toBeVisible();
    await expect(skipSizePage.heavyWasteNotice).toBeVisible();
    await expect(await skipSizePage.skipOption(SkipSize.TwoYard)).toBeDisabled();
    await expect(await skipSizePage.skipOption(SkipSize.FourYard)).toBeDisabled();
    await expect(await skipSizePage.skipOption(SkipSize.SixYard)).toBeEnabled();
    await expect(await skipSizePage.getSkipOptionBySize(SkipSize.SixYard)).toContainText('6-yard');
    await expect(await skipSizePage.getSkipOptionBySize(SkipSize.SixYard)).toContainText('£160');
    await expect(skipSizePage.reviewBookingButton).toBeDisabled();

    // 8. Click '6-yard' skip
    await skipSizePage.selectSkipSize(SkipSize.SixYard);
    await expect(await skipSizePage.skipOption(SkipSize.SixYard)).toHaveClass(/border-indigo-500/);
    await expect(skipSizePage.reviewBookingButton).toBeEnabled();

    // 9. Click 'Review booking'
    await skipSizePage.reviewBooking();
    await expect(reviewPage.heading).toBeVisible();
    await expect(reviewPage.skipSizeStepIndicator).toBeVisible();
    await expect(reviewPage.bookingSummary).toBeVisible();

    // 10. Verify summary table
    await expect(reviewPage.summaryPostcode).toContainText('SW1A 1AA');
    await expect(reviewPage.summaryAddress).toContainText('10 Downing Street, London');
    await expect(reviewPage.summaryWasteType).toContainText('heavy');
    await expect(reviewPage.summarySkipSize).toContainText('6-yard');

    // 11. Verify price breakdown
    await expect(reviewPage.priceBreakdown).toBeVisible();
    await expect(reviewPage.priceSkipHire).toContainText('£160');
    await expect(reviewPage.priceHeavySurcharge).toContainText('£20');
    await expect(reviewPage.priceTotal).toContainText('£180');

    // 12. Click 'Confirm booking'
    await reviewPage.confirmBooking();
    await expect(confirmationPage.successSection).toBeVisible();
    await expect(confirmationPage.heading).toBeVisible();
    await expect(confirmationPage.bookingReferenceLabel).toBeVisible();
    await expect(confirmationPage.bookingId).toHaveText(/^BK-\d{4}$/);
    await expect(confirmationPage.makeAnotherBookingButton).toBeVisible();

    // 13. Click 'Make another booking'
    await confirmationPage.makeAnotherBooking();
    await expect(postcodePage.postcodeInput).toBeVisible();
    await expect(postcodePage.postcodeInput).toHaveValue('');
    await expect(postcodePage.addressListHeader).not.toBeVisible();
    await expect(postcodePage.continueButton).toBeDisabled();
    await expect(postcodePage.firstStepIndicator).not.toBeVisible();
  });
});
