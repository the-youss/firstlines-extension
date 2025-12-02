# FirstLines Browser Extension (WXT + React)

This extension injects a small UI into LinkedIn Sales Navigator pages and captures API requests and request headers to facilitate exporting lead search data. It is built with WXT and React, using Tailwind and shadcn UI components.

## Features
- Injects an "Export leads" button into Sales Navigator search pages
- Captures XHR payloads for `salesApiPeopleSearch` and `salesApiLeadSearch`
- Records request headers via `webRequest.onBeforeSendHeaders`
- Stores captured data in `browser.storage.local` for background processing

## Quick Start
- Prerequisites: Node.js 18+, `pnpm` installed
- Install dependencies: `pnpm install`
- Run in Chrome: `pnpm dev`
- Run in Firefox: `pnpm dev:firefox`

## Build & Package
- Build for Chrome: `pnpm build`
- Build for Firefox: `pnpm build:firefox`
- Create zip archives: `pnpm zip` or `pnpm zip:firefox`
- Typecheck: `pnpm compile`

After building, load the generated extension as an unpacked extension in your browser using the folder produced by WXT (commonly under `.output`).

## How It Works
- Content script configuration: `entrypoints/content.tsx:8-18`
  - Matches `*://*.linkedin.com/*` and injects UI with WXT's `createShadowRootUi`
- Page script (injected into site context): `entrypoints/--lk--.ts:11-55`
  - Overrides `XMLHttpRequest` to detect Sales Navigator API calls and posts events to the page
- Event capture and storage: `entrypoints/content.tsx:20-27`
  - Listens for `LINKEDIN_API_REQUEST` and saves request data to storage
- UI injection and action: `components/sales-nav-search.tsx:23-48`
  - Renders an "Export leads" button and sends a message to the background script
- Background processing: `entrypoints/background.ts:6-35`
  - Receives messages and records request headers for LinkedIn domains
- Data aggregation (current): `lib/background-fn.ts:3-12`
  - Reads saved request payload and headers and logs the combined object

## Permissions
Defined in `wxt.config.ts:17-23`:
- `activeTab`, `cookies`, `tabs`, `webRequest`, `storage`

## UI & Styling
- Tailwind configuration: `tailwind.config.ts`
- Shared styles: `assets/shadcn.css`
- Reusable components: `components/ui/*`
- Add new UI components: `pnpm add:ui`

## Notes & Troubleshooting
- The injected button uses the selector `components/sales-nav-search.tsx:20`. If LinkedIn changes its layout, update the selector.
- Export logic currently aggregates and logs captured data. Extend `lib/background-fn.ts` to persist or download as needed.

## Directory Overview
- `entrypoints/` — background, content, and page scripts
- `components/` — React components and UI wrappers
- `lib/` — storage, event names, utilities
- `public/` — icons and static assets
- `wxt.config.ts` — WXT manifest and modules
