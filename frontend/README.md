# PeopleSync frontend

Modern Vite + React employee-management interface connected to the Spring Boot API.
It uses Bootstrap CSS for its responsive grid and controls, with a custom CSS
design system for the application’s visual identity. No component framework or
Tailwind CSS is used.

## Local setup

1. Copy `.env.example` to `.env` only if the API path differs from `/api/v1`.
2. Start the backend at `http://localhost:8080`.
3. Use Node.js 22.22.2 LTS or newer supported release, then run `npm ci` and `npm run dev`.
4. Open `http://localhost:3000`.

## Commands

- `npm start` — local development server
- `npm run build` — production build
- `npm test` — build and run frontend checks
- `npm run test:e2e` — run all Playwright browser journeys

## Playwright critical journeys

Install Chromium once, then run the four assessment journeys:

```bash
npx playwright install chromium
npm run test:e2e -- --grep @critical
```

Playwright starts the Vite server automatically. To test an already deployed
frontend instead, disable the local server and provide its URL:

```bash
PLAYWRIGHT_SKIP_WEBSERVER=true \
PLAYWRIGHT_BASE_URL=https://portal.example.com \
npm run test:e2e -- --grep @critical
```

Each test installs an isolated in-browser API fixture, so runs are independent
and do not modify shared backend data. HTML reports are written to
`playwright-report/`; failure screenshots, traces, and videos are written below
`test-results/playwright/artifacts/`.

The frontend expects `VITE_API_URL`, defaulting to the same-origin `/api/v1`.
During development, Vite proxies that path to `http://localhost:8080`; production
should route `/api` to the backend through the deployment reverse proxy. Values
prefixed with `VITE_` are public browser configuration and must never contain secrets.
