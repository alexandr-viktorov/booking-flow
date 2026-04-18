import { test as base } from '@playwright/test';
import { PostcodePage } from './pages/PostcodePage';
import { WasteTypePage } from './pages/waste-type-page/WasteTypePage';
import { SkipSizePage } from './pages/skip-size-page/SkipSizePage';
import { ReviewPage } from './pages/ReviewPage';
import { ConfirmationPage } from './pages/ConfirmationPage';

export { expect } from '@playwright/test';

export const test = base.extend<{
  postcodePage: PostcodePage;
  wasteTypePage: WasteTypePage;
  skipSizePage: SkipSizePage;
  reviewPage: ReviewPage;
  confirmationPage: ConfirmationPage;
}>({
  postcodePage: async ({ page }, use) => {
    await use(new PostcodePage(page));
  },
  wasteTypePage: async ({ page }, use) => {
    await use(new WasteTypePage(page));
  },
  skipSizePage: async ({ page }, use) => {
    await use(new SkipSizePage(page));
  },
  reviewPage: async ({ page }, use) => {
    await use(new ReviewPage(page));
  },
  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
});
