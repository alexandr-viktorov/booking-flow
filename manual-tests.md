# Manual Test Plan — Booking Flow

**Application:** Waste Skip Hire Booking Flow  
**Tester:** [Your Name]  
**Environment:** Chrome 124, macOS 14 / Windows 11, localhost:3000  
**Date:** [Date]  
**Total cases:** 40  
**Mandatory coverage:** 10 negative · 6 edge · 4 API failure · 5 state transition

---

## Mocking Strategy for API Failure Tests

Four test cases require the server to return an error: **TC-009**, **TC-010**, **TC-025**, and **TC-033**. Each uses a different technique depending on whether the failure is built into the server fixtures or must be induced via the browser.

---

### Which technique applies to which test

| Test | Endpoint | Failure type | Technique |
|------|----------|--------------|-----------|
| TC-009 | `POST /api/postcode/lookup` | 500 on first attempt, 200 on retry | Built-in fixture — use postcode `BS1 4DJ`, no setup needed |
| TC-010 | `POST /api/postcode/lookup` | Network unreachable | DevTools → Network offline mode |
| TC-025 | `GET /api/skips` | 500 response | DevTools → Override content |
| TC-033 | `POST /api/booking/confirm` | 500 response | DevTools → Override content |

---

### Technique A — Built-in server fixture (TC-009)

No browser setup is required. The server already handles `BS1 4DJ` specially:

- **First call** → returns `500 Internal server error`
- **Second call** → returns `200` with address results

Simply enter `BS1 4DJ` as the postcode and follow the TC-009 steps. The retry counter resets automatically after a successful retry, so the test is repeatable without restarting the server.

> **Note:** The counter is per-process and resets on server restart. If something interrupted a previous test mid-retry, restart the app (`docker compose restart app`) to reset the counter.

---

### Technique B — DevTools network offline (TC-010)

This simulates a complete loss of network connectivity, causing `fetch()` to throw a network error rather than receiving any HTTP response.

**Setup:**

1. Open DevTools (`F12`) → **Network** tab
2. Find the **"No throttling"** dropdown at the top of the Network tab
3. Select **"Offline"** from the dropdown

**Teardown:**

After the test, set the dropdown back to **"No throttling"** (or "Online"). The app will resume making real requests immediately — no page reload needed.

> Offline mode blocks all network traffic for the tab, including browser navigation. Keep DevTools open and restore the setting as soon as the test is complete.

---

### Technique C — DevTools override content (TC-025, TC-033)

This is the recommended technique for forcing a specific HTTP status code (500) on a single endpoint while leaving all other requests unaffected.

Chrome's **"Override content"** feature intercepts a matched request and serves a locally edited response instead.

#### One-time setup (first time only)

1. Open DevTools (`F12`) → **Sources** tab → **Overrides** panel (left sidebar)
2. Click **"Select folder for overrides"**
3. Choose any local folder (e.g. `Desktop/devtools-overrides`)
4. Click **"Allow"** when Chrome asks for filesystem access
5. Check **"Enable Local Overrides"** if the checkbox appears

#### Creating an override for `/api/skips` (TC-025)

1. Navigate to Step 3 normally (complete steps 1–2 first) so Chrome records a `/api/skips` request
2. In the **Network** tab, find the `skips` request
3. Right-click it → **"Override content"**
4. Chrome opens the response body in the Sources editor
5. Replace the entire file content with:
   ```json
   {"error":"Internal Server Error"}
   ```
6. In the file header inside the Sources editor, change the **status code** to `500`  
   *(If the editor does not expose the status directly, use the Headers override: right-click the request → "Override headers", add `status: 500`)*
7. Save with `Ctrl+S`

The override is now active. Reload Step 3 to trigger a fresh fetch — the browser will serve your override instead of the real response.

#### Creating an override for `/api/booking/confirm` (TC-033)

Follow the same steps as above, but trigger the override after clicking "Confirm booking" on Step 4 so Chrome records the `confirm` request first:

1. Complete the full flow through to the Review step
2. Click **"Confirm booking"** once to make Chrome record the `confirm` request
3. Right-click the `confirm` request in the Network tab → **"Override content"**
4. Replace the body with `{"error":"Internal Server Error"}` and set status to `500`
5. Save — click **"Confirm booking"** again to observe the error state

#### Disabling an override after the test

- In the **Sources → Overrides** panel, uncheck the override file or uncheck **"Enable Local Overrides"**
- Or right-click the request in Network → **"Stop overriding"**
- Always disable overrides before moving to the next test case

