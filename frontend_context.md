# Frontend Context & Work Log

## Overview
**Project:** Research-AI (MERN stack)
**Frontend Framework:** React 19 + Vite 8 (rolldown), React Router 7, Redux Toolkit 2, Tailwind CSS 4
**Root:** `frontend/`
**Build/Run:** `npm run dev` (Vite), `npm run build`, `npm run preview`, `npm run lint`
**Env:** `VITE_API_BASE_URL` (default `http://localhost:4000`)

---

## ⛔ STANDING INSTRUCTION (applies to every frontend task)

> **Whenever the frontend is changed — a component edited, a hook modified, a page added,
> a style fixed, a dependency added, a bug resolved — this file MUST be updated in the same task.**
> This file is the memory of the frontend. Never leave it stale.

---

## Architecture Map

### Directory Tree (frontend/src)

```text
src/
├── main.jsx                          # Entry: mounts <App /> with Redux <Provider store={store}>
├── APP/
│   ├── App.jsx                       # Calls handleGetMe() once on mount, mounts RouterProvider
│   ├── index.css                     # Tailwind import + fadeInUp keyframe + scrollbar hide + .chat font
│   ├── routes/
│   │   └── AppRoutes.jsx             # createBrowserRouter with lazy() pages + Suspense + Protected gate
│   ├── store/
│   │   └── App.store.js              # configureStore({ auth, chat })
├── components/
│   └── ErrorBoundary.jsx             # NEW 2026-10-03 — class-based global render-error boundary w/ fallback + Try again/Reload├── features/
│   ├── auth/
│   │   ├── components/Protected.jsx  # Route guard: loading spinner → user? children : <Navigate to="/login">
│   │   ├── hooks/useAuth.js          # handleRegister / handleLogin (returns bool) / handleGetMe / handleLogout
│   │   ├── pages/Login.jsx           # Renders auth error as alert; navigates "/" only on success
│   │   ├── pages/Register.jsx        # On verified:false → "Check your inbox" screen; renders auth.error; navigates "/" only when verified
│   │   ├── services/auth.api.js      # axios instance (withCredentials) → register/login/getMe/logout
│   │   └── slice/auth.slice.js       # { user, loading, error } + setUser/setLoading/setError
│   └── chat/
│       ├── components/
│       │   ├── ChatInput.jsx         # Textarea + char count + shortcuts + suggestions (MODIFIED 2026-10-03)
│       │   ├── EmptyState.jsx        # Hero + SUGGESTIONS chips when chat is empty
│       │   ├── ErrorBanner.jsx       # Categorized errors + retry/login actions (MODIFIED 2026-10-03, BROKEN)
│       │   ├── LoadingIndicator.jsx  # NEW 2026-10-03 — generic loader (NOT imported anywhere; file has syntax bugs)
│       │   ├── MarkdownComponents.jsx# Baseline markdown renderer map + citation chip text splitting
│       │   ├── MessageList.jsx       # Memoized message list + Sources footer (hasCitations)
│       │   ├── MessageRenderer.jsx   # Parts renderer + enhanced code block (MODIFIED 2026-10-03, BROKEN)
│       │   ├── Navbar.jsx            # Landing-page navbar
│       │   ├── Reuse.jsx             # FeatureCard, Fonts (landing helpers)
│       │   ├── Sidebar.jsx           # Chat list, new chat, delete, profile, mobile drawer + logout
│       │   ├── StreamingBubble.jsx   # Streaming UI + typing effect + progress (MODIFIED 2026-10-03)
│       │   ├── StreamingProgress.jsx # NEW 2026-10-03 — standalone progress card (NOT imported anywhere)
│       │   ├── ThinkingIndicator.jsx # Thinking dots + robot pulse (MODIFIED 2026-10-03, BROKEN)
│       │   └── ui/
│       │       ├── CitationChip.jsx      # [1][2] inline chips with hover tooltip
│       │       ├── CitationToolTips.jsx  # Tooltip card (favicon + title + url)
│       │       └── CodeBlock.jsx         # react-syntax-highlighter + copy button
│       ├── hooks/useChat.js          # Core: SSE parsing, streaming parts, chat CRUD glue
│       ├── pages/
│       │   ├── DashBoard.jsx         # Main chat screen (sidebar + messages + input)
│       │   ├── Landing.jsx           # Public landing (hero/features/pipeline)
│       │   └── Profile.jsx           # Avatar + back + logout
│       ├── services/chat.api.js      # fetch() for SSE POST /message; axios for the rest
│       ├── shared/
│       │   ├── global.js             # FEATURES, STATS, Pipeline, navLink, SUGGESTIONS constants
│       │   └── LogoIcon.jsx          # Brand logo SVG
│       ├── state/chat.slices.js      # chat slice (see State section)
│       └── styles/
│           ├── landing.css           # Landing-page bespoke styles (hero, features, pipeline)
│           └── navbar.css            # Navbar bespoke styles
```

