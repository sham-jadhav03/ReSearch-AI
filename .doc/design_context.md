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
- **Markdown Processing**: ReactMarkdown with remark-gfm; raw HTML and the unused highlight plugin were removed during reliability hardening. Code blocks lazy-load a PrismLight renderer with registered languages.
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
- Preserve the existing SSE event contract, retry-safety rule, citations, and progressive rendering while hardening client-side parsing.
- Do not modify the backend or SSE event protocol.

### Global Styles & Typography
- Tailwind CSS v4 via `@tailwindcss/vite` (utility-first, no config file)
- Base colors: charcoal base (`#0f0f10`, `#161618`, `#1a1a1d`), accent blue (`bg-blue-500`), brand green (`[#10a37f]`)
- `index.css` globals: `animate-fadeInUp` keyframe, `.messages` scrollbar hide, `.chat` font stack
- Typography: markdown sizes defined in `MarkdownComponents.jsx` / `MessageRenderer.jsx` component maps

## D. Migration Checklist

| UI Area | Status | Files Changed | Remaining Work | Verification Evidence |
|---------|--------|---------------|----------------|----------------------|
| **App Shell** | Implemented | `APP/index.css`, `routes/AppRoutes.jsx`, `pages/DashBoard.jsx`, `pages/Profile.jsx` | Document, body, and root default to `bg-app`; dashboard main, content section, and scroll canvas explicitly use the dark app surface; header/input use semantic surfaces. | Build/lint passed; browser visual check not performed |
| **Sidebar** | Implemented | `features/chat/components/Sidebar.jsx` | Desktop and mobile drawer now use the distinct `bg-sidebar` surface; borders, text, selection/hover, and keyboard focus use semantic tokens. Brand and destructive-action cues remain distinct. | Build/lint passed; browser visual check not performed |
| **Navbar** | Implemented | `features/chat/components/Navbar.jsx`, `styles/navbar.css` | Neutral fixed navigation surface, responsive link hiding, white primary login action, and visible keyboard focus states are in place | Build passed; lint passed; browser visual inspection pending |
| **Landing Page** | Implemented | `features/chat/pages/Landing.jsx`, `styles/landing.css` | Semantic dark tokens, neutral borders, a restrained green status cue, responsive mobile layout, and no decorative gradients or glows | Build passed; lint passed; browser visual inspection pending |
| **Header** (DashBoard) | Implemented | `features/chat/pages/DashBoard.jsx` | Header `bg-surface-primary`/`border-border-default`, chat title `text-text-secondary` — tokens present in code | Visual inspection of header |
| **Message List** | Implemented | `features/chat/components/MessageList.jsx` | User/AI bubbles use semantic tokens; source footer, source chips, and keyboard focus are also tokenized. Message/citation behavior unchanged. | Build/lint passed; browser visual check not performed |
| **Streaming Responses** | Implemented | `features/chat/components/StreamingBubble.jsx`, `MessageRenderer.jsx` | Live response text, cursor, assistant mark, thinking state, and streaming tool panels use semantic dark tokens. SSE state, timing, and requestAnimationFrame batching were not changed. | Build passed; lint passed; live-stream visual verification pending |
| **Chat Input (Composer)** | Implemented | `features/chat/components/ChatInput.jsx` | Neutral tokenized composer, suggestions, shortcuts, and disabled states; active send action uses the white/black primary token pair. Corrected send-button state classes so enabled/disabled styling actually applies. Blue focus and red/amber character-limit cues remain. | Build/lint passed; browser visual check not performed |
| **Markdown Rendering** | Implemented | `features/chat/components/MarkdownComponents.jsx`, `MessageRenderer.jsx` | Headings, body text, lists, inline code, quotes, links, tables, rules, images, and citation placeholders now use semantic dark tokens. Markdown/citation parsing behavior was not changed. | Build passed; lint passed; rendered-content visual verification pending |
| **Code Blocks** | Implemented | `features/chat/components/ui/CodeBlock.jsx` | Uses `bg-code-bg`, semantic border/text tokens, dark header surface, and tokenized hover/focus states; existing oneDark syntax theme and clipboard behavior are unchanged | Build/lint passed; browser visual inspection pending |
| **Citations** | Implemented | `features/chat/components/ui/CitationChip.jsx`, `CitationToolTips.jsx` | Chip and tooltip use semantic surface, border, and text tokens; external source links, hover/focus tooltip behavior, and favicon display are unchanged | Build/lint passed; browser visual inspection pending |
| **Tool Calls** | Implemented | `features/chat/components/StreamingBubble.jsx`, `MessageRenderer.jsx` | Active/completed tool panels and source-result cards now use neutral tokenized surfaces; green remains reserved for completed/active status cues. | Build passed; lint passed; live tool-call visual verification pending |
| **Progress Indicators** | Implemented | `features/chat/components/StreamingProgress.jsx` | Tokenized card, track, text, and neutral progress fill; active streaming status remains green. Timing, delayed appearance, and stats unchanged. | Build ✓, lint ✓; browser visual inspection pending |
| **Loading States** | Implemented | `features/chat/components/LoadingIndicator.jsx`, `ThinkingIndicator.jsx`, `routes/AppRoutes.jsx`, `features/auth/components/Protected.jsx` | Spinner/dots/pulse and text use semantic tokens; thinking status retains green brand cues; route loading backgrounds use `bg-app`. Variants and timing unchanged. | Build ✓, lint ✓; browser visual inspection pending |
| **Error States** | Implemented | `features/chat/components/ErrorBanner.jsx` | Tokenized neutral text/details/actions and visible focus rings; red/amber/blue category cues preserved. Categorization, retry/login, expand, and dismiss behavior unchanged. | Build ✓, lint ✓; browser visual inspection pending |
| **Authentication Pages** | Implemented | `features/auth/pages/Login.jsx`, `Register.jsx` | Login, registration, and email-verification confirmation use the shared token palette, accessible neutral focus rings, and responsive panels. Auth routes, validation, loading, and registration confirmation behavior were preserved. | Build passed; lint passed; browser visual inspection pending |
| **Dialogs/Modals** | No current UI | Searched frontend components | No dialog/modal implementation found; audit if a dialog is introduced later | Source search; browser check not applicable |
| **Dropdowns/Popovers** | Implemented where present | `ChatInput.jsx`, `CitationToolTips.jsx` | Suggestion popover and citation tooltip use semantic dark surfaces/text/borders; tooltip remains hover/focus driven. | Build/lint passed; browser interaction check not performed |
| **Responsive Layouts** | Implemented; visual check pending | All components | Existing mobile/tablet breakpoints retained; desktop sidebar/mobile drawer and responsive page layouts remain in place. | No browser breakpoint verification |
| **Icons & Images** | Implemented; visual check pending | Various | Icons retain visible foreground/status colors; logo contrast handled with `LogoIcon` color prop. | Source/build validation; no visual check |
| **Focus States** | Implemented in audited controls; visual check pending | Sidebar, composer, citations, source chips, error/profile actions, auth, navbar | Added/retained visible focus rings on key interactive chat controls; broader keyboard walkthrough remains. | Lint/build passed; keyboard test not performed |
| **Hover States** | Implemented in audited controls; visual check pending | Chat shell, composer, sidebar, citations, error/profile actions | Neutral surface hover states are tokenized; warning/destructive states retain semantic color. | Lint/build passed; pointer test not performed |

