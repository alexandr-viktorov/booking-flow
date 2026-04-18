# Complete Booking Flow — General Waste, 4-yard Skip

## Application Overview

A multi-step booking flow for a waste collection hire service at http://localhost:3000. The flow consists of four sequential steps: (1) Postcode lookup and address selection, (2) Waste type selection, (3) Skip size selection, and (4) Review and confirmation. The app uses a step indicator navigation bar that shows a checkmark (✓) for completed steps. This plan covers one end-to-end test for a general waste booking with a 4-yard skip.

## Test Scenarios

### 1. Complete booking flow — general waste, 4-yard skip

**Seed:** `automation/seed.spec.ts`

#### 1.1. Complete booking flow with general waste and 4-yard skip

**File:** `automation/e2e/general-waste-booking-flow.spec.ts`

**Steps:**
  1. Navigate to the base URL (http://localhost:3000) — the app should redirect to /booking
    - expect: The page URL matches /booking
    - expect: The heading 'Book a Waste Collection' is visible (role=heading, level=1)
    - expect: The postcode input (data-testid='postcode-input') is visible and has an empty value
    - expect: The Continue button (data-testid='step1-next-button') is disabled
    - expect: No step indicators show a checkmark (✓)
  2. Fill the postcode input (data-testid='postcode-input') with the value 'SW1A 1AA'
    - expect: The postcode input has the value 'SW1A 1AA'
  3. Click the 'Find address' button (data-testid='postcode-lookup-button')
    - expect: The address list container (data-testid='address-list') appears
    - expect: The paragraph inside the address list shows the text '12 addresses found'
    - expect: Address option buttons are visible, including a button with the name 'Northumberland Avenue'
  4. Click the address button for 'Northumberland Avenue' (role=button, name='Northumberland Avenue')
    - expect: The selected address button has the CSS class 'border-indigo-500' applied (indicating it is highlighted/selected)
    - expect: The Continue button (data-testid='step1-next-button') becomes enabled
  5. Click the Continue button (data-testid='step1-next-button') to advance to the waste type step
    - expect: The waste type step heading 'What type of waste?' is visible (role=heading)
    - expect: The Postcode step indicator in the navigation shows '✓ Postcode' (role=button, name=/✓.*Postcode/)
    - expect: Three waste type option buttons are visible: data-testid='waste-type-general' ('General waste'), data-testid='waste-type-heavy' ('Heavy waste'), data-testid='waste-type-plasterboard' ('Plasterboard')
    - expect: The Continue button (data-testid='step2-next-button') is disabled
  6. Click the 'General waste' option button (data-testid='waste-type-general')
    - expect: The General waste option button (data-testid='waste-type-general') has the CSS class 'border-indigo-500' applied (indicating it is highlighted/selected)
    - expect: The Continue button (data-testid='step2-next-button') becomes enabled
  7. Click the Continue button (data-testid='step2-next-button') to advance to the skip size step
    - expect: The skip size step heading 'Choose your skip size' is visible (role=heading)
    - expect: The Waste type step indicator shows '✓ Waste type' (role=button, name=/✓.*Waste type/)
    - expect: The heavy waste notice ('Heavy waste — some sizes unavailable') is NOT visible on the page
    - expect: All skip size option buttons are enabled: data-testid='skip-option-2-yard', 'skip-option-4-yard', 'skip-option-6-yard', 'skip-option-8-yard', 'skip-option-10-yard', 'skip-option-12-yard'
    - expect: The 4-yard skip option (data-testid='skip-option-4-yard') contains the text '4-yard' and the price '£120'
    - expect: The Review booking button (data-testid='step3-next-button') is disabled
  8. Click the '4-yard' skip option button (data-testid='skip-option-4-yard')
    - expect: The 4-yard skip option (data-testid='skip-option-4-yard') has the CSS class 'border-indigo-500' applied (indicating it is highlighted/selected)
    - expect: The Review booking button (data-testid='step3-next-button') becomes enabled
  9. Click the 'Review booking' button (data-testid='step3-next-button') to advance to the review step
    - expect: The review step heading 'Review your booking' is visible (role=heading)
    - expect: The Skip size step indicator shows '✓ Skip size' (role=button, name=/✓.*Skip size/)
    - expect: The booking summary section (data-testid='booking-summary') is visible
  10. Inspect the summary table on the review page
    - expect: data-testid='summary-postcode' contains the text 'SW1A 1AA'
    - expect: data-testid='summary-address' contains the text 'Northumberland Avenue, London'
    - expect: data-testid='summary-waste-type' contains the text 'general'
    - expect: data-testid='summary-skip-size' contains the text '4-yard'
  11. Inspect the price breakdown section (data-testid='price-breakdown') on the review page
    - expect: The price breakdown section (data-testid='price-breakdown') is visible
    - expect: The skip hire line item (data-testid='price-skip-hire') or its parent contains the text '£120' and label 'Skip hire'
    - expect: No heavy surcharge line item (data-testid='price-heavy-surcharge') is present in the DOM
    - expect: The total line (data-testid='price-total') contains the text '£120'
  12. Click the 'Confirm booking' button (data-testid='confirm-button')
    - expect: While the request is in flight the button shows a loading state (spinner or text change to 'Confirming…')
    - expect: After the request completes, the booking success section (data-testid='booking-success') is visible
    - expect: The heading 'Booking confirmed' is visible (role=heading)
    - expect: The text 'Your booking reference is:' is visible on the page
    - expect: The booking ID element (data-testid='booking-id') has text matching the pattern /^BK-[A-Z0-9]{4}$/ (e.g. 'BK-1009')
    - expect: The 'Make another booking' button (data-testid='new-booking-button') is visible
  13. Click the 'Make another booking' button (data-testid='new-booking-button')
    - expect: The postcode input (data-testid='postcode-input') is visible and has an empty value
    - expect: The address list container (data-testid='address-list') is not visible
    - expect: The Continue button (data-testid='step1-next-button') is disabled
    - expect: No step indicator in the navigation bar shows a checkmark (✓) — verified by asserting role=button with name=/✓/ is not visible