### Routes

| Path | Component | Guard |
|---|---|---|
| `/` | RootComponent → Landing (logged out) or DashBoard (logged in, via Protected) | conditional |
| `/login` | Login (lazy) | redirects to "/" if user |
| `/register` | Register (lazy) | none |
| `/landing` | \<Navigate to="/"\> | redirect alias |
| `/profile` | Profile (lazy) | Protected |
| `*` | \<Navigate to="/"\> | catch-all |

All pages are `lazy()` + `Suspense` with a shared spinner fallback (`LoadingFallback` in AppRoutes). `handleGetMe()` runs once in `App.jsx` on mount; any 401 clears `user`.

---

## State Management (Redux Toolkit)

### `auth` slice (`features/auth/slice/auth.slice.js`)
```js
initialState = { user: null, loading: true, error: null }
```
- `setUser(payload)` — sets user AND `loading = false` (loading is coupled to user resolution)
- `setLoading(bool)`, `setError(msg)`
- `loading` starts `true`: the app shows a spinner until the first `getMe` resolves or 401s.

### `chat` slice (`features/chat/state/chat.slices.js`)
```js
initialState = { chats: {}, currentChatId: null, isLoading: false, error: null }
```
- `chats`: object keyed by `chatId`, each `{ id, title, messages: [], lastUpdated }`
- `createNewChat({chatId, title})`, `addNewMessage({chatId, content, role, citations, hasCitations, parts})`,
  `addMessages({chatId, messages})` (bulk load, pushes onto existing), `deleteChat({chatId})`
  (removes key; clears currentChatId if it was open), `setChats(map)` (full replace from GET /api/chat),
  `setCurrentChatId`, `setLoading`, `setError(null to clear)`
- Message shape in store: `{ content, role, citations, hasCitations, parts }` — note: NO `_id` stored.

---

## API Contracts the Frontend Consumes

### Auth (`features/auth/services/auth.api.js` — axios, `withCredentials: true`)
| Call | Endpoint | Reads |
|---|---|---|
| `register` | POST /api/auth/register | `data.user` |
| `login` | POST /api/auth/login | `data.user` |
| `getMe` | GET /api/auth/get-me | `data.user` (401 → setUser(null)) |
| `logout` | POST /api/auth/logout | — |
Errors read `error.response?.data?.message` (expects flat string — backend now guarantees this).

### Chat (`features/chat/services/chat.api.js`)
| Call | Transport | Endpoint | Notes |
|---|---|---|---|
| `sendMessage` | **raw `fetch`** (streams) | POST /api/chat/message | Reads `response.body.getReader()`; non-OK reads `{message}` JSON; sets error.status |
| `getChats` | axios | GET /api/chat | `data.chats` → reduced to `{id,title,messages:[],lastUpdated:updatedAt}` |
| `getMessages` | axios | GET `/api/chat/:chatId/messages` | `data.messages` → mapped to `{content, role, citations, hasCitations, parts}` |
| `deleteChat` | axios | DELETE /api/chat/delete/:chatId | — |