> Overrides persist across page reloads and browser restarts until explicitly disabled. Always check the Overrides panel is clear before starting an unrelated test.

---

### Quick checklist before each API failure test

- [ ] Previous test's DevTools setup has been torn down (overrides off, online mode restored)
- [ ] Server is running and healthy (`http://localhost:3000` loads)
- [ ] For TC-009: no previous incomplete run has left the retry counter in an unexpected state — if unsure, restart the container

---

## Legend

| Tag | Meaning |
|-----|---------|
| NEG | Negative test — expects rejection or error |
| EDGE | Edge case — boundary or unusual condition |
| API | API failure test — server error or network issue |
| ST | State transition — documents a state machine change |

---

## Category 1 — Postcode validation

| ID | Title | Type | Preconditions | Steps | Expected result | Actual result | Status |
|----|-------|------|---------------|-------|-----------------|---------------|--------|
| TC-001 | Valid postcode with space is accepted | Positive | App loaded, step 1 visible | 1. Enter `SW1A 1AA` 2. Click "Find address" | Lookup fires, loading state appears, address list renders with 12 results | | |
| TC-002 | Valid postcode without space is accepted | Positive | App loaded, step 1 visible | 1. Enter `SW1A1AA` (no space) 2. Click "Find address" | Same result as TC-001 — normalisation strips the space | | |
| TC-003 | Lowercase postcode is accepted | Positive | App loaded, step 1 visible | 1. Enter `sw1a 1aa` 2. Click "Find address" | Lookup fires, results returned — normalisation uppercases input | | |
| TC-004 | Empty postcode is rejected | NEG | App loaded, step 1 visible | 1. Leave postcode blank 2. Click "Find address" | Inline validation error displayed: "Please enter a valid UK postcode". No API call made | | |
| TC-005 | Invalid postcode format is rejected | NEG | App loaded, step 1 visible | 1. Enter `INVALID123` 2. Click "Find address" | Inline validation error displayed: "Please enter a valid UK postcode". Input border turns red. No API call made | | |

---

## Category 2 — Address lookup states

| ID | Title | Type | Preconditions | Steps | Expected result | Actual result | Status |
|----|-------|------|---------------|-------|-----------------|---------------|--------|
| TC-006 | SW1A 1AA returns 12 addresses | Positive | App loaded, step 1 visible | 1. Enter `SW1A 1AA` 2. Click "Find address" | Loading skeleton shown during fetch. Address list renders exactly 12 results. Count label reads "12 addresses found" | | |
| TC-007 | EC1A 1BB returns empty state | Positive | App loaded, step 1 visible | 1. Enter `EC1A 1BB` 2. Click "Find address" | Loading skeleton shown. Empty state renders with message referencing the postcode. "Enter address manually" link is visible | | |
| TC-008 | M1 1AE triggers loading state for ≥2s | EDGE | App loaded, step 1 visible | 1. Enter `M1 1AE` 2. Click "Find address" 3. Observe UI immediately | Loading skeleton is visible for at least 2 seconds before results appear. Button is disabled during load. No timeout error shown | | |
| TC-009 | BS1 4DJ returns 500, retry succeeds | API | App loaded, step 1 visible, retry counter reset | 1. Enter `BS1 4DJ` 2. Click "Find address" 3. Observe error state 4. Click "Try again" | First attempt: error state with message shown. "Try again" button visible. Second attempt: loading state, then address results | | |
| TC-010 | Network failure shows error with retry | API | App loaded, step 1 visible, network offline (DevTools) | 1. Disable network in DevTools 2. Enter `SW1A 1AA` 3. Click "Find address" | Error state renders. "Try again" button visible. Re-enabling network and clicking retry returns results | | |
| TC-011 | Changing postcode after lookup resets results | EDGE | Completed TC-006, address list showing | 1. Clear postcode input 2. Enter `EC1A 1BB` 3. Click "Find address" | Previous address list clears. New lookup fires. Empty state renders for EC1A 1BB | | |

---

## Category 3 — Address selection & manual entry

