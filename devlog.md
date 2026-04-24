# Development Log - Cornell Dragon Boat Fundraiser App

## [2026-04-24] - Onigiri Pricing Update, Multi-referral System & Game Enhancements
- **Hungry Dragon Game Refresh**:
  - Replaced the crab obstacle with a custom Sailboat SVG icon.
  - Added a new Buoy SVG icon as an obstacle.
  - Redesigned the Game Start Screen with a clear "Treats" vs "Obstacles" instruction grid.
  - Updated gameplay text to clarify objectives ("Catch the treats", "Avoid the obstacles").
- **Onigiri Pricing Adjustment**:
  - Updated Onigiri pricing to $4.00 for a single and $7.00 for a 2-pack (previously $3.00/$7.00 for 1/3).
  - Refactored the UI and logic to transition from "3-pack" bundles to "2-pack" bundles for Onigiri.
  - Adjusted "Better Deal" strike-through pricing to reflect the new discount ($7.00 vs ~~$8.00~~).
- **Multi-Select Referral System**:
  - Replaced the single-choice referral dropdown with a multi-select checkbox grid for better user experience.
  - Updated the form state and submission payload to support multiple selected members.
  - **Admin Dashboard Updates**:
    - Enhanced the Admin view to handle array-based referral data.
    - Updated CSV export and summary statistics to correctly aggregate and display multiple referrals per order.
- **UI & Logic Consistency**:
  - Renamed internal data keys (e.g., `onigiri_3` to `onigiri_2`) to match the new bundle size.
  - Updated the "Ordered Items" visualization to correctly display 2 Onigiri when a bundle is selected.

## [2026-04-21] - Advanced Admin Dashboard & Itemized Reporting
- **Itemized Unit Breakdown**: The Admin Dashboard now automatically calculates and displays total individual units ordered for any fundraiser.
  - For "Onigiri & Egg Tarts", it sums single items and 3-packs (e.g., 1 bundle of 3 = 3 units).
- **Dynamic Dashboard Stats**:
  - Summary cards on the main Admin page now show a mini-breakdown of item totals under "Total Orders".
  - The active fundraiser view includes a detailed itemized breakdown section.
- **Dynamic Table Columns**:
  - The submissions table now dynamically adds columns for specific items (e.g., "Onigiri", "Egg Tarts") depending on the fundraiser selected.
- **Enhanced CSV Export**:
  - Downloaded CSV files now include these itemized columns, making fulfillment easier in Excel/Sheets.
- **Form Status Fix**: Fixed a synchronization issue where the Onigiri form would default to the status of the Chè Thái fundraiser (showing "Closed" incorrectly). All status checks are now fundraiser-specific.
- **Database Cleanup**: Purged historical test submissions and outdated configuration flags (`onigiri-cookies`, `onigiri-tarts`) to clean up the Admin Dashboard.
- **"Cookie" Code Purge**: Renamed all internal code identifiers and imports to remove "Cookie" and "Matcha" references (renamed to `EggTartIcon` and `egg_tart_single/triple`).

## [2026-04-20] - Renamed Fundraiser to Onigiri & Egg Tarts
- Renamed "Matcha Mochi Cookies" to "Onigiri & Egg Tarts" across the entire application.
- Updated `src/pages/forms/OnigiriEggTarts.tsx` and all associated internal references.
- Updated all route paths and internal IDs to `onigiri-egg-tarts`.
- Consistent use of the "&" symbol in all UI titles and labels.

## [2026-04-19] - Onigiri & Matcha Cookies Fundraiser Launch

### Redesign
- Redesigned `CookieIcon.tsx` to match the cute Kawaii aesthetic from the provided reference image.
- Removed white drizzle from `CookieIcon.tsx` per user request for a cleaner look.
- Refined `OnigiriIcon.tsx` and `CookieIcon.tsx` faces:
  - Eyes and blush circles were made smaller for a cuter, more balanced look.
  - Mouths updated to a consistent rounded semicircle style.
- Scaled down header icons from `w-12` to `w-10` to better balance with the central dragon mascot.
- Redesigned `OnigiriIcon.tsx` to match the latest provided reference image:
  - Transitioned from a bubbly shape to a plump, wide rounded triangle body.
  - Implemented thick dark brownish-grey outlines (`#3d3935`).
- Features updated color palettes, expressive eyes with highlights, circular halos (on cookie), leaf detail, and 4-pointed stars.

### Added
- Created `src/components/OnigiriIcon.tsx` and `src/components/CookieIcon.tsx`.
- Integrated cute Onigiri and Matcha White Chocolate Cookie icons into the `OnigiriCookies` form header, placed on either side of the dragon mascot.
- Created `src/pages/forms/OnigiriCookies.tsx` with a single-page scrolling layout.
- Added 2x2 grid for product selection:
  - Row 1: Onigiri (Single/Bundle)
  - Row 2: Matcha Cookies (Single/Bundle)
- Implemented "Better Deal" styling for bundles:
  - Gold border and warm yellow background.
  - "Better Deal" badge.
  - Strikethrough pricing (~~$9.00~~ $7.00).
- Integrated referral system and pickup agreement for April 28th.
- Added a dynamic "Your Order" summary section in the payment step that live-updates as items are selected.
- Added a clear "Total Amount Due" display on the order received confirmation page.
- Added Venmo hyperlink (Hilary Kuang) and Zelle copy button (415-307-1306).
- Updated `src/Home.tsx` to dynamically list multiple active fundraisers (Chè Thái and Onigiri Cookies).
- Added routes for the new fundraiser in `src/App.tsx`.

### Changed
- Replaced "Egg Tarts" with "Matcha Cookies" throughout the application.
- Renamed `src/pages/forms/OnigiriTarts.tsx` to `src/pages/forms/OnigiriCookies.tsx`.
- Updated route from `/onigiri-tarts` to `/onigiri-cookies`.
- Updated `formId` from `onigiri-tarts` to `onigiri-cookies` in the frontend and API calls.
- Updated pricing and item mapping to use `cookie_1` and `cookie_3` instead of `tart_1` and `tart_3`.
- Made referrals optional in Onigiri Cookies form and updated label to "Who referred you? (optional)".
- Simplified payment flow: Removed NetID (for Onigiri form) and Payment ID entry.
- Removed Step 3 (Email Confirmation) from all forms as requested.
- Updated `api/submit.js` to handle different `formId`s and calculate totals dynamically.
- Refactored `api/form-status.js` and `api/toggle-status.js` to support multiple fundraisers by `formId`.

### Fixed
- Resolved a critical backend syntax error (duplicate variable declaration) in `api/submit.js` that caused server startup failures.
- Fixed layout alignment for product counters in the 2x2 grid.
- Fixed header layout to prevent "Home" icon overlapping with the title text by adding horizontal padding and centering.
- Renamed "Matcha Cookies" to "Matcha Mochi Cookies" across the entire application for accuracy.

### Security & Infrastructure
- Ensured all fundraisers are secured via `Config` collection flags in the database.
- Maintained production-ready build and lint standards.
