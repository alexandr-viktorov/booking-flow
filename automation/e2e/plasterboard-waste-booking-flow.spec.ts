// spec: automation/plasterboard-waste-booking-flow.plan.md
// seed: automation/seed.spec.ts

import { test, expect } from '../fixtures';
import { WasteType } from '../pages/waste-type-page/WasteType';
import { SkipSize } from '../pages/skip-size-page/SkipSize';
import { PlasterboardOption } from '../pages/waste-type-page/PlasterboardOption';

test.describe('Complete booking flow — plasterboard waste, 4-yard skip, mixed handling', () => {
  test('Complete booking flow with plasterboard waste and 4-yard skip, ', async ({
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
    await expect(await postcodePage.getAddressByText('70 Whitehall')).toBeVisible();

    // 4. Click address '70 Whitehall'
    await postcodePage.selectAddressByText('70 Whitehall');
    await expect(await postcodePage.getAddressByText('70 Whitehall')).toHaveClass(/border-indigo-500/);
    await expect(postcodePage.continueButton).toBeEnabled();

    // 5. Click Continue to step 2
    await postcodePage.continue();
    await expect(wasteTypePage.heading).toBeVisible();
    await expect(wasteTypePage.postcodeStepIndicator).toBeVisible();
    await expect(wasteTypePage.generalWasteOption).toBeVisible();
    await expect(wasteTypePage.heavyWasteOption).toBeVisible();
    await expect(wasteTypePage.plasterboardOption).toBeVisible();
    await expect(wasteTypePage.continueButton).toBeDisabled();

    // 6. Click 'Plasterboard waste'
    await wasteTypePage.selectWasteType(WasteType.Plasterboard);
    await expect(await wasteTypePage.getOptionByWatesteType(WasteType.Plasterboard)).toHaveClass(/border-indigo-500/);
    await expect(wasteTypePage.plasterboardHandlingMethod).toBeVisible();

    // 7. Click 'Mixed' plasterboard handling method
    await wasteTypePage.selectPlasterboardHandlingMethod(PlasterboardOption.Mixed);
    await expect(await wasteTypePage.getPlasterboardHandlingMethodByType(PlasterboardOption.Mixed)).toHaveClass(/border-amber-500/);
    await expect(wasteTypePage.continueButton).toBeEnabled();

    // 8. Click Continue to step 3
    await wasteTypePage.continue();
    await expect(skipSizePage.heading).toBeVisible();
    await expect(skipSizePage.wasteTypeStepIndicator).toBeVisible();
    await expect(await skipSizePage.skipOption(SkipSize.TwoYard)).toBeEnabled();
    await expect(await skipSizePage.skipOption(SkipSize.FourYard)).toBeEnabled();
    await expect(await skipSizePage.skipOption(SkipSize.SixYard)).toBeEnabled();
    await expect(await skipSizePage.getSkipOptionBySize(SkipSize.FourYard)).toContainText('4-yard');
    await expect(await skipSizePage.getSkipOptionBySize(SkipSize.FourYard)).toContainText('£120');
    await expect(skipSizePage.reviewBookingButton).toBeDisabled();

    // 9. Click '4-yard' skip
    await skipSizePage.selectSkipSize(SkipSize.FourYard);
    await expect(await skipSizePage.skipOption(SkipSize.FourYard)).toHaveClass(/border-indigo-500/);
    await expect(skipSizePage.reviewBookingButton).toBeEnabled();

    // 10. Click 'Review booking'
    await skipSizePage.reviewBooking();
    await expect(reviewPage.heading).toBeVisible();
    await expect(reviewPage.skipSizeStepIndicator).toBeVisible();
    await expect(reviewPage.bookingSummary).toBeVisible();

    // 11. Verify summary table
    await expect(reviewPage.summaryPostcode).toContainText('SW1A 1AA');
    await expect(reviewPage.summaryAddress).toContainText('70 Whitehall, London');
    await expect(reviewPage.summaryWasteType).toContainText('Plasterboard');
    await expect(reviewPage.summaryWasteType).toContainText('mixed');
    await expect(reviewPage.summarySkipSize).toContainText('4-yard');

    // 12. Verify price breakdown
    await expect(reviewPage.priceBreakdown).toBeVisible();
    await expect(reviewPage.priceSkipHire).toContainText('£120');
    await expect(reviewPage.pricePlasterboardSurcharge).toContainText('£40');
    await expect(reviewPage.priceTotal).toContainText('£160');

    // 13. Click 'Confirm booking'
    await reviewPage.confirmBooking();
    await expect(confirmationPage.successSection).toBeVisible();
    await expect(confirmationPage.heading).toBeVisible();
    await expect(confirmationPage.bookingReferenceLabel).toBeVisible();
    await expect(confirmationPage.bookingId).toHaveText(/^BK-\d{4}$/);
    await expect(confirmationPage.makeAnotherBookingButton).toBeVisible();

    // 14. Click 'Make another booking'
    await confirmationPage.makeAnotherBooking();
    await expect(postcodePage.postcodeInput).toBeVisible();
    await expect(postcodePage.postcodeInput).toHaveValue('');
    await expect(postcodePage.addressListHeader).not.toBeVisible();
    await expect(postcodePage.continueButton).toBeDisabled();
    await expect(postcodePage.firstStepIndicator).not.toBeVisible();
  });
});
