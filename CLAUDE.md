# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server on port 5175 with HMR
npm run build    # Production build (outputs to dist/)
npm run lint     # ESLint (flat config, jsx files)
npm run preview  # Preview production build locally
```

No test suite — there are no test files in this project.

## Environment Variables

Create a `.env.local` file with:
```
VITE_LIQUIPEDIA_API_KEY=...
VITE_PANDASCORE_API_KEY=...
```

The Vite dev server proxies `/liquipedia-api` → `https://api.liquipedia.net/api/v3` and injects the auth header server-side. Without these keys, CS2 data falls back to the mock layer in `src/services/api.js`.

## Architecture

**Stack:** React 19, React Router v7, Vite 8. No backend — all data is mocked client-side in `src/services/`, with optional real API calls for CS2.

**Routing:** All routes are defined in `src/App.jsx`. Route paths follow the pattern `/entity` (list) and `/entity/:id` (detail). Auto-scrolls to top on navigation.

**`wiki` prop:** `App.jsx` holds `wiki` state (`"valorant"` | `"counterstrike"` | `"leagueoflegends"`) and `region` state, set by the Navbar dropdown. Both are passed as props to pages that need to filter by game. Pages that are game-agnostic (e.g. `/forum`, `/profile`) don't receive `wiki`.

**State:** Context API only (no Redux/Zustand).
- `src/contexts/LanguageContext.jsx` — EN/TR i18n, persisted to localStorage. All UI text must use `useLanguage().t('key')` and have entries in `src/i18n/translations.js`.
- `src/contexts/ThemeContext.jsx` — Light/dark mode, persisted to localStorage. Dark mode is applied as a `.dark` class on `<html>`.
- `src/services/auth.jsx` — Frontend-only demo auth, localStorage-persisted.

**Styling:** CSS Modules (`.module.css` per component/page). No Tailwind. Theme tokens are CSS variables defined in `src/index.css`. Responsive breakpoint is 768px. The `.wrap` utility class sets `max-width: 1280px` with auto margins. Never hardcode hex values — use the CSS variables (`--bg`, `--text-1`, `--surface`, `--border`, etc.).

**Data layer:**
- `src/services/api.js` — mock Liquipedia-style data for all three games (tournaments, matches, players, teams, news, transfers). Source of truth when real APIs are unavailable.
- `src/services/liquipediaApi.js` — real Liquipedia API v3, CS2 only. Has a serial request queue (1.1s between requests) and two-layer cache: in-memory (10 min) + localStorage (30 min). Backs off 30 min after a 429/403.
- `src/services/pandascoreApi.js` — PandaScore API for CS2 player stats. Direct browser fetch (CORS enabled), token appended as query param, localStorage cache (1 hour).
- `src/services/forum.js` — localStorage-backed forum posts/replies with seed data.
- `src/services/playerStats.js` — static player match history dataset.

## Key Conventions

- Every new page gets a paired `PageName.module.css` in `src/pages/`.
- Every new component gets a paired `ComponentName.module.css` in `src/components/`.
- New UI strings need entries in both `en` and `tr` objects in `src/i18n/translations.js`.
- Use `getFlag(nationality)` from `src/services/api.js` for flag emojis. Use `formatDate`, `formatPrize`, `tierLabel` from the same file.