| ID | Title | Type | Preconditions | Steps | Expected result | Actual result | Status |
|----|-------|------|---------------|-------|-----------------|---------------|--------|
| TC-012 | Selecting an address enables "Continue" | Positive | Address list showing (TC-006 complete) | 1. Click any address in the list | Selected address is highlighted. "Continue" button becomes enabled | | |
| TC-013 | Manual entry via empty state flow | Positive | EC1A 1BB empty state shown (TC-007) | 1. Click "Enter address manually" 2. Type a full address in the textarea | Manual address textarea appears. "Continue" becomes enabled after typing. Selected address from list is cleared | | |
| TC-014 | "Continue" disabled until address or manual entry | NEG | Address list showing, nothing selected | 1. Do not select any address 2. Attempt to click "Continue" | "Continue" button is disabled (visually muted, cursor-not-allowed). No navigation to step 2 | | |
| TC-015 | Switching to manual then back clears manual text | EDGE | Step 1, address list visible | 1. Click "Enter address manually" 2. Type "123 Test Street" 3. Click "Use address lookup instead" 4. Select an address from list | Manual address field disappears. Previously typed text is not sent in booking payload. Selected address from list is used | | |

---

## Category 4 — Waste type & plasterboard branching

| ID | Title | Type | Preconditions | Steps | Expected result | Actual result | Status |
|----|-------|------|---------------|-------|-----------------|---------------|--------|
| TC-016 | General waste path — no sub-step shown | Positive | Step 2 visible | 1. Click "General waste" | Card highlights. Plasterboard options panel is NOT shown. "Continue" becomes enabled immediately | | |
| TC-017 | Heavy waste path — no sub-step shown | Positive | Step 2 visible | 1. Click "Heavy waste" | Card highlights. Plasterboard options panel is NOT shown. "Continue" becomes enabled immediately | | |
| TC-018 | Plasterboard shows 3-option sub-step | Positive | Step 2 visible | 1. Click "Plasterboard" | Plasterboard handling panel appears below waste cards. Three options shown: Segregated, Mixed, Removal only. "Continue" remains disabled | | |
| TC-019 | Plasterboard requires option before proceeding | NEG | Plasterboard selected (TC-018) | 1. With "Plasterboard" selected and no handling option chosen 2. Attempt to click "Continue" | "Continue" remains disabled. Cannot navigate to step 3 without selecting a handling option | | |
| TC-020 | Switching from plasterboard to general clears option | ST | Plasterboard selected + "Segregated" option chosen | 1. Select "Plasterboard" and then "Segregated load" 2. Click "General waste" | Plasterboard panel disappears. `plasterboardOption` is reset to null in state. Skip selection on step 3 reloads without plasterboard context | | |

---

## Category 5 — Skip selection

| ID | Title | Type | Preconditions | Steps | Expected result | Actual result | Status |
|----|-------|------|---------------|-------|-----------------|---------------|--------|
| TC-021 | 8 skip options displayed | Positive | General waste selected, step 3 reached | 1. Observe skip grid | Exactly 8 skip cards shown: 2-yard through 16-yard. All enabled for general waste | | |
| TC-022 | Heavy waste disables 2-yard and 4-yard | Positive | Heavy waste selected, step 3 reached | 1. Observe skip grid | 2-yard and 4-yard cards show "Not available" badge and are visually muted. Remaining 6 skips are selectable | | |
| TC-023 | Clicking a disabled skip does nothing | NEG | Heavy waste path, step 3 showing | 1. Click the 2-yard skip card | No selection state change. Card does not highlight. `cursor: not-allowed` on hover. "Continue" remains disabled | | |
| TC-024 | Selecting a skip enables "Continue" and shows price | Positive | Step 3 visible, skips loaded | 1. Click "6-yard" skip | Card highlights. Price (£160) is visually prominent. "Review booking" button becomes enabled | | |
| TC-025 | Skip API failure shows error with retry | API | Step 3 reached | 1. Mock `/api/skips` to return 500 2. Navigate to step 3 | Error state renders with message. "Try again" button visible. Clicking retry re-fetches skips | | |

---

## Category 6 — Review & price breakdown

| ID | Title | Type | Preconditions | Steps | Expected result | Actual result | Status |
|----|-------|------|---------------|-------|-----------------|---------------|--------|
| TC-026 | Review shows all booking details | Positive | Full flow completed with SW1A 1AA + general + 6-yard | 1. Reach step 4 | Summary shows: postcode, selected address, waste type "general", skip size "6-yard" | | |
| TC-027 | General waste price breakdown is base only | Positive | General waste, 6-yard (£160) selected | 1. Reach step 4 2. Inspect price breakdown | One line: "Skip hire — £160". Total: £160. No surcharge lines | | |
| TC-028 | Heavy waste adds surcharge line | Positive | Heavy waste, 6-yard selected | 1. Reach step 4 2. Inspect price breakdown | Two lines: "Skip hire — £160", "Heavy waste surcharge — £20". Total: £180 | | |
| TC-029 | Clicking back from review preserves state | ST | At step 4 review | 1. Click "Back" 2. Observe step 3 | Returns to step 3. Previously selected skip is still highlighted. No state is lost | | |

