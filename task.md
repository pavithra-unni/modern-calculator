# Implementation Plan: Modern Calculator App

Based on [prd.md](file:///c:/Users/pl/Desktop/New%20folder%20%282%29/anti/prd.md), this execution plan details a step-by-step implementation for building a fast, accurate, responsive, accessible, and visually stunning modern web calculator.

---

## Task Overview & Architecture Guidelines
- **Tech Stack:** HTML5, Modern Vanilla CSS3, Vanilla JavaScript (ES6+ standard modules).
- **Design Aesthetic:** Premium dark glassmorphism theme, modern typography (Inter/Outfit via Google Fonts), soft ambient gradients, crisp tactile button states, zero overflow layout.
- **Engine Principles:** Decoupled calculation engine (pure logic), strict floating-point sanitization, robust edge-case handling.

---

## Phase 1: Project Setup & Design System Foundation

### Goal
Establish the project directory structure, HTML semantic boilerplate, accessible DOM structure, and CSS design system with custom properties and responsive utility classes.

### Tasks
- [x] **1.1 Directory Structure & Files Creation**
  - Create `index.html`
  - Create `styles.css`
  - Create `js/engine.js` (Calculation logic module)
  - Create `js/app.js` (DOM & Event controller module)
- [x] **1.2 HTML Boilerplate & Semantic Layout**
  - Include Google Font (`Inter` or `Outfit` with fallback `system-ui`).
  - Create main container layout `<main role="calculator" aria-label="Modern Calculator">`.
  - Create Display container with dual readout lines:
    - `.expression-display` (`aria-live="polite"` for previous inputs/operations)
    - `.result-display` (`aria-live="assertive"` for primary current result/input)
  - Create Button Grid using standard semantic `<button>` elements with `data-action` and `data-value` attributes.
- [x] **1.3 CSS Design System & Theme Variables**
  - Define color tokens: background, surface background, active operator hues, accent colors, visually subtle neutral keys, text primary, text muted.
  - Setup glassmorphism CSS properties: `backdrop-filter: blur()`, semi-transparent borders, multi-layer drop shadows.
  - Setup flexbox/grid layout centering calculator in viewport with responsive boundaries.
  - Implement CSS reset and smooth transitions for state changes (focus, active hover).

### Verification Phase 1
- Open `index.html` in browser. Verify layout visual presentation, centered placement, font loading, grid alignment, and clean rendering without horizontal scrollbars.

---

## Phase 2: Decoupled Calculator Engine (`js/engine.js`)

### Goal
Implement pure calculator logic that processes user key operations and maintains state independently of the DOM.

### Tasks
- [x] **2.1 Calculator State Model**
  - State attributes: `currentInput` (string), `previousInput` (string), `operator` (string|null), `overwriteOnNextInput` (boolean), `hasError` (boolean), `errorMessage` (string|null).
- [x] **2.2 Core Operation Logic**
  - Implement mathematical operations: Addition (`+`), Subtraction (`-`), Multiplication (`×`), Division (`÷`), Percentage (`%`).
  - Implement precision helper function `formatNumber(val)` to handle floating-point precision issues (e.g. `0.1 + 0.2 = 0.3` instead of `0.30000000000000004`).
  - Support sci-notation or display formatting for extreme numbers (> 12 digits or very small numbers).
- [x] **2.3 Edge Case & Input Guarding Rules**
  - **Division by Zero:** Set `hasError = true`, `errorMessage = "Cannot divide by zero"`. Never output `NaN` or `Infinity`.
  - **Multiple Decimal Points:** Prevent appending a second `.` to a number segment (e.g., `5.2.3` -> ignore second `.`).
  - **Consecutive Operators:** Replace active operator when a new operator is pressed immediately after (e.g. `10 + ×` becomes `10 ×`).
  - **Leading Zeroes:** Handle `00`, `0005` correctly -> converts to `5`.
  - **Backspace Logic:** Remove last character of `currentInput`. If empty or single zero, reset to `"0"`. Handle backspace when in error or result state safely.
  - **Percentage Logic:** Standard percentage behavior (e.g., `100 * 10% = 10` or direct `50% = 0.5`).
- [x] **2.4 Exported Engine API**
  - `inputDigit(digit)`
  - `inputDecimal()`
  - `inputOperator(op)`
  - `calculateResult()`
  - `executePercentage()`
  - `executeBackspace()`
  - `reset()`
  - `getState()`

### Verification Phase 2
- Run standalone JS module tests / console checks verifying calculations:
  - `2 + 3 = 5`
  - `10 - 4 = 6`
  - `6 * 7 = 42`
  - `20 / 5 = 4`
  - `2.5 + 1.5 = 4`
  - `10 / 0 = Error`
  - `5.2.3 = 5.2`

---

## Phase 3: UI Controller & Mouse/Touch Event Wiring (`js/app.js`)

### Goal
Connect UI buttons to the calculator engine, render dynamic display updates, handle auto-font scaling for long expressions, and provide micro-animations.

### Tasks
- [x] **3.1 Event Handling for Button Grid**
  - Use event delegation on `.calculator-grid` to handle all button clicks.
  - Map `data-action` types: `number`, `decimal`, `operator`, `equals`, `clear`, `backspace`, `percent`.
- [x] **3.2 Display Renderer & Dynamic Text Scaling**
  - Update `.expression-display` with operation history (e.g., `12 + 8 ×`).
  - Update `.result-display` with current value or calculated output.
  - Add auto-scaling font size logic or overflow scroll handling if character length exceeds display container width.
- [x] **3.3 Interactive Visual Feedback & Styling**
  - Highlight current active operator button when waiting for next operand.
  - Apply active scale animation (`transform: scale(0.96)`) on button press.
  - Render crisp Error UI state when `hasError` is true (e.g. red/amber subtle glow, clear instructions to press `AC` or start new entry).

### Verification Phase 3
- Test all buttons manually with mouse and touch clicks in browser.
- Verify clear action (`AC`), backspace (`⌫`), equals (`=`), and continuous chained operations (`12 + 8 * 3`).

---

## Phase 4: Keyboard Input & Accessibility (A11y)

### Goal
Provide complete keyboard support and full screen-reader accessibility.

### Tasks
- [x] **4.1 Keyboard Listener Registration**
  - Add `keydown` event listener to document.
  - Map physical keyboard keys:
    - Numbers `0-9` -> `inputDigit`
    - `+`, `-`, `*`, `/` -> `inputOperator` (`*` maps to `×`, `/` maps to `÷`)
    - `.` or `,` -> `inputDecimal`
    - `%` -> `executePercentage`
    - `Enter` or `=` -> `calculateResult`
    - `Backspace` -> `executeBackspace`
    - `Escape` or `c`/`C` -> `reset`
  - Prevent default browser behaviors where appropriate (e.g. `Backspace` navigating back, `Enter` re-triggering focused button unexpectedly).
- [x] **4.2 Visual Focus & Button Pressed Triggers**
  - When matching key is pressed, trigger visual press effect on corresponding DOM button.
  - Ensure high-contrast keyboard focus indicators (`:focus-visible` outline ring).
- [x] **4.3 ARIA & Screen Reader Enhancement**
  - Assign aria-labels to symbol buttons (e.g., `aria-label="Divide"` for `÷`, `aria-label="Clear all"` for `AC`).
  - Ensure results and error messages are read by screen readers using appropriate `aria-live` region updates.

### Verification Phase 4
- Complete a full calculation using keyboard only.
- Verify focus indicators are clearly visible on key tab navigation.

---

## Phase 5: Responsive Design & Mobile Optimization

### Goal
Ensure the calculator looks and feels like a native app across all device form factors (mobile, tablet, laptop, desktop).

### Tasks
- [x] **5.1 Responsive Media Queries**
  - Set viewport boundaries and maximum container width (`max-width: 400px` for desktop center, fluid width for mobile).
  - Ensure grid buttons adjust height dynamically maintain min touch target size (>= 44x44px).
- [x] **5.2 Mobile Touch Polish**
  - Disable double-tap zoom on button clicks (`touch-action: manipulation`).
  - Disable text selection on calculator body (`user-select: none`).
  - Test portrait and landscape orientation reflow.

### Verification Phase 5
- Resize browser viewport down to 320px width (Mobile Small) up to 4K resolution. Confirm zero horizontal scroll, legible text, and usable touch buttons.

---

## Phase 6: Edge Case Testing, Acceptance Audit & Polish

### Goal
Perform complete verification against PRD Acceptance Criteria (Section 16) and Edge Cases (Section 12).

### Edge Case Matrix Verification
- [x] Test `0`, `00`, `0005` (Leading zeros handled correctly).
- [x] Test `0.5`, `.5`, `5.` (Decimal normalization).
- [x] Test `5.5 + 2.5` -> `8`.
- [x] Test `10 / 0` -> Shows friendly error, no `NaN`/`Infinity`.
- [x] Test `5.2.3` -> Ignores invalid second decimal point.
- [x] Test `10 + * 5` -> Operator replacement to `10 * 5 = 50`.
- [x] Test Backspace on empty input -> No crash, stays `0`.
- [x] Test calculation chain: `100 - 25 + 10 = 85`.
- [x] Test typing number after pressing `=` -> starts fresh calculation.
- [x] Test pressing operator after `=` -> continues calculation with previous result.

### Acceptance Criteria Checklist Audit (PRD Sec 16)
- [x] All number, arithmetic, decimal, percentage, negative, AC, Backspace, Equals controls work.
- [x] Keyboard, touch, mouse controls functional.
- [x] No `NaN` or `Infinity` exposed.
- [x] Responsive & accessible visual polish complete.

---

## Deliverables Summary
1. `index.html` - Complete semantic HTML layout.
2. `styles.css` - Responsive glassmorphism CSS design system.
3. `js/engine.js` - Fully tested, decoupled calculator engine.
4. `js/app.js` - Integrated UI controller with keyboard & touch support.
