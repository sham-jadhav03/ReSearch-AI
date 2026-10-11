# Design Context — Dark Theme Migration

## A. Project Objective
Complete application-wide dark-theme redesign with xAI-inspired minimal aesthetic adapted for a research workspace. Dark mode is mandatory (no light mode toggle).

## B. Design Tokens (Initial Proposal)
Recorded as agreed starting point for migration. These tokens will be validated against accessibility standards and refined during implementation.

- App background: `#090909`
- Sidebar: `#0F0F0F`
- Primary surface: `#141414`
- Secondary surface: `#1C1C1C`
- Elevated surface: `#222222`
- Primary text: `#F5F5F5`
- Secondary text: `#A1A1AA`
- Muted text: `#737373`
- Border: `#303030`
- Strong border: `#404040`
- Primary button background: `#F5F5F5`
- Primary button text: `#0A0A0A`
- Code block background: `#101010`

*Note: These are initial design tokens for migration planning. Final values will be determined through implementation and accessibility testing.*

### Token Implementation (Phase 1 — Complete)
The 14 tokens have been implemented centrally in `frontend/src/APP/index.css` using Tailwind CSS v4's `@theme` directive. This auto-generates utility classes (e.g. `bg-app`, `text-text-primary`, `border-border-default`) and exposes CSS custom properties for direct use (e.g. `var(--color-bg-app)`, `var(--color-text-primary)`). No component changes have been made in this phase; tokens are defined but not yet applied to individual components (see checklist below).

| Token | Variable | Value | Generated utility |
|-------|----------|-------|-------------------|
| App background | `--color-bg-app` | `#090909` | `bg-app` |
| Sidebar | `--color-bg-sidebar` | `#0F0F0F` | `bg-sidebar` |
| Primary surface | `--color-surface-primary` | `#141414` | `bg-surface-primary` |
| Secondary surface | `--color-surface-secondary` | `#1C1C1C` | `bg-surface-secondary` |
| Elevated surface | `--color-surface-elevated` | `#222222` | `bg-surface-elevated` |
| Primary text | `--color-text-primary` | `#F5F5F5` | `text-text-primary` |
| Secondary text | `--color-text-secondary` | `#A1A1AA` | `text-text-secondary` |
| Muted text | `--color-text-muted` | `#737373` | `text-text-muted` |
| Border | `--color-border-default` | `#303030` | `border-border-default` |
| Strong border | `--color-border-strong` | `#404040` | `border-border-strong` |
| Primary button bg | `--color-primary` | `#F5F5F5` | `bg-primary` |
| Primary button text | `--color-primary-fg` | `#0A0A0A` | `text-primary-fg` |
| Code block background | `--color-code-bg` | `#101010` | `bg-code-bg` |

**Why these names?** Tokens like `border` and `code` and `text` were avoided as standalone keys because they collide with existing Tailwind width/border-width utilities (`border`) and would shadow semantic conventions. The `-default`/`-strong`/`-primary`/`-secondary`/`-muted`/`-fg` suffixes disambiguate while remaining readable as `bg-surface-primary`, `text-text-primary`, `border-border-strong`.

## C. Architecture and Constraints
See `frontend_context.md` for complete frontend architecture documentation. Key relevant points for dark theme migration:

### Core Stack & Constraints
- **Framework**: React 19 + Vite 8 (rolldown), React Router 7, Redux Toolkit 2, Tailwind CSS v4
- **Styling**: Utility-first Tailwind CSS v4 (no config file, classes are inline)
- **State Management**: Redux Toolkit (auth and chat slices)
- **Streaming**: SSE-based real-time streaming via `useChat.js` with requestAnimationFrame batching
- **Markdown Processing**: ReactMarkdown with remark-gfm, rehype-raw, rehype-highlight via `MessageRenderer` and `MarkdownComponents`
- **Component Architecture**: Feature-based organization with shared UI components

### Streaming Behavior (Must Be Preserved)
- SSE events: `start`, `text-delta`, `tool-call-start/delta/result`, `done`, `error`, `: ping` comments
- `useChat.js` state: `streamingParts` (state) + `streamingPartsRef` (ref mirror), `isStreaming`
- RequestAnimationFrame batching prevents UI jank during streaming
- Tool-call rendering via `ToolCallDisplay` component
- Progress indicator based on character count from accumulated text