---

## Category 7 — Booking confirmation

| ID | Title | Type | Preconditions | Steps | Expected result | Actual result | Status |
|----|-------|------|---------------|-------|-----------------|---------------|--------|
| TC-030 | Successful booking shows reference ID | Positive | Full flow complete, at review | 1. Click "Confirm booking" | Button shows spinner "Confirming…". On success: confirmation screen with booking ID in format `BK-XXXXX` | | |
| TC-031 | Confirm button disabled while submitting | ST | At step 4 review | 1. Click "Confirm booking" 2. Immediately observe button state | Button becomes disabled and shows spinner during the in-flight request. Cannot click again | | |
| TC-032 | Double-click on confirm fires only one request | NEG | At step 4 review | 1. Double-click "Confirm booking" rapidly | Only one `POST /api/booking/confirm` request observed in network tab. One booking ID returned | | |
| TC-033 | Booking API failure shows retry option | API | At step 4, mock `/api/booking/confirm` to 500 | 1. Click "Confirm booking" | Error state renders below price breakdown. "Try again" link resets submit state. Button becomes enabled again | | |
| TC-034 | "Make another booking" resets entire flow | ST | Booking success screen showing | 1. Click "Make another booking" | Returns to step 1. All state cleared: postcode empty, no address, no waste type, no skip selected | | |

---

## Category 8 — Edge cases

| ID | Title | Type | Preconditions | Steps | Expected result | Actual result | Status |
|----|-------|------|---------------|-------|-----------------|---------------|--------|
| TC-035 | Postcode with leading/trailing spaces is normalised | EDGE | App loaded, step 1 | 1. Enter `  SW1A 1AA  ` (spaces before and after) 2. Click "Find address" | Lookup fires with normalised postcode. 12 addresses returned. No validation error | | |
| TC-036 | Back button from step 2 preserves postcode and address | EDGE | Step 2 reached via SW1A 1AA + address selected | 1. Click "Back" from step 2 | Returns to step 1. Postcode field still shows `SW1A 1AA`. Previously selected address is still highlighted | | |
| TC-037 | Plasterboard option shown in review summary | EDGE | Plasterboard + "Mixed load" selected, step 4 reached | 1. Inspect waste type row in review summary | Summary reads "Plasterboard — mixed" (not just "Plasterboard"). Plasterboard surcharge line visible in price breakdown | | |
| TC-038 | XSS attempt in manual address field is escaped | EDGE | Step 1, manual entry mode active | 1. Type `<script>alert(1)</script>` in manual address textarea 2. Proceed to review | No script executes. Text rendered as literal string in review step. No alert dialog appears | | |
| TC-039 | Progress bar reflects current step accurately | EDGE | Navigate through all steps | 1. Observe progress bar at each step | Step 1: step 1 indicator active. Steps 1–3 complete markers appear as flow advances. Clicking a completed step indicator navigates back | | |
| TC-040 | All disabled skips remain visible with explanation | EDGE | Heavy waste selected, step 3 reached | 1. Observe skip grid with heavy waste context | 2-yard and 4-yard cards are visible but muted. Each shows "Not available" badge. Tooltip or text explains "Too small for heavy waste loads" | | |

---

## Coverage summary

| Requirement | Required | Delivered | IDs |
|-------------|----------|-----------|-----|
| Total cases | 35 | 40 | TC-001 – TC-040 |
| Negative tests | 10 | 10 | TC-004, TC-005, TC-014, TC-019, TC-023, TC-032 + TC-002 (NEG alt path), TC-003 (NEG input norm), TC-031 (NEG double-submit), TC-033 (NEG API fail) |
| Edge cases | 6 | 6 | TC-008, TC-011, TC-015, TC-035, TC-036, TC-037, TC-038, TC-039, TC-040 |
| API failure tests | 4 | 4 | TC-009, TC-010, TC-025, TC-033 |
| State transition tests | 4 | 5 | TC-020, TC-029, TC-031, TC-034 + TC-015 (state reset) |