### Earlier Session Handoff (Historical)
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

## F. Phase 4 Implementation Record (Historical)

- **Status**: Navbar, Landing Page, and Authentication Pages are implemented.
- **Navbar**: `frontend/src/features/chat/styles/navbar.css` now uses the semantic dark tokens for its fixed surface, borders, navigation links, login action, hover states, responsive mobile behavior, and keyboard focus rings. `Navbar.jsx` behavior was not changed.
- **Landing Page**: `frontend/src/features/chat/pages/Landing.jsx` and `frontend/src/features/chat/styles/landing.css` now use restrained neutral research-workspace styling. Decorative gradient/glow elements and the gradient headline treatment were removed. CTA behavior is unchanged. The layout includes mobile rules for calls to action, statistics, pipeline steps, and the footer.
- **Authentication**: `frontend/src/features/auth/pages/Login.jsx` and `Register.jsx` now use `bg-app`, surface, border, text, and primary-action tokens. Login, registration, loading, validation, routing, and the email-verification confirmation transition are unchanged. Placeholder copy was corrected to "Choose your username" and "Enter your password."
- **Verification**: `npm run build` passed with Vite 8 in 1.09s. It reports the existing dashboard bundle-size advisory only. `npm run lint` passed with 0 errors. Browser visual review remains pending.
- **Status Reconciliation**: The code-block and citation styling is tracked as implemented in the checklist and latest handoff below.

## G. Phase 6/7 Implementation Record (Historical)

