# NEXAWORKS Dashboard 

A professional, high-performance dashboard application designed for managing projects, invoices, and financial analytics. Built with a focus on modern aesthetics and responsiveness.

## Features

- **Sign-in**: Single studio account. Set `APP_USERNAME` and `APP_PASSWORD` in `.env` to require it (optionally `SESSION_SECRET` so sessions survive restarts). Without them the API stays open and any name signs in.
- **Overview**: Billing, clients, outstanding balance and collection from the studio sheet, with month-over-month changes anchored to the latest month on the sheet.
- **Project Management**: Track active and completed projects with progress indicators and budget monitoring.
- **Invoicing System**: Manage invoices with status tracking (Paid, Pending, Overdue) and automated calculations.
- **Reports**: Detailed financial reporting and data analysis.
- **Design system** (`client/src/index.css`):
  - Graphite surfaces with Nexaworks blue; Bricolage Grotesque for titles and figures, Instrument Sans for UI.
  - Hatching at the slant of the Nexaworks mark means money still owed; solid means collected; grain means overdue.
  - Motion tokens (`--ease-out`, `--ease-in-out`, `lib/motion.ts`) shared by CSS and Motion. Reduced motion is respected everywhere.

## License

This project is proprietary software for NEXAWORKS.
