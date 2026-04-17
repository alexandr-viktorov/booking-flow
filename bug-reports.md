# Bug Reports — Booking Flow

**Application:** Waste Skip Hire Booking Flow
**Environment:** Chrome 124, Windows 11 / macOS 14, localhost:3000

---

## BUG-001 — [Wrong font color of manualy entered address]

| Field | Details |
|---|---|
| **ID** | BUG-001 |
| **Title** | Wrong font color of manualy entered address |
| **Severity** | Medium |
| **Priority** | P1|
| **Environment** | Chrome, Windows, localhost:3000 |

**Preconditions:**
-

**Steps to Reproduce:**
1. Click on link Enter address manually
2. Enter some address e.g. "11a Downing Street".

**Expected:**
The entered text should be in black color.

**Actual:**
Etrered text has garay font color.

**Evidence:** `ui/bug-001.png`

---

## BUG-002 — [The system allow user to proceed bokking without post code]

| Field | Details |
|---|---|
| **ID** | BUG-002 |
| **Title** | The system allow user to proceed booking without post code|
| **Severity** | Critical  |
| **Priority** | P1 |
| **Environment** | Chrome, Windows, localhost:3000 |

**Preconditions:**
- post code field is empry 

**Steps to Reproduce:**
1. Click on link Enter address manually
2. Enter some address e.g. "11 Downing Street" and press button Continue.
3. Select any Waste type, and press button Continue.

**Expected:**
The system should not allow user to proceed without entered postcode

**Actual:**
There is error message on page Skip Size selection step:
    Something went wrong
    Server error 400

**Evidence:** `ui/bug-002.png`

---

## BUG-003 — [Review step shows post code in wrong format]

| Field | Details |
|---|---|
| **ID** | BUG-003 |
| **Title** | Review step shows post code in wrong format |
| **Severity** | Medium 
| **Priority** | P1 |
| **Environment** | Chrome, Windows, localhost:3000 |

**Preconditions:**
- App loaded, step 1 visible

**Steps to Reproduce:**
1. Enter sw1a 1aa
2. Click "Find address" and select any address. 
3. Procced thru waste and Size selection to Review step 

**Expected:**
Review step shows post code in Upper case in corect for UK postcode format.  

**Actual:**
Review step shows post code in lower case. 
Same situation in case postcode has been enterd w/o spase SW1a1aa

**Evidence:** `ui/bug-003.png`

---

## BUG-004 — [The system allows user to book collection w/o selection of waste type and size]

| Field | Details |
|---|---|
| **ID** | BUG-004 |
| **Title** | The system allows user to book collection w/o selection of waste type and size |
| **Severity** | Critical |
| **Priority** | P1 |
| **Environment** | Browser, OS, localhost:3000 |

**Preconditions:**
- App loaded, step 1 visible

**Steps to Reproduce:**
1. Enter SW1A 1AA. Click "Find address" and select any address. Press Continue.
2. Select any waste type and press Continue.
3. Do not select any skip size. Click on step 4 Review in progress bar.
4. On Review page press button Confirm booking.   


**Expected:**
The system should not allow to click on grayed out step controls on progress bar.

**Actual:**
The error message comes up.
    Something went wrong
    Server error 422

**Evidence:** `ui/bug-004.png`

---

## BUG-005 — [Wrong alligment of elements in case page opend on Samsung Galaxy S8+]

| Field | Details |
|---|---|
| **ID** | BUG-005 |
| **Title** | Wrong alligment of elements in case page opend on Samsung Galaxy S8+ |
| **Severity** | Medium |
| **Priority** | P3 |
| **Environment** | Chrome, Android, localhost:3000 |

**Preconditions:**
-

**Steps to Reproduce:**
1. Open app page on Samsung Galaxy S8+ 

**Expected:**
Page should shown correctly alignet elements

**Actual:**
Wrong alligment of elements in case page opend on Samsung Galaxy S8+

**Evidence:** `ui/bug-005.png`

---
