// spec: automation/heavy-waste-booking-flow.plan.md
// seed: automation/seed.spec.ts

import { test, expect } from '../fixtures';
import { SkipSize } from '../pages/skip-size-page/SkipSize';
import { heavyWasteScenario as testData } from '../test-data/test-data';

test.describe('Complete booking flow — heavy waste, 6-yard skip', () => {
  test('Complete booking flow with heavy waste and 6-yard skip', async ({
    page,
    postcodePage,
    wasteTypePage,
    skipSizePage,
    reviewPage,
    confirmationPage,
  }) => {
    // Navigate to / (baseURL)
    await test.step('Navigate to / (baseURL)', async step => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/booking/);
      await expect(page.getByRole('heading', { name: 'Book a Waste Collection' })).toBeVisible();
      await expect(postcodePage.postcodeInput).toBeVisible();
      await expect(postcodePage.postcodeInput).toHaveValue('');
      await expect(postcodePage.continueButton).toBeDisabled();
    });

    // Type 'SW1A 1AA' into postcode input
    await test.step(`Type ${testData.postcode} into postcode input`, async step => {
      await postcodePage.enterPostcode(testData.postcode);
      await expect(postcodePage.postcodeInput).toHaveValue(testData.postcode);
    });

    // Click 'Find address' button
    await test.step("Click 'Find address' button", async step => {
      await postcodePage.findAddress();
      await expect(postcodePage.addressListHeader).toBeVisible();
      await expect(postcodePage.addressListHeader).toHaveText("12 addresses found");
      await expect(await postcodePage.getAddressByText(testData.address)).toBeVisible();
    });

    // Click address '10 Downing Street'
    await test.step(`Click address '${testData.address}'`, async step => {
      await postcodePage.selectAddressByText(testData.address);
      await expect(await postcodePage.getAddressByText(testData.address)).toHaveClass(testData.selectedClass);
      await expect(postcodePage.continueButton).toBeEnabled();
    });

    // Click Continue to step 2
    await test.step("Click Continue to step 2", async step => {
      await postcodePage.continue();
      await expect(wasteTypePage.heading).toBeVisible();
      await expect(wasteTypePage.postcodeStepIndicator).toBeVisible();
      await expect(wasteTypePage.generalWasteOption).toBeVisible();
      await expect(wasteTypePage.heavyWasteOption).toBeVisible();
      await expect(wasteTypePage.plasterboardOption).toBeVisible();
      await expect(wasteTypePage.continueButton).toBeDisabled();
    });

    // Click 'Heavy waste'
    await test.step("Click 'Heavy waste'", async step => {
      await wasteTypePage.selectWasteType(testData.wasteType);
      await expect(await wasteTypePage.getOptionByWatesteType(testData.wasteType)).toHaveClass(testData.selectedClass);
      await expect(wasteTypePage.continueButton).toBeEnabled();
    });

    // Click Continue to step 3
    await test.step("Click Continue to step 3", async step => {
      await wasteTypePage.continue();
      await expect(skipSizePage.heading).toBeVisible();
      await expect(skipSizePage.wasteTypeStepIndicator).toBeVisible();
      await expect(skipSizePage.heavyWasteNotice).toBeVisible();
      await expect(await skipSizePage.skipOption(SkipSize.TwoYard)).toBeDisabled();
      await expect(await skipSizePage.skipOption(SkipSize.FourYard)).toBeDisabled();
      await expect(await skipSizePage.skipOption(testData.skipSize)).toBeEnabled();
      await expect(await skipSizePage.getSkipOptionBySize(testData.skipSize)).toContainText(testData.skipSizeSummaryText);
      await expect(await skipSizePage.getSkipOptionBySize(testData.skipSize)).toContainText(testData.skipSizeDisplayPrice);
      await expect(skipSizePage.reviewBookingButton).toBeDisabled();
    });

    // Click '6-yard' skip
    await test.step(`Click '${testData.skipSize}`, async step => {
      await skipSizePage.selectSkipSize(testData.skipSize);
      await expect(await skipSizePage.skipOption(testData.skipSize)).toHaveClass(testData.selectedClass);
      await expect(skipSizePage.reviewBookingButton).toBeEnabled();
    });

    // Click 'Review booking'
    await test.step("Click 'Review booking'", async step => {
      await skipSizePage.reviewBooking();
      await expect(reviewPage.heading).toBeVisible();
      await expect(reviewPage.skipSizeStepIndicator).toBeVisible();
      await expect(reviewPage.bookingSummary).toBeVisible();
    });

    // Verify summary table
    await test.step("Verify summary table", async step => {
      await expect(reviewPage.summaryPostcode).toContainText(testData.postcode);
      await expect(reviewPage.summaryAddress).toContainText(testData.addressSummary);
      await expect(reviewPage.summaryWasteType).toContainText(testData.wasteTypeSummaryText);
      await expect(reviewPage.summarySkipSize).toContainText(testData.skipSizeSummaryText);
    });

    // Verify price breakdown
    await test.step("Verify price breakdown", async step => {
      await expect(reviewPage.priceBreakdown).toBeVisible();
      await expect(reviewPage.priceSkipHire).toContainText(testData.price.hire);
      await expect(reviewPage.priceHeavySurcharge).toContainText(testData.price.heavySurcharge!);
      await expect(reviewPage.priceTotal).toContainText(testData.price.total);
    });

    // Click 'Confirm booking'
    await test.step("Click 'Confirm booking'", async step => {
      await reviewPage.confirmBooking();
      await expect(confirmationPage.successSection).toBeVisible();
      await expect(confirmationPage.heading).toBeVisible();
      await expect(confirmationPage.bookingReferenceLabel).toBeVisible();
      await expect(confirmationPage.bookingId).toHaveText(/^BK-\d{4}$/);
      await expect(confirmationPage.makeAnotherBookingButton).toBeVisible();
    });

    // Click 'Make another booking'
    await test.step("Click 'Make another booking'", async step => {
      await confirmationPage.makeAnotherBooking();
      await expect(postcodePage.postcodeInput).toBeVisible();
      await expect(postcodePage.postcodeInput).toHaveValue('');
      await expect(postcodePage.addressListHeader).not.toBeVisible();
      await expect(postcodePage.continueButton).toBeDisabled();
      await expect(postcodePage.firstStepIndicator).not.toBeVisible();
    });
  });
});
