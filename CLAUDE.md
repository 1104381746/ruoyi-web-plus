# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **ruoyi-web**, a Vue 3 AI chat application built with TypeScript, Vite, and Element Plus. It provides a chat interface for AI interactions with support for sessions, models, deep thinking, and various authentication methods.

## Commands

```bash
# Development
pnpm dev              # Start Vite dev server

# Build
pnpm build            # Type-check (vue-tsc) then build for production

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm lint:stylelint   # Run Stylelint with auto-fix
pnpm fix              # Auto-fix ESLint issues

# Preview production build
pnpm preview          # Vite preview server

# Git commits (conventional commits)
pnpm commit           # Interactive commit via cz-git (commitizen)
```

### Docker development

```bash
docker-compose up -d  # Start backend services locally
```

## Architecture

### Tech Stack

- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** for type safety
- **Vite 6** as build tool
- **Pinia** for state management with persistence (`pinia-plugin-persistedstate`)
- **Vue Router 4** for routing with navigation guards + NProgress
- **Element Plus** for UI components, with `vue-element-plus-x` extensions
- **UnoCSS** for atomic CSS with custom shortcuts
- **hook-fetch** for HTTP requests with SSE streaming support
- **ECharts 6** for embedded charts in chat responses
- **unplugin-auto-import** / **unplugin-vue-components** — auto-imports Vue APIs and Element Plus components

### Directory Structure

```
src/
├── api/           # API modules (auth, chat, model, session) with types
├── assets/        # Static assets (SVG icons organized by category)
├── components/    # Reusable components (ChatSender, DeepThinking, LoginDialog, ModelSelect, etc.)
├── config/        # App configuration constants (route white lists, auth settings)
├── constants/     # Enum definitions
├── hooks/         # Custom Vue composables
├── layouts/       # Layout components (LayoutVertical, LayoutMobile)
├── pages/         # Page components (chat, error pages)
├── routers/       # Route definitions and navigation guards
├── stores/        # Pinia stores (user, chat, session, model, design)
├── styles/        # Global SCSS styles and variables (var.scss injected via Vite)
└── main.ts        # App entry point — registers Element Plus icons globally
```

### Key Patterns

**API Layer** (`src/api/`):
- Each module has `index.ts` for API calls and `types.ts` for TypeScript interfaces
- Uses `hook-fetch` with JWT plugin for authentication
- Base URL configured via `VITE_API_URL` environment variable
- SSE streaming handled by `sseTextDecoderPlugin` from hook-fetch

**State Management** (`src/stores/`):
- Stores use Composition API style with `defineStore`
- User store persists token and userInfo via pinia-plugin-persistedstate
- Session store handles chat sessions with pagination
- Chat store manages messages and deep thinking toggle state

**Routing** (`src/routers/`):
- Static routes defined in `modules/staticRouter.ts`
- Route guard: checks token, sets page title, applies NProgress
- White list routes (`ROUTER_WHITE_LIST`) bypass auth check
- Token absence triggers `userStore.logout()`

**HTTP Requests** (`src/utils/request.ts`):
- Auto-injects `Bearer` token and `ClientID` headers
- Handles 401 (logout) and 403 (redirect) responses
- Supports SSE streaming via `sseTextDecoderPlugin`

**Auto-imports** (configured via Vite plugins):
- Vue APIs (`ref`, `computed`, `watch`, etc.) auto-imported — no explicit imports needed
- Element Plus components auto-imported — use `<el-button>` without importing
- SVG icons registered via `vite-plugin-svg-icons` + `virtual:svg-icons-register`

**UnoCSS shortcuts** (defined in `uno.config.ts`):
- `wh-full` → `w-full h-full`
- `flex-center` → `flex justify-center items-center`
- `text-overflow` → `overflow-hidden whitespace-nowrap text-ellipsis`
- `text-break` → `whitespace-normal break-all break-words`

### Environment Variables

Configure in `.env.development`:
- `VITE_API_URL` — Backend API base URL
- `VITE_CLIENT_ID` — Client identifier for auth
- `VITE_WEB_TITLE` — Page title

### Code Style

- ESLint with `@antfu/eslint-config`
- Vue blocks order: script → template → style
- Single quotes, semicolons, 2-space indent
- SCSS with `@/styles/var.scss` auto-injected in all components
- Commit messages follow conventional commits via commitlint + husky + cz-git
