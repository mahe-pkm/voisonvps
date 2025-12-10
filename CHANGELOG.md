# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-12-10

### Added
- **Multi-Profile Support**: Manage multiple business entities/seller profiles from a single dashboard.
- **Dynamic Currency**: Support for multiple currencies (INR, USD, EUR, GBP, AED) with symbol rendering.
- **Image Uploads**: Local file upload system for Company Logo, Seal, Signature, and UPI QR code.
- **Modern UI**: Complete visual overhaul using Glassmorphism, blurred backdrops, and framer-motion animations.
- **Sidebar Navigation**: Collapsible, animated sidebar with active state indicators.
- **Print Templates**: Three professional invoice templates (Classic, Modern, Minimal).
- **PDF Generation**: Robust Puppeteer-based PDF generation for invoices.

### Changed
- Rebranded application to **Vois**.
- Updated `CompanyProfile` schema to include currency and bank details.
- Refactored `DashboardLayout` to use the new `Sidebar` component.
- Improved `Combobox` and `Select` components with proper z-indexing and solid backgrounds.

### Fixed
- Resolved hydration mismatch errors in the main layout.
- Fixed key prop warnings in Invoice Template rendering.
- Corrected server action logic to verify the active profile before updates.

### Security
- Implemented `suppressHydrationWarning` for benign layout shifts.
- Validated file upload types to restrict non-image files.