**Two HTTP clients on purpose:** `fetch` for the SSE endpoint, `axios` for everything else. Don't unify without a plan — the fetch path sets `error.status`, axios errors don't have `.status`.

### SSE event wire format (what `useChat.js` parses)
| `type` | Fields | Frontend behavior |
|---|---|---|
| `start` | chatId, title? | creates chat entry + optimistic user message, sets currentChatId, `setIsStreaming(true)` |
| `text-delta` | delta | appends to trailing text part (rAF-batched via `requestAnimationFrame`) |
| `tool-call-start` | toolName, **toolCallId** | pushes `dynamic-tool` part `{state:"streaming", args:""}` keyed by toolCallId |
| `tool-call-delta` | toolCallId, args | appends args to matching streaming tool part |
| `tool-call-result` | toolName, toolCallId, result | marks matching part `done` + sets output |
| `done` | aiMessage (DTO), citations, hasCitations | dispatches `addNewMessage` with streamingParts snapshot; clears streaming state |
| `error` | code, message | throws Error with `.code` (displayed via setError) |
| `: ping` comments | — | ignored (not `data:` lines) |

`useChat.js` state: `streamingParts` (state) + `streamingPartsRef` (ref mirror), `isStreaming`, `handleSendMessage/handleGetChats/handleOpenChat/handleDeleteChat`. **No auto-retry loop** (removed in backend Fix 4.5) — a dropped stream shows an error and preserves partial text.

---

## Chat UI Composition (DashBoard.jsx)

```
<main>
  <Sidebar chats currentChatId startNewChat openChat deleteChat isMobileOpen onClose />
  <section>
    <Header> hamburger (mobile) + status dot + currentChatTitle
    {error && <ErrorBanner message={error} onDismiss={setError(null)} />}
    <ScrollContainer>  ← smart auto-scroll (sticks when near bottom while streaming)
      {isEmpty && <EmptyState handleSuggestion />}(sends user-free suggestion to new chat)
      <MessageList messages={currentMessages} />
      {isLoading && !isStreaming && <ThinkingIndicator />}
      {isStreaming && <StreamingBubble streamingParts={streamingParts} />}   ← NOTE: elapsedTime NOT passed
      <div ref={messageEndRef} />
    </ScrollContainer>
    <ChatInput chatInput setChatInput handleSubmit isLoading textAreaRef />
  </section>
  <style>@keyframes blink…</style>
</main>
```

- `isEmpty` = no messages && !isStreaming && !isLoading → shows EmptyState with SUGGESTIONS.
- MessageList renders user bubbles right-aligned; AI messages via `<MessageRenderer parts citations>` when
  `parts.length > 0`, else plain markdown of `content`; Sources footer keyed on `message.hasCitations`.
- Auto-scroll: while streaming, follows only if user is within 100px of bottom; otherwise smooth-scrolls to end.

---

## Styling System

- **Tailwind CSS v4** (via `@tailwindcss/vite`), Utility-first; no config file scanned — classes are inline.
- **Colors:** charcoal base (`#0f0f10`, `#161618`, `#1a1a1d`), accent blue (`bg-blue-500`), brand green
  (`[#10a37f]` — ChatGPT-like), landing accent cyan (`#31b8c6` used by auth pages + landing), `white/N` opacity text.
- **`index.css` globals:** `animate-fadeInUp` keyframe (used everywhere), `.messages` scrollbar hide, `.chat` font stack.
- **`landing.css`/`navbar.css`** are bespoke class-based sheets for the public pages only.
- **Icons:** remixicon (`ri-*` classes), imported once in DashBoard (`remixicon/fonts/remixicon.css`).
- **Typography:** markdown sizes defined in `MarkdownComponents.jsx` / `MessageRenderer.jsx` component maps.
- Newer Tailwind v4 canonical gradients used in some files: `bg-linear-to-r` (v4) vs `bg-gradient-to-r` (v3) — both appear.

---

## Recent Work (2026-10-03 — the "Frontend UX improvement" session)

