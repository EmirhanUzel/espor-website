# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build (outputs to dist/)
npm run lint     # ESLint (flat config, jsx files)
npm run preview  # Preview production build locally
```

## Architecture

**Stack:** React 19, React Router v7, Vite 8. No backend — all data is mocked client-side in `src/services/`.

**Routing:** All routes are defined in `src/App.jsx`. Route paths follow the pattern `/entity` (list) and `/entity/:id` (detail). Auto-scrolls to top on navigation.

**State:** Context API only (no Redux/Zustand).
- `src/contexts/LanguageContext.jsx` — EN/TR i18n, persisted to localStorage. All UI text must use `useLanguage().t('key')` and have entries in `src/i18n/translations.js`.
- `src/contexts/ThemeContext.jsx` — Light/dark mode, persisted to localStorage. Dark mode is toggled via a class on `<html>`.
- `src/services/auth.jsx` — Frontend-only demo auth, localStorage-persisted.

**Styling:** CSS Modules (`.module.css` per component/page). No Tailwind. Theme tokens are CSS variables defined in `src/index.css`. Responsive breakpoint is 768px.

**Data layer:** `src/services/api.js` returns mock Liquipedia-style data. `src/services/forum.js` uses localStorage for forum posts/replies. `src/services/playerStats.js` contains the player match history dataset.

**Multi-wiki support:** VALORANT, CS2, and League of Legends tabs — controlled via Navbar dropdown and passed as filter state to pages.

## Key Conventions

- Every new page gets a paired `PageName.module.css` in `src/pages/`.
- Every new component gets a paired `ComponentName.module.css` in `src/components/`.
- New UI strings need entries in both `en` and `tr` objects in `src/i18n/translations.js`.
- CSS variables (colors, spacing) come from `src/index.css` — don't hardcode hex values in component styles.