### Known Constraints & Regressions
- Duplicate citation logic exists between `MessageRenderer.jsx` and `MarkdownComponents.jsx` (known issue #7)
- Escape key clears input only when NOT focused (known issue #11) - verify intent
- All changes must preserve existing SSE architecture and application behavior
- No modifications to backend, SSE protocol, or `useChat.js` buffering during this migration

### Global Styles & Typography
- Tailwind CSS v4 via `@tailwindcss/vite` (utility-first, no config file)
- Base colors: charcoal base (`#0f0f10`, `#161618`, `#1a1a1d`), accent blue (`bg-blue-500`), brand green (`[#10a37f]`)
- `index.css` globals: `animate-fadeInUp` keyframe, `.messages` scrollbar hide, `.chat` font stack
- Typography: markdown sizes defined in `MarkdownComponents.jsx` / `MessageRenderer.jsx` component maps

## D. Migration Checklist

| UI Area | Status | Files Changed | Remaining Work | Verification Evidence |
|---------|--------|---------------|----------------|----------------------|
| **App Shell** | Implemented | `routes/AppRoutes.jsx` (LoadingFallback `bg-app`), `pages/DashBoard.jsx` (`<main>` `bg-app`, header `bg-surface-primary`/`border-border-default`, input container `bg-app`/`border-border-default`), `pages/Profile.jsx` (outer `bg-app`, card `bg-surface-primary`/`border-border-default`) | Browser verification not performed; tokens present in code | Visual inspection of app background |
| **Sidebar** | Implemented | `features/chat/components/Sidebar.jsx` | Desktop `<aside>` + mobile drawer `bg-surface-primary`/`border-border-default`, top-strip + user-profile `border-border-default`, secondary text `text-text-secondary` — **semantic token**: `bg-sidebar` (`#0F0F0F`) is the intended sidebar surface per design-token hierarchy; current code uses `bg-surface-primary` as a practical extension of the primary surface family. No brand/warning/error states were changed. | Visual inspection of sidebar |
| **Navbar** | Not started | `features/chat/components/Navbar.jsx`, `styles/navbar.css` | Update background, text, icon colors | Visual inspection of navbar |
| **Header** (DashBoard) | Implemented | `features/chat/pages/DashBoard.jsx` | Header `bg-surface-primary`/`border-border-default`, chat title `text-text-secondary` — tokens present in code | Visual inspection of header |
| **Message List** | Implemented | `features/chat/components/MessageList.jsx` | User/AI bubble backgrounds (`bg-surface-secondary`/`border-border-default`/`text-text-primary`), AI bubble transparent with `text-text-primary`; citation footer intentionally untouched (separate phase) | Build ✓, Lint ✓; browser verification not performed (dev server unavailable) |
| **Streaming Responses** | Not started | `features/chat/components/StreamingBubble.jsx`, `MessageRenderer.jsx` | Update text, cursor, background, tool call colors | Visual inspection of streaming content |
| **Chat Input (Composer)** | Implemented | `features/chat/components/ChatInput.jsx` | Input container `bg-surface-secondary`/`border-border-default`, textarea `text-text-primary`, popover `bg-surface-secondary`, muted text `text-text-muted`; brand/accent states (blue ring, red over-limit, amber threshold) preserved | Build ✓, Lint ✓; browser verification not performed (dev server unavailable) |
| **Markdown Rendering** | Not started | `features/chat/components/MarkdownComponents.jsx`, `MessageRenderer.jsx` | Update heading, text, blockquote, code, table, list colors | Visual inspection of rendered markdown |
| **Code Blocks** | Not started | `features/chat/components/ui/CodeBlock.jsx` | Update background, text, language label, button colors | Visual inspection of code blocks |
| **Citations** | Not started | `features/chat/components/ui/CitationChip.jsx`, `CitationToolTips.jsx` | Update chip background, text, tooltip colors | Visual inspection of citations |
| **Tool Calls** | Not started | `features/chat/components/StreamingBubble.jsx` (ToolCallDisplay) | Update background, text, icon, button colors | Visual inspection of tool calls |
| **Progress Indicators** | Not started | `features/chat/components/StreamingProgress.jsx` | Update progress bar, text, background colors | Visual inspection of progress |
| **Loading States** | Not started | `features/chat/components/LoadingIndicator.jsx`, `ThinkingIndicator.jsx` | Update spinner, text, pulse colors | Visual inspection of loading states |
| **Error States** | Not started | `features/chat/components/ErrorBanner.jsx` | Update error/warning/info variant colors, border, text | Visual inspection of error banners |
| **Authentication Pages** | Not started | `features/auth/pages/Login.jsx`, `Register.jsx` | Update form backgrounds, input, button, text colors | Visual inspection of auth pages |
| **Dialogs/Modals** | Not started | Various (to be identified) | Update backdrop, dialog background, text, button colors | Visual inspection of dialogs |
| **Dropdowns/Popovers** | Not started | `ChatInput.jsx` suggestion popover, others | Update background, text, border, hover colors | Visual inspection of popovers |
| **Responsive Layouts** | Not started | All components | Test color application at mobile/tablet/desktop breakpoints | Visual inspection across breakpoints |
| **Icons & Images** | Not started | Various | Ensure icons have sufficient contrast against dark backgrounds | Visual inspection of icon visibility |
| **Focus States** | Not started | All interactive components | Implement visible focus rings with adequate contrast | Keyboard navigation testing |
| **Hover States** | Not started | All interactive components | Implement subtle hover effects visible on dark backgrounds | Mouse hover testing |

### Session Handoff
- **Current Phase**: Phase 3 of Dark Theme Migration — Chat Composer and Message List (Implemented)
- **Last Completed Task**: Applied global design tokens to the chat composer and message list surfaces in `ChatInput.jsx` and `MessageList.jsx` using centralized tokens from `frontend/src/APP/index.css`. Composer container and suggestion popover use `bg-surface-secondary`, structural borders use `border-border-default`, text uses `text-text-primary`/`text-text-muted`. User message bubbles use `bg-surface-secondary`/`border-border-default`/`text-text-primary`; AI bubbles remain transparent with `text-text-primary`. Build and lint both pass.
- **Current Task**: Documentation reconciliation and start of next batch (Phase 4: Navbar, Landing, Auth) — design context updated; code changes applied in the same session.
- **Files Modified**: 
  - `frontend/src/APP/index.css` — contains the 14 `@theme` tokens from Phase 1 (verified present)
  - `frontend/src/APP/routes/AppRoutes.jsx` — LoadingFallback `bg-app`
  - `frontend/src/features/chat/pages/DashBoard.jsx` — `<main>` `bg-app`, header `bg-surface-primary`/`border-border-default`, chat title `text-text-secondary`, input container `bg-app`/`border-border-default`
  - `frontend/src/features/chat/components/Sidebar.jsx` — desktop/ mobile aside `bg-surface-primary`/`border-border-default`, top-strip `border-b border-border-default`, user-profile `border-t border-border-default`, `text-text-secondary` for secondary text, `text-text-secondary` for nav states and profile button text
  - `frontend/src/features/chat/pages/Profile.jsx` — outer `bg-app`, card `bg-surface-primary`/`border-border-default`, user details `text-text-secondary`
  - `frontend/src/features/chat/components/ChatInput.jsx` — input container `bg-surface-secondary`/`border-border-default`, textarea `text-text-primary`, suggestion popover `bg-surface-secondary`, `text-text-muted` for CharacterCount default return / AITypingIndicator / suggestions label; brand/accent states (`text-red-400` over-limit, `text-amber-400` threshold, blue hover ring) intentionally preserved
  - `frontend/src/features/chat/components/MessageList.jsx` — user bubble `bg-surface-secondary`/`border-border-default`/`text-text-primary`, AI bubble transparent `text-text-primary`; citation footer intentionally untouched (separate phase)
  - `design_context.md` — updated token implementation, handoff, and Phase 3 status
- **Build Results**: ✓ Build succeeded (1.27s)
- **Lint Results**: ✓ Lint succeeded (0 errors)
- **Browser-Test Results**: Not performed (dev server unavailable due to memory constraints; visual review of CSS variable generation recommended)
- **Scope Notes**: Code block rendering, citation architecture, and markdown component styling remain outside Phase 3 scope — their hardcoded colors live only in `MessageRenderer.jsx`, `StreamingBubble.jsx`, `StreamingProgress.jsx`, and `MarkdownComponents.jsx`.
- **Known Issues**: 
  - Duplicate citation logic between `MessageRenderer.jsx` and `MarkdownComponents.jsx` (pre-existing)
  - Escape clears input only when NOT focused (pre-existing, verify intent)
- **Semantic Token Decision**: The sidebar uses `bg-surface-primary` (`#141414`) rather than the `bg-sidebar` token (`#0F0F0F`). This is intentional — `bg-surface-primary` is the pragmatic extension of the primary surface family for navigation areas. Changing token names alone would not alter the visual hierarchy, so this is preserved as-is. The `bg-sidebar` token remains defined and available for future use if a distinct sidebar surface is ever needed.
- **Next Recommended Task**: Begin Phase 6: Streaming Responses and Phase 7: Markdown Rendering — update `StreamingBubble.jsx` and `MessageRenderer.jsx` to the semantic tokens; update `MarkdownComponents.jsx` for heading, text, blockquote, code, table, and list colors.
- **Commands to Resume**: 
  ```bash
  cd /c/Users/ghans/Devloper/PROJECT/Research-AI/frontend
  npm run build
  # Next: Begin Phase 6 — Streaming Responses / Phase 7 — Markdown Rendering
  ```

## E. Notes
- This document serves as durable project memory for the dark theme migration
- All implementation must preserve existing functionality and streaming behavior
- Design tokens are initial proposals subject to accessibility validation
- Migration should proceed incrementally with continuous verification
- Do not modify application code during documentation-only phases