Source of intent: `Frontend_Improve.md` (repo root). User pivoted from backend → frontend UX polish toward deployment parity with GPT/Grok/Perplexity.

### Files modified (5)

1. **`StreamingBubble.jsx`** (255 lines, ~+236)
   - New `TypedText` — per-character typing effect w/ blinking cursor (`speed` prop, default 30ms/char).
   - New `ToolCallDisplay` — gradient-glass tool card: icon map (internetSearch→ri-global-line…), "🔍 called"/"✓" state, query preview (`line-clamp-2`, 100-char cap), "Processing…/Executing" pulse.
   - New local `StreamingProgress` — bottom card w/ % bar (blue→purple gradient), chars/min + elapsed s.
   - Advanced loader after 2s (`showAdvancedLoader`): "AI is thinking" + 3 staggered bounce dots.
   - Glassmorphic AI bubble (`backdrop-blur-sm`, custom shadow).

2. **`ErrorBanner.jsx`** (167 lines, ~+160)
   - Categorized error UX: NETWORK_ERROR / AUTH_ERROR / QUOTA_EXCEEDED / VALIDATION_ERROR / SERVER_ERROR / TIMEOUT_ERROR + default.
   - Detection by `errorCode` prop OR message-substring heuristics.
   - Variant styling (error=red, warning=amber, info=blue), icon per category, Retry button (warning/server/timeout) and Log In button (auth), expandable raw-JSON details, dismiss X.
   - **Note:** DashBoard does NOT yet pass `errorCode`/`onRetry`/`onLogin` — only `message`/`onDismiss`. Categories currently work via message-text heuristics only.

3. **`ChatInput.jsx`** (294 lines, ~+260)
   - New `CharacterCount` — live count + colored progress bar (blue→amber80%→red over-limit), `maxChars` prop (default 10000), `maxLength` on textarea.
   - New `SuggestionButton` + suggestion popover: shows when 2+ chars typed AND `suggestions` prop non-empty; outside-click closes; click fills input + focuses.
   - New `AITypingIndicator` — "AI is typing" dots inside the input when `isLoading && chatInput`.
   - Keyboard shortcuts: Enter = send (via textarea onKeyDown), **Ctrl/Cmd+Enter** = send (document listener), **Escape** = clear when NOT focused.
   - Focus ring states, over-limit red border, status bar with shortcut hint, attach button (visual only — no handler).
   - Auto-resize textarea (max 120px).

