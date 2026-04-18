# Complete Booking Flow — Heavy Waste, 6-Yard Skip

## Application Overview

A single-page booking flow at http://localhost:3000 (redirects to /booking). The flow has four sequential steps — Postcode, Waste type, Skip size, Review — each guarded by a stepper navigation bar. State is held client-side. The server-side confirmation endpoint is at POST /api/booking/confirm and returns a booking ID in the form BK-XXXX (numeric counter starting at 1001).

## Test Scenarios

### 1. Complete booking flow — heavy waste and 6-yard skip

**Seed:** `automation/seed.spec.ts`

#### 1.1. Complete booking flow with heavy waste and 6-yard skip

**File:** `automation/heavy-waste-booking-flow.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000
    - expect: The browser redirects to http://localhost:3000/booking
    - expect: The page heading 'Book a Waste Collection' is visible
    - expect: The stepper shows four steps: '1 Postcode', '2 Waste type', '3 Skip size', '4 Review' — all disabled except the current step
    - expect: The postcode input field (placeholder 'e.g. SW1A 1AA') is visible and empty
    - expect: The 'Continue' button is disabled
  2. Type 'SW1A 1AA' into the postcode input field (data-testid='postcode-input')
    - expect: The input field displays 'SW1A 1AA'
  3. Click the 'Find address' button (data-testid='postcode-lookup-button')
    - expect: A list of addresses appears below the input
    - expect: The list shows a header indicating the number of addresses found (e.g. '12 addresses found')
    - expect: Address buttons are rendered, including '10 Downing StreetLondon'
  4. Click the address button for '10 Downing StreetLondon' (data-testid='address-option-addr_1')
    - expect: The selected address button is marked as active/selected
    - expect: The 'Continue' button becomes enabled
  5. Click the 'Continue' button (data-testid='step1-next-button')
    - expect: The view transitions to Step 2 'What type of waste?'
    - expect: The stepper shows step 1 as completed with a checkmark (✓ Postcode)
    - expect: Three waste type options are visible: 'General waste', 'Heavy waste', and 'Plasterboard'
    - expect: The 'Continue' button is disabled until a waste type is selected
  6. Click the 'Heavy waste' option (data-testid='waste-type-heavy') — labelled 'Heavy waste' with description 'Soil, concrete, bricks, rubble, aggregates'
    - expect: The 'Heavy waste' card becomes selected/active
    - expect: The 'Continue' button becomes enabled
  7. Click the 'Continue' button (data-testid='step2-next-button')
    - expect: The view transitions to Step 3 'Choose your skip size'
    - expect: The stepper shows step 2 as completed with a checkmark (✓ Waste type)
    - expect: A notice 'Heavy waste — some sizes unavailable' is displayed
    - expect: The 2-yard and 4-yard skip options are disabled with labels 'Not available' and reason 'Too small for heavy waste loads'
    - expect: The 6-yard option is enabled and shows '6-yard £160'
    - expect: The 'Review booking' button is disabled until a skip is selected
  8. Click the '6-yard £160' skip option (data-testid='skip-option-6-yard')
    - expect: The 6-yard card becomes selected/active
    - expect: The 'Review booking' button becomes enabled
  9. Click the 'Review booking' button (data-testid='step3-next-button')
    - expect: The view transitions to Step 4 'Review your booking'
    - expect: The stepper shows step 3 as completed with a checkmark (✓ Skip size)
    - expect: The booking summary table (data-testid='booking-summary') is displayed
  10. Verify the booking summary fields in the table (data-testid='booking-summary')
    - expect: Postcode row (data-testid='summary-postcode') displays 'SW1A 1AA'
    - expect: Address row (data-testid='summary-address') displays '10 Downing Street, London'
    - expect: Waste type row (data-testid='summary-waste-type') displays 'heavy'
    - expect: Skip size row (data-testid='summary-skip-size') displays '6-yard'
  11. Verify the price breakdown section (data-testid='price-breakdown')
    - expect: There are exactly two line items in the breakdown
    - expect: Line item 1: label 'Skip hire' (data-testid='price-skip-hire') with value '£160'
    - expect: Line item 2: label 'Heavy waste surcharge' (data-testid='price-heavy-surcharge') with value '£20'
    - expect: The total row (data-testid='price-total') displays '£180'
  12. Click the 'Confirm booking' button (data-testid='confirm-button')
    - expect: While the API call is in flight (approx. 600 ms), the button is disabled and its label changes to a spinner icon followed by the text 'Confirming…'
    - expect: The 'Back' button is also disabled during submission
    - expect: After the API responds with success, the success screen (data-testid='booking-success') is displayed
    - expect: The heading 'Booking confirmed' is visible
    - expect: The text 'Your booking reference is:' is visible
    - expect: The booking ID element (data-testid='booking-id') contains a value matching the pattern /^BK-\d{4}$/ (e.g. 'BK-1001')
    - expect: A 'Make another booking' button (data-testid='new-booking-button') is visible
  13. Click the 'Make another booking' button (data-testid='new-booking-button')
    - expect: The view returns to Step 1 'Where should we collect your waste?'
    - expect: The postcode input field (data-testid='postcode-input') is empty — no postcode pre-filled
    - expect: No address list is shown
    - expect: The address selection is cleared
    - expect: The stepper resets: step 1 shows '1 Postcode' (disabled), and no steps show a checkmark
    - expect: The 'Continue' button is disabled