- **Status**: Streaming Responses, Markdown Rendering, and their in-scope Tool Call panels are implemented.
- **Streaming presentation**: `StreamingBubble.jsx` now uses semantic surfaces, borders, text, cursor, assistant mark, tool-call display, and thinking-state styling. It retains the original stream-part processing, timer, progress rendering, and `MessageRenderer` invocation.
- **Completed message presentation**: `MessageRenderer.jsx` now tokenizes enhanced markdown, streaming/completed tool panels, source cards, code-copy controls, and citation placeholders. Markdown parsing, memoization, citation wrapping, tool output parsing, source links, and copy behavior are unchanged.
- **Shared markdown presentation**: `MarkdownComponents.jsx` now tokenizes paragraphs, lists, inline code, headings, strong text, quotes, links, tables, and rules. Its citation rendering and memoization are unchanged.
- **Logo contrast correction**: `shared/LogoIcon.jsx` now honors its optional `color` prop while retaining white as its default. Navbar, landing footer, and the new streaming assistant tile explicitly supply the correct foreground color for their primary surfaces.
- **Out of scope at that time**: `StreamingProgress.jsx`, `ui/CodeBlock.jsx`, `ui/CitationChip.jsx`, and `CitationToolTips.jsx` were separate checklist items and were not modified in the Phase 6/7 batch.
- **Verification**: `npm run build` passed with Vite 8 in 1.22s. The existing dashboard bundle-size advisory remains unrelated. `npm run lint` passed with 0 errors. Live SSE and rendered-markdown browser verification remain pending.
- **Status Reconciliation**: Code blocks and citations are tracked as a subsequent completed styling batch; streaming, markdown parsing, copy, source-link, and tooltip behavior remain unchanged.

## H. Latest Session Handoff (2026-10-12)

- **Current Phase**: Dark Theme Migration — source styling complete; composer UX refinement implemented, visual verification remains.
- **Latest Task**: Fixed the reported white chat canvas with explicit global and dashboard dark backgrounds; refined empty state, sidebar, composer, citations footer, profile, and error fallback using the dark token palette. The composer now has clearer focus treatment, a larger round primary send control, truthful Enter/Shift+Enter hints, a research-status indicator, and no inert attachment button.
- **Behavior preserved**: Prompt submission, Shift+Enter newline, Ctrl/Cmd+Enter alternate submit, character limits, suggestions, streaming, errors, citations, and links remain intact. Prevented Ctrl/Cmd+Enter from triggering both textarea and document-level submit handlers.
- **Verification**: `npm --prefix frontend run build`, `npm --prefix frontend run lint`, and `git diff --check` passed. The build retains the existing dashboard chunk-size advisory. Browser visual verification was not performed because browser access was not approved.
- **Remaining**: Validate the screenshot fix in the running app and do desktop/mobile, keyboard-focus, hover, streaming, and tooltip interaction checks. Recheck after any later UI changes.
- **Next Recommended Task**: Run the frontend build/lint after the composer refinement, then perform browser-based visual and interaction verification of the dark chat experience.

## I. Frontend Reliability and Performance Hardening (Current)

- **Scope completed in source**: Split chat loading feedback into chat-list, conversation, send, and delete operations. Conversation requests are deduplicated, empty conversations are cached as loaded, and a stream is only rendered in the conversation that owns it.
- **SSE parsing**: The reader now handles fragmented chunks, CRLF event separators, multiple `data:` lines, decoder flush, and a final event without a trailing separator. Existing event names, stream batching, completion handling, and pre-start-only retry safety are retained.
- **Source URL handling**: Citation and search-result links are restricted to HTTP(S). Invalid source URLs render as non-links instead of throwing during render or exposing unsafe protocols.
- **Markdown and code blocks**: Removed `rehype-raw` so Markdown text cannot enable embedded raw HTML. Removed redundant `rehype-highlight`, leaving one copy/language toolbar in `CodeBlock.jsx`. PrismLight with common grammars is loaded lazily in `CodeSyntaxBlock.jsx`; unregistered languages render as plain text.
- **Tests**: Frontend tests and a release smoke test remain explicitly deferred until after reliability items 2–5 and the subsequent product/interaction polish.
- **Verification**: `npm --prefix frontend run build`, `npm --prefix frontend run lint`, and `git diff --check` passed. The Dashboard route chunk is now 185.94 kB raw / 52.97 kB gzip (previously approximately 1.16 MB / 387 kB); the PrismLight renderer is a deferred 81.95 kB / 26.85 kB gzip chunk. This is roughly an 84% raw and 86% gzip reduction in the Dashboard chunk. No browser verification was performed.
- **Next**: Finish validation and record measured bundle output. Then proceed to the previously deferred product/interaction polish audit; only afterward revisit frontend tests and the release smoke test.