4. **`MessageRenderer.jsx`** (385 lines, ~+250)
   - New `EnhancedCodeBlock` — header row w/ language label + copy button ("Copied!" feedback 2s), wraps ui/CodeBlock (react-syntax-highlighter oneDark).
   - New full markdown map `createEnhancedMarkdownComponents` — h1-h4 sizes, blockquote styling, table wrapper, image block, inline code chip (blue).
   - Citation-aware text splitting inlined (duplicates MarkdownComponents' `processStringWithCitations` behavior) via `finalComponents` reduce for p/blockquote/li/td/th.
   - New `memoizeByCitations` keyed by `JSON.stringify(citations)` (different strategy than MarkdownComponents' reference-key cache).
   - Internet-search tool card redesigned: "Sources Found (N)" header, numbered avatar badges, title line-clamp-2, 100-char content preview, hostname link w/ favicon-row.
   - Generic done-tool card: gradient green, args/output previews capped at 200 chars.
   - Uses `rehypeHighlight` + `rehypeRaw` on text parts (markdown streaming path now syntax-highlights).

5. **`ThinkingIndicator.jsx`** (40 lines, ~+30 → but see Known Issues)
   - Ping halo around robot icon, animated tri-dot bounce, desktop-only "Searching and reasoning" rail.

### Files created (2)

6. **`LoadingIndicator.jsx`** (93 lines) — generic loader: 4 variants (spinner/dots/pulse/gradient) × 3 sizes, ARIA `role="status"`. **Not imported anywhere yet.**
7. **`StreamingProgress.jsx`** (81 lines) — standalone progress card (progress %, chars, speed chars/s grid, current-text preview line-clamp-2, 500ms appear delay). **Not imported anywhere yet** (StreamingBubble has its own local one).

### Unchanged-but-load-bearing
- `useChat.js`, `chat.slices.js`, `chat.api.js`, `MarkdownComponents.jsx`, `MessageList.jsx`, `Sidebar.jsx`, `Navbar.jsx`, `Reuse.jsx`, `EmptyState.jsx`, `DashBoard.jsx` (except it now renders the new ErrorBanner), auth files (hooks/pages/slice/services), `ui/` trio, Landing/Profile, index.css.

---

## ✅ Error Fix Round (2026-10-03, post Frontend_Improve session)

The build was RED after the 2026-10-03 UX session. All detected build + lint errors are now FIXED and verified (`npm run build` = ✓ built in ~0.5s; `npm run lint` = 0 problems).
### Build errors — FIXED:

| # | File:Line | Error | Fix Applied |
|---|---|---|---|
| 1 | `ErrorBanner.jsx:151` | Unterminated string | `text-base"` (no `=`) → merged into the ternary: `className={isExpanded ? "ri-arrow-up-line text-base" : "ri-arrow-down-line text-base"}` |
| 2 | `ThinkingIndicator.jsx:36-40` | Unexpected token | Removed orphaned trailing `</div> ); };` + duplicate `export default React.memo(ThinkingIndicator);` — file ends at the single correct export |
| 3 | `MessageRenderer.jsx:6 vs :240` | `buildMarkdownComponents` declared twice | Dropped `buildMarkdownComponents` from the `./MarkdownComponents` import (local enhanced copy at :240 is the one MessageRenderer uses); MessageList still imports the canonical one from `MarkdownComponents.jsx` |

### Latent syntax bugs in UNUSED files — FIXED:
- `LoadingIndicator.jsx:57` — extra `"` in template literal → removed
- `LoadingIndicator.jsx:70` — stray `n` in JSX (`>n <div`) → removed
- `LoadingIndicator.jsx:71` — extra `"` in template literal → removed

### Dependency gap — FIXED:
- `rehype-highlight` was imported at `MessageRenderer.jsx:5` but missing from package.json → `npm install rehype-highlight` (now in dependencies)

### Lint cleanup (13 errors + 1 warning → 0 problems):
- `MessageRenderer.jsx` — removed unused `useEffect`/`useCallback` imports; `catch (e)` → `catch {}`; citation-wrap reduce now uses `React.createElement(Component, props, …)` so the destructured `Component` shows as a real JS reference (satisfies core `no-unused-vars` without needing eslint-plugin-react); dropped the redundant `export` on the local `buildMarkdownComponents` (react-refresh rule: component files shouldn't export non-components; nothing imported it)
- `StreamingBubble.jsx` — removed dead `isVisible` state + its mount effect from `ToolCallDisplay`; removed unused `toolCallId` destructure; removed dead `typedText` state; `showAdvancedLoader` reset moved into the effect's **cleanup** instead of a synchronous `setShowAdvancedLoader(false)` in the effect body (satisfies `set-state-in-effect`); removed unused `startTime` param from `handleTextUpdate`; removed debug `console.log('Text complete')` from `TypedText onComplete`
- `useAuth.js` — `handleGetMe` wrapped in `useCallback(..., [dispatch])` and its unused `catch (error)` became bare `catch {}` (the handler intentionally swallows to `setUser(null)`)
- `App.jsx` — `useEffect(handleGetMe, [])` → `useEffect(handleGetMe, [handleGetMe])` (safe now that it's memoized)

### Behavior notes (no behavior change intended):
- `ThinkingIndicator` now renders identically — only the dead trailing block was removed.
- `StreamingBubble/TypedText` no longer logs per completion; no visual change.
- `ToolCallDisplay` no longer has the unused visibility state; the card now renders as soon as `toolName` exists (same visual outcome — the state was always true after mount anyway).

---

## ✅ C/B/A Rounds (2026-10-03, streaming + error-wiring hardening)

### C — orphaned components adopted (single implementations)
- **`StreamingProgress.jsx`**: foldable card is now the ONLY progress implementation. StreamingBubble removed its local copy and renders `<StreamingProgress className="absolute bottom-16 left-4 right-4" current={charCount} total={0} elapsedTime={elapsedTime} />`. Component rewritten: `total>0` → determinate % bar; `total≤0` → indeterminate pulsing bar (a live stream has no knowable total, so no fake %). Real `chars/s` (was mislabeled chars/min ×1000) and `elapsed ?? 0` fallbacks.
- **`LoadingIndicator.jsx`**: now wired into `AppRoutes.jsx` (`LoadingFallback`) and `Protected.jsx` instead of two hand-rolled spinners → orphan component adopted, single spinner system.

### B — streaming correctness in `StreamingBubble.jsx`
- **TypedText prefix-continuation**: effect resets ONLY when the incoming text doesn't start with the already-typed prefix (replaced content). Appended deltas keep the cursor moving from its current position; `startTimeRef` adjusts for the typed prefix so pacing stays uniform. Fixes the "re-types the whole answer on every delta" flicker.
- **Tick-batched setState**: one `setDisplayText(text.slice(0, typed))` per tick (char backlog computed from elapsed/speed) replacing per-character `prev + char` calls; `onUpdate` gains a single `(typed, total)` signature; per-char re-render storm gone.
- **Cursor is derived state**: `isTyping = displayText.length < text.length` — no separate `isTyping` state or `setState-in-effect`-cleanliness workaround.
- **elapsedTime**: DashBoard owns a 1s ticker reset via effect cleanup on `!isStreaming`, passed down as `elapsedTime` → real stats in place of "0 chars/min" defaults.

### A — ErrorBanner fully wired
- `useChat.handleSendMessage` catch now dispatches `{ message, code }` where `code` comes from sse `error` events (`parsed.code`), HTTP `error.status` (429→QUOTA_EXCEEDED, ≥500→SERVER_ERROR, else NETWORK_ERROR), or TypeError → NETWORK_ERROR fallback.
- **Safe retry**: `retryPayload = { message, chatId }` is captured ONLY when the stream never delivered `start` (so no user message was persisted on the backend) → `retryLastMessage()` re-sends it; `start`-delivered failures don't offer retry (would duplicate the user message server-side).
- `DashBoard.jsx` passes `errorCode` (from object errors), `onRetry={chat.retryPayload ? chat.retryLastMessage : undefined}`, `onLogin={() => navigate('/login')}`.
- `ErrorBanner.jsx` gates: Retry button renders only when `showRetry && onRetry` (banner no longer renders a dead Retry for pre-start-unretryable paths).

### Files touched: `StreamingBubble.jsx`, `StreamingProgress.jsx`, `LoadingIndicator.jsx` (adopted), `AppRoutes.jsx`, `Protected.jsx`, `DashBoard.jsx`, `useChat.js`, `ErrorBanner.jsx`
### Verify: `npm run lint` = 0 problems; `npm run build` = ✓ green (~0.5s) after C, B, and A.

---

## ✅ A/B/C Rounds (2026-10-03, deploy-blocking UX + production armor)

### A — Register flow mismatch fixed (was Known Issue #6)
- **`useAuth.handleRegister`** no longer calls `setUser(data.user)`. Backend register returns `verified:false` with NO cookie, so treating 201 as logged in produced: Dashboard → first authed fetch 401 → silent bounce to Landing. Now returns `{ success, verified, user }` and nothing is persisted.
- **`Register.jsx`**:
  - On `success && !verified` → new "Check your inbox" screen (mail icon, target email line, 1h-expiry note, "Go to Login" link) — no navigation, no session state.
  - On `success && verified` → `navigate("/")` (edge case).
  - On error → renders `auth.error` as an alert (previously Register never rendered the slice's error and navigated blindly).
  - Submit button shows `Creating account...` while `auth.loading`.

**Completion flow (A):**
```
1. useAuth.handleRegister: drops setUser, adds setError(null) clear, returns { success, verified, user }
2. Register.jsx: imports useSelector, reads auth.error/auth.loading, adds registered state
3. handleSubmit: branches on result.success + result.verified → setRegistered(true) OR navigate("/")
4. New registered===true render branch: "Check your inbox" card with email + expiry note + /login link
5. Form renders {error && <p role="alert">{error}</p>}; button shows Creating account... during loading
6. Verify: npm run lint (0 problems) → npm run build (✓ green)
```

### B — Global Error Boundary (production armor)
- **NEW `src/components/ErrorBoundary.jsx`** — class component with `static getDerivedStateFromError` + `componentDidCatch` (logs error + stackInfo to console).
- Fallback UI (`ErrorFallback`): brand-styled card with icon, "Something went wrong", expandable `<details>` for `error.message`, **Try again** (state reset, re-renders children — recovers from one-off render errors without reload) and **Reload page** buttons.
- **Wired in `App.jsx`**: `<ErrorBoundary><RouterProvider router={router} /></ErrorBoundary>` — any uncaught render error anywhere in the tree lands here instead of white-screening the entire app (incl. errors thrown inside lazy-loaded pages since they render under it).

**Completion flow (B):**
```
1. Create src/components/ErrorBoundary.jsx: class ErrorBoundary (state {error}) + ErrorFallback presentational
2. getDerivedStateFromError → state.error; componentDidCatch → console.error(error, errorInfo)
3. handleReset → setState({ error: null }) → children render again; Reload → window.location.reload()
4. App.jsx: import ErrorBoundary; <ErrorBoundary><RouterProvider/></ErrorBoundary> wraps everything
5. Verify: npm run lint (0 problems) → npm run build (✓ green)
```

### C — ChatInput suggestions wired
- DashBoard passes `suggestions={SUGGESTIONS}` (from `shared/global.js`) into `ChatInput`. Popover (`showSuggestions && suggestions.length > 0` + ≥2 chars typed + outside-click to dismiss) was unreachable before because `suggestions` was never passed.
- ChatInput wrapper gained `relative` so the `absolute bottom-full` popover anchors to the input card.
- `SuggestionButton` chips (sparkle icon + label) fill the input and refocus on click.

**Completion flow (C):**
```
1. DashBoard.jsx: import { SUGGESTIONS } from "../shared/global"
2. DashBoard.jsx: <ChatInput ... suggestions={SUGGESTIONS} />
3. ChatInput.jsx: outer wrapper <div className="max-w-3xl mx-auto relative"> (popover anchor)
4. Result: typing ≥2 non-space chars → popover → chip onClick → setChatInput(s) + focus at end
5. Verify: npm run lint (0 problems) → npm run build (✓ green)
```

### Files touched: `useAuth.js`, `Register.jsx`, `App.jsx`, `components/ErrorBoundary.jsx` (new), `DashBoard.jsx`, `ChatInput.jsx`
### Verify: `npm run lint` = 0 problems; `npm run build` = ✓ green after each round.

---

## ⚠️ Remaining Known Issues (VERIFIED open, non-blocking)

### Functional/UX issues (no crash):
1. ~~TypedText re-types from scratch on every delta~~ ✅ FIXED (B round) — prefix-continuation; typing continues from current position on appended deltas.
2. ~~Per-character setState~~ ✅ FIXED (B round) — tick-batched `setDisplayText(text.slice(0, typed))` once per tick.
3. ~~`StreamingBubble` receives no `elapsedTime` prop~~ ✅ FIXED (B round) — DashBoard owns a 1s ticker and passes `elapsedTime` down.
4. ~~Fake progress total~~ ✅ FIXED (B round) — total ≤ 0 renders an indeterminate pulsing bar; stats are real (chars, chars/s, elapsed).
5. ~~`rehype-highlight` imported but NOT in package.json~~ ✅ FIXED 2026-10-03 — dependency installed, build green.
6. ~~Register flow mismatch~~ ✅ FIXED (A round) — `handleRegister` returns `{success, verified, user}` without calling `setUser`; Register shows a "Check your inbox" screen for verified:false, navigates only when verified, renders auth.error, and the submit button reflects loading.
7. **Duplicate citation logic** — `MessageRenderer.jsx` has its own citation-splitting copy while `MarkdownComponents.jsx` still exports the original; two parallel implementations can drift. Consider unifying when next touching markdown.
8. ~~Two StreamingProgress implementations~~ ✅ FIXED (C round) — standalone is the single impl; StreamingBubble imports it.
9. ~~Debug `console.log('Text complete')` in StreamingBubble~~ ✅ FIXED 2026-10-03 — removed; `onComplete` no longer needs a no-op handler.
10. ~~LoadingIndicator.jsx / StreamingProgress.jsx orphaned~~ ✅ FIXED (C round) — LoadingIndicator used by AppRoutes `LoadingFallback` + Protected; StreamingProgress rendered by StreamingBubble.
11. **Escape clears input only when NOT focused** — counter-intuitive (usually you clear while focused); verify intended.

---

## Deferred / Not-Started (from Frontend_Improve.md roadmap)

- Virtual scrolling for long conversations (Phase 2)
- Dark/light theme switch
- Performance monitoring/analytics
- Advanced keyboard navigation across messages
- Voice input, gesture controls (Phase 3)
- Progressive message loading
- Customizable typing speed
- ~~Wiring `errorCode`/`onRetry`/`onLogin` props from DashBoard into ErrorBanner~~ ✅ DONE (A round)
- `useChat.js` retry mechanism — **OUTDATED**: backend Fix 4.5 intentionally removed client retry (it duplicated user messages and re-billed Gemini/Tavily). The retry that IS allowed is the pre-start `retryPayload` in useChat — do not re-add stream retries.

---

## Conventions & Gotchas (read before touching anything)

1. **Two HTTP clients**: `fetch` for `/api/chat/message` (SSE) and `axios` for the rest. `fetch`-path errors carry `.status`; axios ones don't. Keep them consistent when editing.
2. **Message objects in Redux never carry `_id`** — keyed lists use `key={index}` everywhere (MessageList, Sidebar). If you add `_id`, update `addMessages`/`addNewMessage` mappers too.
3. **streamingParts** must always be a fresh array for rAF-batched `setStreamingParts([...ref.current])` — mutation without new identity = frozen UI.
4. **`hasCitations` is COMPUTED** at ingestion: in `useChat.handleOpenChat` mapping (`msg.hasCitations || false`) — backend now sends it from the getMessages mapper, and the SSE `done` frame sends it directly. Never rely on the Mongoose virtual surviving `.lean()`.
5. **toolCallId is the ONLY correct key** for matching tool-call-start/delta/result across front and back — never fall back to `toolName` for parallel calls.
6. **MarkdownComponents' memoization** keys by the citations ARRAY (reference-ish), MessageRenderer's new one keys by `JSON.stringify(citations)` (content). If you unify them, keep ONE strategy.
7. **`chat.error` can be a string OR `{ message, code }`** — send failures store the object; others stay strings. ErrorBanner handles both; anything else reading `error` must handle the object shape first.
8. **Retry safety**: `retryPayload` in useChat is captured ONLY when the stream never produced `start` (nothing persisted backend-side). Never expose retry for post-start failures — that would duplicate the user message.
9. **Reminder of the standing rule:** any frontend change → update this file. Backend memory lives in `context.md` (same rule there).

---

## Quick Verification Checklist (run after any change)

```bash
cd frontend
npm run build      # must be green — as of 2026-10-03: ✓ built (~0.5s)
npm run lint       # as of 2026-10-03: 0 problems (all dead code from the UX pass cleaned)
npm run dev        # smoke: landing → register → login → chat → stream → sources footer after reload
```
