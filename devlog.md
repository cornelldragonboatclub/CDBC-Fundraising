# Development Log - Cornell Dragon Boat Fundraiser App

## [2026-04-19] - Onigiri & Egg Tarts Fundraiser Launch

### Added
- Created `src/pages/forms/OnigiriTarts.tsx` with a single-page scrolling layout.
- Added 2x2 grid for product selection:
  - Row 1: Onigiri (Single/Bundle)
  - Row 2: Egg Tarts (Single/Bundle)
- Implemented "Better Deal" styling for bundles:
  - Gold border and warm yellow background.
  - "Better Deal" badge.
  - Strikethrough pricing (~~$9.00~~ $7.00).
- Integrated referral system and pickup agreement for April 28th.
- Added Venmo hyperlink (Hilary Kuang) and Zelle copy button (415-307-1306).
- Updated `src/Home.tsx` to dynamically list multiple active fundraisers (Chè Thái and Onigiri Tarts).
- Added routes for the new fundraiser in `src/App.tsx`.

### Changed
- Simplified payment flow: Removed NetID (for Onigiri form) and Payment ID entry.
- Removed Step 3 (Email Confirmation) from all forms as requested.
- Updated `api/submit.js` to handle different `formId`s and calculate totals dynamically.
- Refactored `api/form-status.js` and `api/toggle-status.js` to support multiple fundraisers by `formId`.

### Fixed
- Resolved a critical backend syntax error (duplicate variable declaration) in `api/submit.js` that caused server startup failures.
- Fixed layout alignment for product counters in the 2x2 grid.

### Security & Infrastructure
- Ensured all fundraisers are secured via `Config` collection flags in the database.
- Maintained production-ready build and lint standards.
