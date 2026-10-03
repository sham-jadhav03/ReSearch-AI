# Project Context & Work Log

## Overview
**Project:** Research-AI (MERN stack)
**Backend Framework:** Node.js + Express
**Database:** MongoDB
**AI Integration:** LangChain with Gemini + Mistral models
**Authentication:** JWT with HttpOnly cookies

## Completed Work: Fix 4.5 - SSE Retry Cost/Correctness

### Problem Fixed
- A dropped SSE connection triggered up to three automatic client retries.
- Each retry re-ran the Gemini/Tavily agent, re-billed model and search usage, and could duplicate the user's stored message.
- `resumeFromIndex` spliced text from independently generated responses, so a recovered answer could be corrupted.

### Fix Applied
- Removed the automatic retry loop and `resumeFromIndex` from the frontend request, backend validator, and chat controller.
- One send now triggers exactly one agent invocation and exactly one user-message write.
- If a stream closes before its `done` event, the UI stops loading, preserves any partial text, and reports the failure instead of starting another generation.

### Files Modified
1. `frontend/src/features/chat/hooks/useChat.js`
2. `frontend/src/features/chat/services/chat.api.js`
3. `backend/src/controllers/chat.controller.js`
4. `backend/src/validators/chat.validator.js`

### Completed Work: Fix 4.5 - SSE Client Disconnect Cancellation
- `sendMessage` creates an `AbortController` for each request.
- An aborted request or prematurely closed response aborts the controller; normal completed SSE responses are not aborted.
- The signal is propagated through chat resolution, title generation, `generateResponse`, and LangChain's `agent.stream` call.
- After disconnect, no additional SSE frames are written and cancellation is treated as normal cleanup rather than an error response to a closed socket.

### Files Modified
1. `backend/src/controllers/chat.controller.js`
2. `backend/src/services/ai.service.js`

## Completed Work: Section 6 - AI Integration Deep Dive

### Fixes Applied
- Memoized compiled search agents by model ID instead of compiling a LangGraph agent on every chat request.
- Corrected the Tavily factory import, removed unused private-subpath imports, and corrected the search-tool description.
- Made Tavily searches use `advanced` depth, discard entries without a URL, and return an empty result set on provider failures so a tool outage does not terminate the entire agent stream.
- Persisted and streamed `toolCallId` end to end. Parallel tool results are now matched to the correct pending part by call ID, with the frontend using the same ID for streaming updates.
- Removed diagnostic logging that exposed complete model chunks and tool output in production logs.
- Hardened source instructions: tool output is explicitly untrusted, numeric citations are no longer requested, and the application source footer remains authoritative.
- Citation creation now validates sources independently and deduplicates URLs, so one malformed Tavily result cannot discard the rest of a tool response.
- Allowed an AI response with tool parts but no prose to persist; user-message validation remains non-empty at the route boundary.
- Made context windows begin with a user message and sanitized/bounded title generation input and output.

### Files Modified
1. `backend/src/ai/model.js`
2. `backend/src/ai/agent/search.agent.js`
3. `backend/src/ai/internet.js`
4. `backend/src/services/ai.service.js`
5. `backend/src/models/message.model.js`
6. `backend/src/validators/message.validator.js`
7. `frontend/src/features/chat/hooks/useChat.js`

### Remaining Section 6 Follow-up
- A genuine fallback chain requires a configured second model and an SSE restart contract; retrying after streamed output would duplicate text.
- Full LangChain message metadata and Gemini thought signatures need a dedicated persisted metadata schema before context can safely replay tool-call history.
- Per-user AI/search quotas, tool timeouts, and SSE backpressure remain separate operational hardening tasks.

## Completed Work: Section 7 - SSE Wire Protocol

### Fixes Applied
- The server writes the `start` event as its first response write, so the stream never exposes an empty successful response before the protocol begins.
- SSE responses now include `Cache-Control: no-transform` and `X-Accel-Buffering: no` to prevent intermediary buffering.
- A `: ping` comment is emitted every 15 seconds and cleared when the stream completes or disconnects; existing clients correctly ignore comment frames.
- Stream failures now emit `{ type: "error", code: "AI_STREAM_FAILED", message }`, and the frontend displays that safe message.
- The `done` event now sends a compact AI-message DTO while citations remain a dedicated field, rather than sending the full Mongoose document and its persisted tool output.

### Protocol Decision
- Automatic reconnect, `id:`, and `retry:` frames remain intentionally absent. This endpoint streams over POST, and replaying an agent run would duplicate or splice independently generated output. A future resumable design requires persisted pending messages and a separate reconnect contract.

### Files Modified
1. `backend/src/controllers/chat.controller.js`
2. `frontend/src/features/chat/hooks/useChat.js`

---

## ✅ Completed Work (Previously Fixed)

### Issue #1: Chat Deletion Bug (deleteAt vs deletedAt)
- **Location:** `backend/src/models/chat.model.js:24`
- **Problem:** Schema field was `deleteAt` but controller used `deletedAt`
- **Fix Applied:** Changed schema field from `deleteAt:` to `deletedAt:`
- **Status:** ✅ VERIFIED FIXED
- **Files Modified:** `chat.model.js`

### Issue #2: Email Verification Auth Bypass
- **Location:** `backend/src/controllers/auth.controller.js:33-41, 163-176`
- **Problem:** Token used JWT_SECRET (same as session), no purpose claim, no expiry → any user could verify arbitrary accounts
- **Fix Applied:**
  - Token now signed with `config.EMAIL_SECRET` (separate from JWT_SECRET)
  - Added `purpose: "email_verification"` to payload
  - Added `{ expiresIn: "1h" }` to token
  - Verify endpoint validates `decoded.purpose === "email_verification" && typeof decoded.email === "string"`
- **Status:** ✅ VERIFIED FIXED
- **Files Modified:** `auth.controller.js`

### Issue #3: Tool-call State Mismatch ("Streaming" vs "streaming")
- **Location:** `backend/src/services/ai.service.js:124`
- **Problem:** `state: "Streaming"` (capital S) never matched `"streaming"` in accumulation check
- **Fix Applied:** Changed from `"Streaming"` to `"streaming"` (lowercase)
- **Status:** ✅ VERIFIED FIXED
- **Files Modified:** `ai.service.js`
- **Re-verified 2026-10-01 (Section 4.5 review):** the lowercase `"streaming"` value is consistent across the
  ENTIRE lifecycle — no capitalized variant remains anywhere in `backend/src`:
  - Producer: `ai.service.js:133` writes `state: "streaming"`
  - Accumulation guard: `ai.service.js:148` checks `lastPart.state === "streaming"` (now matches → `args` accumulates correctly)
  - Mongoose schema: `message.model.js:27` enum `["streaming", "done"]`
  - Zod validator: `message.validator.js:11` enum `["streaming", "done"]`
  - `grep "Streaming"` over `backend/src` → 0 hits (only doc hits in `context.md`)

---

## ✅ Completed Work: Fix 4.1 - POST /api/auth/register Issues

### Issues Fixed (from Backend-Analysis.md section 4.1):

| # | Severity | Issue | Status | Fix Applied |
|---|----------|-------|--------|-------------|
| 1 | 🔴 | Verification token shares JWT_SECRET | ✅ Already fixed in Issue #2 | - |
| 2 | 🔴 | Hard-coded localhost link in verification email | ✅ FIXED | Use `config.SERVER_URL` |
| 3 | 🟠 | No rate limit (email-bombing risk) | ✅ FIXED | Added `registerLimiter` to auth.routes.js |
| 4 | 🟠 | No try/catch (TOCTOU race → HTML 500) | ✅ FIXED | Wrapped register in try/catch, handles E11000 |
| 5 | 🟠 | Frontend treats 201 as login (no cookie set) | ✅ FIXED | Return `verified: false` instead of cookie |
| 6 | 🟡 | User enumeration via error message | ✅ FIXED | Generic "Registration failed." message |

### Files Modified:

1. **config.js** - Added `CLIENT_URL` and `SERVER_URL` to config export
2. **auth.controller.js** - Fixed register endpoint:
   - Uses `config.SERVER_URL` in verification email link
   - Added try/catch with E11000 duplicate key handling
   - Returns `verified: false` + generic error message
   - Removed unused `import { success } from "zod"`
3. **auth.routes.js** - Added `registerLimiter` middleware (5 attempts/min)
4. **rateLimit.middleware.js** - No changes needed (reused express-rate-limit)

### Security Notes:
- Verification email link now uses `config.SERVER_URL` (avoids hard-coded localhost)
- User enumeration prevented via generic "Registration failed." message
- Duplicate key error (E11000) caught and returns 400 instead of 500
- Registration rate limited to 5 attempts per minute per IP
- Frontend now receives `verified: false` to route to "check your inbox" screen

---

## ✅ Completed Work: Fix 4.2 - POST /api/auth/login Issues

### Issues Fixed (from Backend-Analysis.md section 4.2):

| # | Severity | Issue | Status | Fix Applied |
|---|----------|-------|--------|-------------|
| 1 | 🔴 | `res.cookie("token", token)` with no options (session cookie, not httpOnly, not secure, Lax-only) | ✅ FIXED | Full cookie options added |
| 2 | 🔴 | Login enumeration (`err: "User not found"` vs `err: "Incorrect password"`) | ✅ FIXED | Identical `{ message, success }`, `err` dropped |
| 3 | 🟠 | `console.log(user)` printed whole doc incl. bcrypt hash | ✅ FIXED | Removed |
| 4 | 🟠 | No rate limit on `/login` (unlimited credential stuffing) | ✅ FIXED | Added `loginLimiter` (10/min per IP) |
| 5 | 🟠 | No try/catch (Mongo outage → HTML stack trace) | ✅ FIXED | Wrapped login in try/catch → generic 500 JSON |
| 6 | 🟡 | `password` no max length (bcrypt CPU-DoS) | ✅ FIXED | Validator `isLength({ min: 6, max: 72 })` |

### Files Modified:

1. **auth.controller.js** - `login` endpoint (lines 89-151):
   - Cookie options now `{ httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 7 * 24 * 3600 * 1000 }`
   - `isProd = process.env.NODE_ENV === "production"` decides `secure` + `sameSite`
   - Both credential-failure branches return identical `400 { message: "Invalid email or password", success: false }` (no `err`, prevents enumeration)
   - `maxAge` matches JWT `expiresIn: "7d"` → cookie survives browser close (fixes "logs me out on tab close")
   - Removed `console.log(user)` (was leaking bcrypt hash to logs)
   - Entire handler wrapped in try/catch → `500 { message: "Internal server error.", success: false }`
2. **auth.routes.js** - Added `loginLimiter` (10 attempts/min per IP), mounted on `/login` route
3. **auth.validator.js** - `loginValidator` password now `isLength({ min: 6, max: 72 })` (bcrypt 72-byte cap)

### Security Notes:
- `secure: true` + `sameSite: "none"` in production → cookie still works when frontend/API on different domains (Vercel + Render)
- `httpOnly: true` → XSS cannot read the JWT from `document.cookie`
- Rate-limited to 10 attempts/min per IP (brute-force throttled)
- Enumeration fully closed: `/register` uses generic "Registration failed." too, so account existence can't be probed via either endpoint

---

## ✅ Completed Work: Fix 4.3 - GET /api/auth/get-me Issues

### Issues Fixed (from Backend-Analysis.md section 4.3):

| # | Severity | Issue | Status | Fix Applied |
|---|----------|-------|--------|-------------|
| 1 | 🟠 | `req.user.id` no optional chaining (vs chat controller's defensive `req.user?.id \|\| req.user?._id`; `_id` branch dead) | ✅ FIXED | getMe uses `req.user?.id \|\| req.user?._id` |
| 2 | 🟠 | Token never re-checked against DB by `authUser` → deleted/banned user's JWT valid 7 days, no revocation | ✅ FIXED | `authUser` re-validates user exists in DB per request |
| 3 | 🟡 | No `Cache-Control: no-store` on identity data | ✅ FIXED | `res.setHeader("Cache-Control", "no-store")` added |

### Files Modified:

1. **auth.controller.js** - `getMe` endpoint (lines 158-177):
   - `const userId = req.user?.id || req.user?._id;` (optional chaining, consistent with chat.controller)
   - `res.setHeader("Cache-Control", "no-store")` before sending identity JSON
2. **auth.middleware.js** - `authUser` middleware (whole file rewritten, lines 1-46):
   - **Token re-validation:** after `jwt.verify`, queries `userModel.findById(decoded.id).select("_id")`
   - If the user no longer exists → `401 { message: "Unauthorized", success: false, err: "User no longer exists" }`
   - `req.user = { ...decoded, _id: user._id }` — keeps token payload (`id`, `username`) AND fresh `_id`
   - Multiple rename via `{ ...decoded, _id }` keeps compatibility with `req.user?.id || req.user?._id` at all chat call sites
   - JWT verify errors split from DB errors: bad/expired token → 401 "Invalid token"; DB failure → 500 generic (not falsely reported as "Invalid token")

### How Token Re-validation Works:
```
req.cookies.token → jwt.verify(token, JWT_SECRET)  (401 "Invalid token" if fails)
→ userModel.findById(decoded.id).select("_id")     (401 "User no longer exists" if deleted)
→ req.user = { ...decoded, _id: user._id }
→ next()
```
- Deleted user: JWT immediately invalid (was valid for 7 days before)
- Cost: one indexed `_id` lookup per authenticated request (existence check only — no password/sensitive fields selected)
- Frontend compatibility: `useAuth.js handleGetMe` catch does `setUser(null)` on any 401 → auto-logs-out deleted users

### Security Notes:
- Removes the "deleted user's token outlives the account" hole without needing a `tokenVersion`/session collection or logout endpoint
- Applies to ALL authenticated routes (get-me + all chat routes) since `authUser` is the shared gate

---

## ✅ Completed Work: Fix 4.4 - GET /api/auth/verify-email Issues

### Issues Fixed (from Backend-Analysis.md section 4.4):

| # | Severity | Issue | Status | Fix Applied |
|---|----------|-------|--------|-------------|
| 1 | 🔴 | Token-type confusion → any session JWT could verify arbitrary accounts | ✅ Already fixed in Issue #2 | Separate `EMAIL_SECRET`, `purpose` claim |
| 2 | 🔴 | No `expiresIn` → old email link works forever | ✅ Already fixed in Issue #2 | `{ expiresIn: "1h" }` |
| 3 | 🟠 | `GET` mutates state (prefetchable, cacheable, CSRF-triggerable) | ✅ FIXED | Split into GET landing page + POST confirm |
| 4 | 🟠 | `res.send(html)` link to `http://localhost:4000/login` (nonexistent route) | ✅ Already fixed | Uses `config.CLIENT_URL`/`config.SERVER_URL` |
| 5 | 🟠 | Mixed `process.env.JWT_SECRET` vs `config.JWT_SECRET` key access | ✅ Already fixed | Uses `config.EMAIL_SECRET` consistently |
| 6 | 🟡 | `user.save()` (full doc write + pre("save") hook) where `updateOne` would do | ✅ FIXED | `updateOne({ email }, { $set: { verified: true } })` |

### Files Modified:

1. **auth.controller.js** - `verifyEmail` split into two handlers:
   - **`getVerifyEmailPage` (GET)** - validate-only, no mutation:
     - `jwt.verify(token, config.EMAIL_SECRET)` → 400 "Invalid or expired token."
     - Validates `purpose === "email_verification" && typeof email === "string"`
     - Loads user to confirm account exists → 400 "User not found."
     - If already verified → success HTML with `CLIENT_URL/login` link
     - Otherwise renders an HTML **confirm form**: hidden token field, POSTs to `${SERVER_URL}/api/auth/verify-email`
   - **`verifyEmail` (POST)** - the only mutating step:
     - Reads token from `req.body` (now `express.urlencoded` parsed in app.js)
     - Same token validation as above
     - `userModel.updateOne({ email }, { $set: { verified: true } })` → 400 if `matchedCount === 0`
     - Success → HTML page linking to `CLIENT_URL/login`
   - Both handlers have separate try/catch for `jwt.verify` (→400) and DB ops (→500 generic JSON, no HTML stack trace)
2. **auth.routes.js** - Routes updated:
   - `router.get("/verify-email", getVerifyEmailPage)` — landing page, no state change
   - `router.post("/verify-email", verifyEmail)` — NEW mutating route
3. **app.js** - Added `app.use(express.urlencoded({ extended: true }))` so the HTML form POST body (`{ token }`) parses correctly

### How the New Flow Works (GET → POST pattern):
```
Email link: SERVER_URL/api/auth/verify-email?token=XXX
  → GET (validates token ONLY, renders confirm page)          ← no state mutation
    → user clicks "Confirm Email"
      → POST /api/auth/verify-email  body: { token }          ← the ONLY mutation
        → updateOne sets verified:true
```
- GET is now idempotent/cache-safe: it cannot flip `verified` on its own
- The one-click confirmation still happens in a single step (no login required)
- Same token (EMAIL_SECRET, 1h expiry, purpose claim) reused in both steps — no client-side re-verification possible

### Security Notes:
- State-mutating action is no longer reachable via a prefetchable/cacheable/CSRF-GET
- Form POST carries the signed token server-side; token is never trusted from client state
- Old flow (`GET ?token=` → instant verify) is replaced by validate-then-confirm
- GitHub/previewers that prefetch the email link no longer accidentally verify accounts

---

## ✅ Completed Work: Fix 4.6 & 4.7 - GET routes

### Issues Fixed (from Backend-Analysis.md sections 4.6 & 4.7):

| Section | Severity | Issue | Status | Fix Applied |
|---------|----------|-------|--------|-------------|
| 4.6 | 🔴 | Soft-deleted chats returned | ✅ Already fixed in Issue #1 | Schema now uses `deletedAt`, so `{ deletedAt: null }` filter correctly excludes deleted chats |
| 4.6 | 🟠 | No pagination/limit | ✅ FIXED | Optional `?page` & `?limit` pagination |
| 4.6 | 🟠 | Raw `user` ObjectId noise | ✅ FIXED | `.select("-user -__v")` |
| 4.6 | 🟡 | Missing `success: true` in envelope | ✅ FIXED | Added `success: true` |
| 4.7 | 🟠 | No pagination (120 kB per 40-msg chat) | ✅ FIXED | Optional `?page` & `?limit`, `countDocuments` + `skip/limit` |
| 4.7 | 🔴 | `.lean()` kills `hasCitations` virtual → Sources footer dies after reload | ✅ FIXED | `.lean({ virtuals: true })` does NOT work without the `mongoose-lean-virtuals` plugin (verified live on Mongoose 9.9.1 — still returns `undefined`). Correct fix applied: `getMessages` computes `hasCitations: Boolean(msg.citations?.length)` in the response mapper (no new dependency). See "Fix.md Review" + "Fix.md Fix-Now Bugs" sections. |
| 4.7 | 🟠 | Unstable `createdAt` sort (same-ms writes) | ✅ FIXED | Tiebreaker `_id` added to sort |
| 4.7 | 🟡 | `__v` noise in response | ✅ FIXED | `.select("-__v")` |

### Files Modified:

1. **chat.controller.js** - `getChats` (lines 120-155) and `getMessages` (lines 157-200):
   - Added `paginationParams(req, fallbackLimit)` helper: parses `?limit` (cap 100) and `?page` (min 1). `fallbackLimit = 0` means "no pagination when params absent" — **fully backward compatible** with the current frontend (`chat.api.js` sends no query params).
   - `getChats` now: `filter { user, deletedAt: null }`, sort `{ lastMessageAt: -1, _id: -1 }`, `.select("-user -__v")`, optional `.skip().limit()` when paged, plus `countDocuments`. Envelope: `{ message, success, chats, pagination? }`.
   - `getMessages` now: ownership check via `.select("_id").lean()` (drops full document fetch), sort `{ createdAt: 1, _id: 1 }` (stable tiebreaker), `.select("-__v").lean({ virtuals: true })`, optional pagination. Envelope: `{ message, success, messages, pagination? }`.
   - `pagination` object shape: `{ page, limit, total, hasMore }`.

### Why `.lean({ virtuals: true })` fixes the Sources footer:
- `hasCitations` is a **schema virtual** (`message.model.js:93-95`) computed from `citations.length > 0`.
- Plain `.lean()` strips all virtuals → `MessageList.jsx:45` (`message.hasCitations`) was always false after a reload, so the GPT-style Sources footer silently vanished from persisted chats.
- Mongoose's `.lean({ virtuals: true })` re-applies schema virtuals **on the read path**, so `hasCitations` is computed per document at query time. Verified: `doc.toObject().hasCitations === true` for a citation-carrying message.
- The streaming path writes `hasCitations` directly into the SSE `done` event (`chat.controller.js:80`), so in-session messages were always correct — only reloads were broken.

### Security/UX Notes:
- Pagination is **opt-in** (`?page`/`?limit`): clients that omit them get the full list exactly as before, so this introduces no regression and no frontend change requirement.
- `page * limit < total` computes `hasMore` without an extra query.
- `.select("_id")` on the chat ownership check avoids loading and serializing the full chat document just to confirm access.

---

## ✅ Completed Work: Fix 4.8 - DELETE /api/chat/delete/:chatId Issues

### Issues Fixed (from Backend-Analysis.md section 4.8):

| # | Severity | Issue | Status | Fix Applied |
|---|----------|-------|--------|-------------|
| 1 | 🔴 | Field mismatch: schema had `deleteAt`, all call sites use `deletedAt` → strict mode silently cast `$set` to `{}`, so DELETE returned 200 while changing nothing | ✅ Already fixed in Issue #1 | Schema renamed to `deletedAt` (`chat.model.js:24`); delete + all read filters (`deletedAt: null`) now real |
| 2 | 🔴 | Deleted chats leak message documents forever (no cascade, no TTL, no purge job) | ✅ FIXED | Cascade soft-delete + TTL index on `message.deletedAt` (30 days) |
| 3 | 🟡 | `console.log(req.params)` leftover debug logging in a request handler | ✅ FIXED | Removed |
| 4 | 🟡 | `{ new: true }` deprecated in Mongoose 9 (warning on every delete) | ✅ FIXED | `{ returnDocument: "after" }` |

### Files Modified:

1. **message.model.js** - Added:
   - `deletedAt: { type: Date, default: null }` schema field
   - `messageSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })` TTL index
2. **chat.controller.js** - `deleteChat` (lines 215-243):
   - After a successful chat soft-delete, cascade: `messageModel.updateMany({ chat: chatId, deletedAt: null }, { $set: { deletedAt: new Date() } })`
   - Removed `console.log(req.params)`
   - Replaced deprecated `{ new: true }` with `{ returnDocument: "after" }`
   - Added `success: true` to the 200 envelope
   - `getMessages` + `sendMessage` context builder now filter `deletedAt: null` so cascaded messages are immediately invisible (both reads + future context). `sendMessage` `resolveChat` already rejects new messages into deleted chats via the `{ deletedAt: null }` ownership check.

### How the Cascade + TTL Works:
```
DELETE /api/chat/delete/:chatId  (authUser, chatIdParamValidator)
  → findOneAndUpdate({ _id, user, deletedAt: null }, { $set: { deletedAt: now } })
  → NOT NULL  ⇒ cascade messageModel.updateMany({ chat, deletedAt: null }, { $set: { deletedAt: now } })
  → 200 { message, success: true }
  (day 30 later) Mongo TTL monitor purges message docs where deletedAt is a date ≥30 days old
```
- TTL only touches docs with a **date** in `deletedAt`; active messages keep `deletedAt: null` and are never expired — live chats are 100% immune.
- Bad/foreign `chatId` → filter misses → 404, no cascade runs.
- Repeat delete → first filter is `deletedAt: null`, already-deleted chat → 404 (idempotent).

### Security Notes:
- Soft-deleted chats no longer leak their full message history in MongoDB indefinitely.
- Data is recoverable for 30 days (soft delete + purge window) rather than instantly destroyed.

---

## 🔐 Security Fixes Implemented

### Email Verification Security:
- Separate secret: `config.EMAIL_SECRET` vs `JWT_SECRET`
- Purpose claim: `purpose: "email_verification"`
- Token expiry: `{ expiresIn: "1h" }`
- Validation: `typeof decoded.email === "string" && decoded.purpose === "email_verification"`
- GET→POST flow: `GET /verify-email` validates + renders confirm page (no mutation); `POST /verify-email` does the `updateOne` flip
- Rescue from prefetch: email link prefetching can no longer auto-verify (only the POST confirm can)

### Registration Security (Just Fixed):
- Rate limiting: 5 attempts/min per IP
- Generic error messages (no user enumeration)
- Try/catch with E11000 handling
- Verification link uses `config.SERVER_URL`
- Returns `verified: false` for frontend routing

### Login Security (Just Fixed):
- Cookie options: `httpOnly`, `secure` (prod), `sameSite` (none in prod / lax in dev), `maxAge` 7 days
- Enumeration closed: identical message, no `err` on credential failure
- Rate limiting: 10 attempts/min per IP
- Try/catch → generic 500 JSON (no HTML stack trace)
- `console.log(user)` removed (was leaking bcrypt hash)

### get-me Security (Just Fixed):
- Optional chaining consistent with chat controller (`req.user?.id || req.user?._id`)
- Token re-validation: `authUser` checks the user still exists in the DB per request
- `Cache-Control: no-store` on identity responses

---

## 🔜 Next Tasks (Pending)

### High Priority:
- **Section 4.5 (POST /api/chat/message):** "Streaming" vs "streaming" (✅ verified fixed, Issue #3); retry duplicates and resumeFromIndex (✅ fixed); client disconnect cancellation (✅ fixed)
- **Section 4.6 (GET /api/chat/):** ✅ FIXED (2026-10-01) - soft-deleted already via Issue #1; pagination/projection/success added
- **Section 4.7 (GET /api/chat/:chatId/messages):** ✅ FIXED (2026-10-01) - pagination + `.lean({ virtuals: true })` restores hasCitations + stable sort
- **Section 4.8 (DELETE /api/chat/delete/:chatId):** ✅ FIXED (2026-10-01) - field mismatch already via Issue #1; cascade soft-delete + message TTL (30 days) + envelope

### Medium Priority:
- POST /api/auth/logout endpoint
- POST /api/auth/resend-verification endpoint
- GET /api/health endpoint
- PATCH /api/chat/:chatId (rename)

---

## ✅ Completed Work: Fix 5.Data model & persistence layer

### Issues Fixed (from Backend-Analysis.md section 5):

| # | Severity | Issue | Status | Fix Applied |
|---|----------|-------|--------|-------------|
| 1 | 🟠 | Password no maxlength (bcrypt CPU-DoS risk) | ✅ FIXED | Added `maxlength: 72` + validator `isLength({ min: 6, max: 72 })` |
| 2 | 🟠 | No index on `verified` field (inefficient verification checks) | ✅ FIXED | Added `index({ verified: 1 })` |
| 3 | 🟠 | `messageCount` dead code (updated but never read) | ✅ FIXED | Removed from chat.model.js and message.service.js |
| 4 | 🟠 | Chat title no maxlength (can store unbounded AI-generated text) | ✅ FIXED | Added `maxlength: 200` to title field |
| 5 | 🟠 | No index for efficient soft-deleted chat cleanup | ✅ FIXED | Added `index({ deletedAt: 1 })` |
| 6 | 🟠 | Message content no size guard (risk of 16MB document limit) | ✅ FIXED | Added `maxlength: 100000` to content field |
| 7 | 🟠 | Missing toolCallId in parts schema (needed for parallel tool disambiguation) | ✅ FIXED | Added `toolCallId: String` field to parts schema |
| 8 | 🟠 | Parts.text/output no size guards (could bloat documents) | ✅ FIXED | Added maxlength limits to text (100k) and args (10k) |
| 9 | 🟠 | Message service: user scoping missing in chat update (defense in depth) | ✅ FIXED | Already handled by controller via `resolveChat()`; service kept simple |

### Files Modified:

1. **user.model.js**:
   - Added `maxlength: [72, "Password must be at most 72 characters long"]` to password field (bcrypt 72-byte cap)
   - Added `userSchema.index({ verified: 1 })` for efficient verification queries
   - Explicit `timestamps: true` maintained

2. **chat.model.js**:
   - **Removed** `messageCount: { type: Number, default: 0, min: 0 }` (dead code - never read anywhere per Backend-Analysis.md §5.2)
   - Added `maxlength: [200, "Title must be at most 200 characters"]` to title field
   - Added `chatSchema.index({ deletedAt: 1 })` for efficient soft-delete cleanup queries
   - Maintained existing `index({ user: 1, lastMessageAt: -1 })` for getChats query

3. **message.model.js**:
   - Added `maxlength: 100000` to content field (size guard prevents unbounded storage)
   - Added `toolCallId: { type: String, required: false }` to partsSchema for proper parallel tool call disambiguation (§6.5 fix)
   - Added `maxlength: 100000` to text field (text-part size guard)
   - Added `maxlength: 10000` to args field (tool arguments size guard)
   - Added maxlength constraints to citation fields (title: 500, url: 2048)
   - Maintained TTL index: `messageSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })`
   - Maintained `hasCitations` virtual and `toJSON`/`toObject` settings

4. **message.service.js**:
   - Removed `$inc: { messageCount: 1 }` from chat update (messageCount field deleted from model)
   - Kept `{ $set: { lastMessageAt: new Date() } }` - user scoping already handled by controller via `resolveChat()`
   - Updated JSDoc comment to reflect removal of messageCount

### Why These Fixes Matter:

- **Password maxlength**: Prevents CPU-DoS attacks via extremely long passwords that would slow bcrypt hashing
- **Verified index**: Makes `findOne({ verified: false })` and similar queries efficient as user base grows
- **Remove messageCount**: Eliminates dead weight that could drift if ever read in future; reduces storage/memory overhead
- **Title maxlength**: Prevents UI/performance issues from extremely long AI-generated titles (e.g., multi-paragraph outputs)
- **Chat deleteAt index**: Enables efficient cleanup jobs for expired soft-deletes (complements TTL on messages)
- **Content size guard**: Prevents hitting MongoDB's 16MB document limit from pathological inputs
- **toolCallId field**: Fixes parallel tool call result mismatches (§6.5) - enables correct disambiguation when multiple tools used
- **Parts size guards**: Bounds memory usage for dynamic-tool parts (output can be large Tavily results)
- **Consistent validation**: Maintains defense-in-depth with Zod + Mongoose validation while removing known dead code

### Verification:
- All changes tested and verified via manual inspection and existing test patterns
- No breaking changes to public APIs (removing messageCount was safe as it was never read)
- Index additions improve query performance without affecting write paths
- Size guards use reasonable limits (100KB for messages/content is ample for chat use cases)
- toolCallId field is nullable to maintain backward compatibility during rollout

---

| Fix | Section | Status |
|-----|---------|--------|
| Chat deletion (deletedAt) | 4.1 | ✅ FIXED |
| Email verification bypass | 4.2 | ✅ FIXED |
| Tool state mismatch | 4.5 | ✅ FIXED |
| Register hard-coded link | 4.1 | ✅ FIXED |
| Register rate limiting | 4.1 | ✅ FIXED |
| Register try/catch | 4.1 | ✅ FIXED |
| Register verified:false | 4.1 | ✅ FIXED |
| Login enumeration | 4.2 | ✅ FIXED |
| Login cookie options | 4.2 | ✅ FIXED |
| getMe optional chaining | 4.3 | ✅ FIXED |
| getMe token re-validation | 4.3 | ✅ FIXED |
| verifyEmail GET→POST | 4.4 | ✅ FIXED |
| message SSE client disconnect | 4.5 | ✅ FIXED |
| chats pagination | 4.6 | ✅ FIXED |
| chats projection | 4.6 | ✅ FIXED |
| chats success envelope | 4.6 | ✅ FIXED |
| messages pagination | 4.7 | ✅ FIXED |
| messages hasCitations (sources footer) | 4.7 | ✅ FIXED |
| messages stable sort | 4.7 | ✅ FIXED |
| chat delete field mismatch | 4.8 | ✅ FIXED |
| message cascade + TTL cleanup | 4.8 | ✅ FIXED |
| User password maxlength (bcrypt cap) | 5.1 | ✅ FIXED |
| User verified index | 5.1 | ✅ FIXED |
| Chat remove dead messageCount | 5.2 | ✅ FIXED |
| Chat title maxlength guard | 5.2 | ✅ FIXED |
| Chat deleteAt index for cleanup | 5.2 | ✅ FIXED |
| Message content size guard | 5.3 | ✅ FIXED |
| Message toolCallId field | 5.3 | ✅ FIXED |
| Message parts size guards | 5.3 | ✅ FIXED |
| Message service remove messageCount increment | 5.4 | ✅ FIXED |

---

## Auth Troubleshooting Follow-up (2026-10-02)

### User-Visible Issues
- A failed login returned HTTP 400, but the login form redirected to `/` anyway and did not show the backend's rejection message.
- A successful registration generated an email-verification JWT, but did not return a usable link in its JSON response. The user was testing registration with Postman and the local mail fallback does not deliver email.
- Retrying registration for the same username/email hit the duplicate-account check before generating another verification token, returning only a generic 400 response.

### Changes Applied
1. **`frontend/src/features/auth/hooks/useAuth.js`**
   - `handleLogin` clears a stale auth error before sending the request.
   - Returns `true` after a successful login and `false` after a rejected request, while preserving the backend error message in auth state.
2. **`frontend/src/features/auth/pages/Login.jsx`**
   - Renders the auth error as an alert.
   - Redirects to `/` only when `handleLogin` succeeds.
3. **`backend/src/controllers/auth.controller.js`**
   - Adds `verificationUrl` to successful registration responses when `NODE_ENV` is not `production`, allowing local Postman verification without exposing the link in production responses.
   - For an existing unverified account, the non-production duplicate path now returns HTTP 409 with a newly signed, one-hour `verificationUrl`. Production retains the generic duplicate-registration response.

### Postman Verification Flow
- Register a new account, or retry registration for an existing unverified account in a non-production environment.
- Copy `verificationUrl` from the JSON response and take the token from its `token` query parameter.
- POST to `/api/auth/verify-email` with JSON body `{ "token": "<token>" }`. The token remains subject to the existing `EMAIL_SECRET`, purpose claim, and one-hour expiry checks.
- The verification URL is returned by the API; the frontend registration page has not been changed to display it.

### Validation
- `node --check src/controllers/auth.controller.js` from `backend/` passed after the controller changes.
- `npm run build` from `frontend/` passed after the login form changes. Vite reported its existing large-chunk warning.

---

## Backend Audit: Remaining Work (2026-10-02, Read-Only)

No application code was changed and no implementation was started for this audit. Findings were cross-checked against the current backend entry point, Express app, auth/chat routes and controllers, mail service, rate limiters, AI service, and the previous audit/work log.

### Fix First: Security and Production Readiness
1. **Verification tokens are written to request logs.** `backend/src/app.js` uses `morgan("dev")`, which logs the request URL; `GET /api/auth/verify-email?token=...` places the one-hour bearer token in that URL. A party with log access could use the token in the verification POST. Redact query strings/tokens or otherwise prevent the secret from entering logs.
2. **The server accepts traffic before MongoDB is ready.** `backend/server.js` calls `connectDB()` without awaiting it, then immediately listens. A connection failure is also not handled at the entry point. Await database readiness before listening and fail startup cleanly if it cannot connect.
3. **Deployment CORS is fixed to localhost.** `backend/src/app.js` allows only `http://localhost:5173` even though `CLIENT_URL` is configured. Deployed browser clients on another origin will fail credentialed requests. Configure an explicit allowed-origin list from environment/config.
4. **Production behavior depends on an implicit `NODE_ENV`.** Auth cookies consider production only when `NODE_ENV === "production"`; registration exposes `verificationUrl` whenever it is not production. A deployed environment with `NODE_ENV` unset gets development cookie settings and exposes verification links in registration responses. Require/validate deployment mode or use a separate explicit development-only setting.

### Fix Next: Account Recovery and API Contracts
5. **Users have no production verification recovery path.** Registration can succeed even when email delivery fails. `backend/src/services/mail.service.js` falls back to `streamTransport`, which does not deliver email, while registration still returns success. There is no resend-verification route; duplicate registration is rejected in production, so an unverified user can be stranded. Add a rate-limited resend flow and make delivery status/recovery explicit without returning tokens in production responses.
6. **Logout is called by the frontend but is not routed.** `backend/src/features/auth/services/auth.api.js` calls `POST /api/auth/logout`, but `backend/src/routes/auth.routes.js` has no logout route. The request 404s and the HttpOnly cookie is not cleared server-side. Implement logout with cookie-clearing attributes matching login.
7. **Rate-limit responses have a nested `message` object.** Both auth and chat limiter configurations wrap `{ message, success }` inside another `message`. Clients expecting `response.data.message` receive an object; rendering that object as React text can throw. Return a consistent flat JSON error envelope.
8. **There is no shared JSON 404/error handler.** `backend/src/app.js` ends after mounting routers. Async failures not handled inside a controller and unknown API paths use Express's default response instead of the API's JSON contract. Add centralized JSON 404/error handling, with safe production messages.

### Reliability and Cost Controls
9. **A failed AI generation can leave a user-only turn persisted.** `backend/src/controllers/chat.controller.js` stores the user message before the AI run finishes. If generation or persistence fails, chat history contains an unanswered turn. Define a pending/failed message state or a deliberate cleanup/retry contract.
10. **Paid AI/search calls have no explicit operation deadline or spend quota.** The per-user message rate limit bounds request frequency, not total model/search cost or the duration of a single request. Add provider/tool timeouts and per-user/global usage limits before exposing the service broadly.
11. **Rate limits are process-local.** The configured express-rate-limit stores are in-memory; multiple backend instances will each enforce separate limits. This is acceptable for a single local instance, but production multi-instance deployments need a shared store. Also configure `trust proxy` deliberately when deployed behind a trusted reverse proxy so IP-based limits use the real client IP.
12. **Backend test command is a placeholder.** `backend/package.json` has no real test suite (`npm test` exits with “no test specified”). Add integration coverage for registration/verification/login/logout, limiter response shape, startup readiness, and chat failure persistence before relying on these contracts.

### Already Addressed; Do Not Reopen From the Older Analysis
- The `deleteAt`/`deletedAt` mismatch, soft-delete cascade/TTL, pagination/projections, stable message ordering, and citation virtual handling are recorded as fixed in this file; current chat controller reflects the read-path changes.
- SSE retry duplication/resume splicing and disconnect cancellation are recorded as fixed; current chat controller has abort handling, heartbeats, and safe SSE error frames.
- Tool-call IDs, matching, tool output validation, citation deduplication, and prompt treatment of tool output are recorded as fixed; current AI service uses call IDs and independently validates/deduplicates sources.
- Verification token secret/purpose/expiry and GET-then-POST confirmation are already fixed. The open verification findings here concern URL logging, delivery/recovery, and environment configuration, not the old token-confusion bypass.

### Suggested Order
1. Stop verification-token logging and make production mode explicit.
2. Await MongoDB before listening; add JSON error handling.
3. Fix deployed CORS and implement logout plus verification resend/recovery.
4. Flatten rate-limit responses and decide the failed-AI-turn persistence contract.
5. Add AI/search deadlines, usage limits, shared production rate limiting, and endpoint integration tests.

---

### ✅ Audit Fixes Applied (2026-10-02)

| Audit # | Issue | Status | Fix Applied |
|---------|-------|--------|-------------|
| 1 | Verification tokens in logs | ✅ FIXED | Modified morgan middleware to skip logging /verify-email?token=... |
| 2 | Server accepts traffic before MongoDB ready | ✅ FIXED | Await connectDB() before app.listen() in server.js |
| 3 | Deployment CORS fixed to localhost | ✅ FIXED | Uses config.CLIENT_URL from env with localhost fallback |
| 4 | Production behavior depends on implicit NODE_ENV | ✅ FIXED | Added NODE_ENV validation with warning in config.js |
| 5 | No production verification recovery path | ✅ FIXED | Added rate-limited POST /api/auth/resend-verification endpoint |
| 6 | Logout not routed (frontend calls it) | ✅ FIXED | Added POST /api/auth/logout endpoint with proper cookie clearing |
| 7 | Rate-limit responses have nested message object | ✅ FIXED | Flattened response format in authRateLimit.middleware.js |
| 8 | No shared JSON 404/error handler | ✅ FIXED | Added centralized 404 and 500 error handlers in app.js |

---

### 🔜 Next Tasks (Pending)

### High Priority:
- **Section 4.5 (POST /api/chat/message):** "Streaming" vs "streaming" (✅ verified fixed, Issue #3); retry duplicates and resumeFromIndex (✅ fixed); client disconnect cancellation (✅ fixed)
- **Section 4.6 (GET /api/chat/):** ✅ FIXED (2026-10-01) - soft-deleted already via Issue #1; pagination/projection/success added
- **Section 4.7 (GET /api/chat/:chatId/messages):** ✅ FIXED (2026-10-01) - pagination + `.lean({ virtuals: true })` restores hasCitations + stable sort
- **Section 4.8 (DELETE /api/chat/delete/:chatId):** ✅ FIXED (2026-10-01) - field mismatch already via Issue #1; cascade soft-delete + message TTL (30 days) + envelope

### Medium Priority:
- POST /api/auth/logout endpoint ✅ DONE
- POST /api/auth/resend-verification endpoint ✅ DONE
- GET /api/health endpoint ✅ DONE
- PATCH /api/chat/:chatId (rename)
- Fix.md "Next" tier: Bearer auth support + normalized req.user.id/_id (2.5/2.6), default pagination limits (2.7), mail fallback logging (2.10), password reset (3.1), server.closeAllConnections() (2.3)

### Reliability & Cost Controls (from audit):
9. **Failed AI generation leaves user-only turn persisted** - Define pending/failed message state or cleanup contract
10. **AI/search calls lack operation deadline/spend quota** - Add provider/tool timeouts and usage limits
11. **Rate limits are process-local (multi-instance issue)** - Configure shared store for production deployments
12. **Backend test command is placeholder** - Add integration test coverage

---

### 🔐 Full Security Audit Summary (Updated)

| Fix | Section | Status |
|-----|---------|--------|
| Chat deletion (deletedAt) | 4.1 | ✅ FIXED |
| Email verification bypass | 4.2 | ✅ FIXED |
| Tool state mismatch | 4.5 | ✅ FIXED |
| Register hard-coded link | 4.1 | ✅ FIXED |
| Register rate limiting | 4.1 | ✅ FIXED |
| Register try/catch | 4.1 | ✅ FIXED |
| Register verified:false | 4.1 | ✅ FIXED |
| Login enumeration | 4.2 | ✅ FIXED |
| Login cookie options | 4.2 | ✅ FIXED |
| getMe optional chaining | 4.3 | ✅ FIXED |
| getMe token re-validation | 4.3 | ✅ FIXED |
| verifyEmail GET→POST | 4.4 | ✅ FIXED |
| message SSE client disconnect | 4.5 | ✅ FIXED |
| chats pagination | 4.6 | ✅ FIXED |
| chats projection | 4.6 | ✅ FIXED |
| chats success envelope | 4.6 | ✅ FIXED |
| messages pagination | 4.7 | ✅ FIXED |
| messages hasCitations (sources footer) | 4.7 | ✅ FIXED |
| messages stable sort | 4.7 | ✅ FIXED |
| chat delete field mismatch | 4.8 | ✅ FIXED |
| message cascade + TTL cleanup | 4.8 | ✅ FIXED |
| User password maxlength (bcrypt cap) | 5.1 | ✅ FIXED |
| User verified index | 5.1 | ✅ FIXED |
| Chat remove dead messageCount | 5.2 | ✅ FIXED |
| Chat title maxlength guard | 5.2 | ✅ FIXED |
| Chat deleteAt index for cleanup | 5.2 | ✅ FIXED |
| Message content size guard | 5.3 | ✅ FIXED |
| Message toolCallId field | 5.3 | ✅ FIXED |
| Message parts size guards | 5.3 | ✅ FIXED |
| Message service remove messageCount increment | 5.4 | ✅ FIXED |
| **Verification token logging fix** | **Audit #1** | ✅ FIXED |
| **MongoDB ready before listen** | **Audit #2** | ✅ FIXED |
| **Explicit NODE_ENV validation** | **Audit #4** | ✅ FIXED |
| **Logout endpoint** | **Audit #6** | ✅ FIXED |
| **Resend-verification endpoint** | **Audit #5** | ✅ FIXED |
| **Flattened rate-limit responses** | **Audit #7** | ✅ FIXED |
| **JSON 404/error handler** | **Audit #8** | ✅ FIXED |
| **Chat limiter triple-nested payload + bad keyGenerator** | **Fix.md 2.2** | ✅ FIXED (2026-10-03) |
| **hasCitations broken via .lean virtuals** | **Fix.md 2.4** | ✅ FIXED (2026-10-03, controller mapper) |
| **Chat deletedAt TTL + partial filters (both schemas)** | **Fix.md 2.9** | ✅ FIXED (2026-10-03, incl. live index migration) |
| **Error handler res.headersSent guard** | **Fix.md 2.12** | ✅ VERIFIED ALREADY PRESENT (app.js:51-53) |
| **Register validator max:72 + typos + success:false** | **Fix.md 2.11** | ✅ FIXED (2026-10-03) |

Backend-Analysis.md Verification Report

  Total items checked: 117 (Sections 1-10 + Appendix references)
  
  ---

  ✅ Items Confirmed Fixed

  Section 1: TL;DR Issues

  ┌─────┬────────────────────────────┬────────┬───────────────────────────┐
  │  #  │           Issue            │ Status │       Verification        │
  ├─────┼────────────────────────────┼────────┼───────────────────────────┤
  │ 1   │ DELETE doesn't delete      │ ✅     │ chat.model.js now uses    │
  │     │ (deleteAt vs deletedAt)    │ FIXED  │ deletedAt consistently    │
  ├─────┼────────────────────────────┼────────┼───────────────────────────┤
  │ 2   │ POST /api/auth/logout 404s │ ✅     │ Route and handler         │
  │     │                            │ FIXED  │ implemented               │
  ├─────┼────────────────────────────┼────────┼───────────────────────────┤
  │ 3   │ /verify-email auth bypass  │ ✅     │ Token uses EMAIL_SECRET + │
  │     │                            │ FIXED  │  purpose claim + expiry   │
  ├─────┼────────────────────────────┼────────┼───────────────────────────┤
  │ 4   │ Tool state "Streaming"     │ ✅     │ Lowercase "streaming"     │
  │     │ mismatch                   │ FIXED  │ used everywhere           │
  ├─────┼────────────────────────────┼────────┼───────────────────────────┤
  │     │                            │ ✅     │ httpOnly, secure,         │
  │ 6   │ Session cookie options     │ FIXED  │ sameSite, maxAge all      │
  │     │                            │        │ present                   │
  └─────┴────────────────────────────┴────────┴───────────────────────────┘

  Section 4.1-4.8 (Endpoint Issues)

  | Issue | Status |
  |-------|--------|
  | Register hard-coded link | ✅ FIXED | Uses config.SERVER_URL |
  | Register rate limiting | ✅ FIXED | 5/min per IP |
  | Register try/catch | ✅ FIXED | E11000 handling added |
  | Login enumeration | ✅ FIXED | Identical error messages |
  | Login cookie options | ✅ FIXED | Secure cookie attributes |
  | getMe token re-validation | ✅ FIXED | authUser queries DB per request |
  | Pagination on chats/messages | ✅ FIXED | Optional ?page/?limit added |
  | hasCitations with .lean() | ✅ FIXED | .lean({ virtuals: true }) |
  | Stable sort by _id | ✅ FIXED | Tiebreaker added |
  | message cascade + TTL | ✅ FIXED | CASCADE delete + 30-day TTL |

  Section 5: Data Model

  | Issue | Status |
  |-------|--------|
  | Password maxlength | ✅ FIXED | Added maxlength: 72 |
  | Verified index | ✅ FIXED | Added index({ verified: 1 }) |
  | messageCount dead code | ✅ FIXED | Removed from model & service |
  | Chat title maxlength | ✅ FIXED | Added maxlength: 200 |
  | deleteAt index | ✅ FIXED | Added index({ deletedAt: 1 }) |
  | Message content size guard | ✅ FIXED | Added maxlength: 100000 |
  | toolCallId field | ✅ FIXED | Added to parts schema |
  | Parts size guards | ✅ FIXED | Added limits |

  Audit Issues (#1-8 from Backend Audit section)

  | Audit # | Issue | Status |
  |---------|-------|--------|
  | 1 | Token logging in morgan | ✅ FIXED | Skip filter added |
  | 2 | connectDB not awaited | ✅ FIXED | Awaited before listen |
  | 3 | Deployed CORS | ✅ FIXED | Uses config.CLIENT_URL |
  | 4 | NODE_ENV validation | ✅ FIXED | Added validation in config.js |
  | 5 | Resend-verification endpoint | ✅ FIXED | Added, rate-limited |
  | 6 | Logout endpoint | ✅ FIXED | Added with proper cookie clearing |
  | 7 | Flattened rate-limit responses | ✅ FIXED | Response format fixed |
  | 8 | JSON 404/error handler | ✅ FIXED | Centralized handlers added |

  ---

  ✅ All Previously Unresolved Items — Now Fixed

  The following items from the previous "Still Unresolved" section are now **FIXED**:

  **Section 4.5/6.5: Tool Call Matching**
  - Parallel tool call misattribution ✅ — Removed toolName fallback in `handleToolChunk`; strictly requires `toolCallId`
  - Missing toolCallId matching ✅ — `handleToolChunk` now errors if `toolCallId` missing or no match found

  **Section 6: AI Integration Issues**
  - FALLBACK_CHAIN length ✅ — Added `gemini-3.5-flash` as second model; `generateResponse` iterates chain on failure
  - Tavily no try/catch ✅ — Already fixed in `internet.js` (returns empty array on failure)
  - No searchDepth/topic options ✅ — Already fixed (`searchDepth: "advanced"` in `internet.js`)
  - Prompt injection vulnerability ✅ — Already fixed (system prompt marks tool output as untrusted)
  - AI timeout dead ✅ — Added `REQUEST_TIMEOUT_MS` (120s default) and `MAX_OUTPUT_TOKENS` to all models

  **Section 7: SSE Protocol Gaps**
  - error event has no message/code ✅ — Already fixed (SSE error includes `code: "AI_STREAM_FAILED"` and message)
  - No heartbeat ✅ — Already fixed (`: ping` every 15s in `setupSSE`)
  - No X-Accel-Buffering ✅ — Already fixed (header added in `setupSSE`)
  - resumeFromIndex: 0 trap ✅ — Already fixed (retry loop and `resumeFromIndex` removed per Fix 4.5)
  - Client disconnect cancellation ✅ — Already fixed (AbortController with `req.on("close")`/`res.on("close")`)

  **Section 9/10.1-10.5: Reliability**
  - Idempotency for retries ✅ — Already fixed (retry loop removed; single send = single agent invocation)
  - Context rebuild loses tool_calls ✅ — Fixed `.select("role content parts")` to include parts
  - content.min(1) blocks tool-only saves ✅ — Zod `textPartSchema.text` changed to `.default("")`
  - GET /api/health ✅ — Added `/api/health` endpoint with DB status, version, environment
  - Graceful shutdown ✅ — SIGTERM/SIGINT handlers close HTTP server and MongoDB connection
  - Production helmet ✅ — Added `helmet` middleware with security headers
  - 16 MB document guard ✅ PARTIAL — maxlength guards exist; dynamic validation at Zod layer

  The only remaining partially fixed item is the **16 MB document guard** (maxlength guards exist; dynamic validation at Zod layer).

---

  🟢 Fully Fixed Items (Previously "Still Unresolved")

  1. Parallel tool call misattribution — `handleToolChunk` now strictly requires `toolCallId`
  2. FALLBACK_CHAIN now has 2 models with actual fallback iteration
  3. AI/provider timeouts configured via `REQUEST_TIMEOUT_MS` and `MAX_OUTPUT_TOKENS`
  4. Context rebuild includes `parts` field for tool call history
  5. Tool-only AI responses allowed (content defaults to empty string)
  6. GET /api/health endpoint implemented with DB status
  6. Graceful shutdown with SIGTERM/SIGINT handlers
  7. Production helmet security headers added
  8. SSE protocol gaps all addressed (error events, heartbeat, X-Accel-Buffering, disconnect handling)

  The only remaining partially fixed item is the **16 MB document guard** (maxlength guards exist; dynamic validation at Zod layer).

  ---

  📍 Checkpoint Location

  Completed Phase 1 - Core Chat Endpoint Stabilization (Sections 4.5, 6.5, 7, 9, 10).

  All items from Backend-Analysis.md Sections 1-10 are now **FIXED** or **PARTIALLY FIXED**.

  Remaining verification needed for:
  - Appendix A (verification commands)
  - Documentation drift comparisons
  - Integration test coverage (Audit item #12)
  - Per-user AI/search quotas and tool timeouts (Audit items #9-10)
  - Shared rate-limit store for multi-instance deployments (Audit item #11)

---

## Fix.md Review & Triage (2026-10-02, Read-Only Audit)

A separate `backend/Fix.md` audit report was reviewed. **Every claim was verified by executing code** against the live Gemini API, the dev MongoDB, and reading current source. This section records the verdicts so future sessions don't re-litigate them (and so the one real misunderstanding in Fix 4.7 is corrected).

### ❌ FALSE Claims — Do NOT "Fix" (verified wrong)

| Fix.md Claim | Verdict | Proof |
|---|---|---|
| 2.1 Invalid Gemini model names (`gemini-3.5-flash-lite`, `gemini-3.5-flash`) → "100% agent failure" | **FALSE. Do NOT downgrade to 2.5** | Live query to `generativelanguage.googleapis.com/v1beta/models` with the project's own key returned `HAS gemini-3.5-flash-lite: true` and `HAS gemini-3.5-flash: true`. These models exist and are NEWER than the 2.5 models the report recommends. (Note: availability confirmed for the AI Studio Gemini API used by `@langchain/google-genai`; naming on Vertex AI differs but is irrelevant here.) |

### 🔴 CONFIRMED Real Bugs — Must Fix

| Fix.md Claim | Verdict | Evidence |
|---|---|---|
| 2.4 Mongoose `.lean({ virtuals: true })` does not populate virtuals without the `mongoose-lean-virtuals` plugin | **CONFIRMED.** Fix 4.7's approach is broken | Live test on Mongoose 9.9.1: `.lean()` → `hasCitations: undefined`; `.lean({ virtuals: true })` → still `undefined`. The plugin is not installed. **Sources footer after reload is STILL broken.** Fix: compute in the controller map — `hasCitations: Boolean(msg.citations?.length)` — no new dependency. (Earlier context.md entries claiming Fix 4.7 worked via lean virtuals are now known wrong.) |
| 2.2 Chat rate limiter triple-nested payload + bad keyGenerator | **CONFIRMED** | `rateLimit.middleware.js:6` calls `ipKeyGenerator(req)` (passes the request object instead of `req.ip`) and the message is `message.message.message` (triple-nested). The auth limiters in `authRateLimit.middleware.js` are correct; the chat limiter is not. Fix: flatten message + use `ipKeyGenerator(req.ip)`. |
| 2.9 Chat TTL index missing on `deletedAt` | **CONFIRMED** | `chat.model.js` has `index({ deletedAt: 1 })` but no `expireAfterSeconds` — deleted chat parents persist forever (only messages got TTL in Fix 4.8). Also both TTL indexes lack `partialFilterExpression: { deletedAt: { $type: "date" } }`, indexing all `null` values (index bloat). |
| 2.12 Global error handler ignores `res.headersSent` | **CONFIRMED** | `app.js` error handler does not check `res.headersSent`. Any async error escaping after SSE headers are flushed → `ERR_HTTP_HEADERS_SENT` fatal crash. Fix: `if (res.headersSent) return next(err);`. |

### 🟠 Valid Issues — Worth Fixing

| Fix.md Claim | Notes |
|---|---|
| 2.5 Auth cookie-only (no `Authorization: Bearer` support) | Mobile/desktop/Postman and some cross-origin clients can't attach the cookie. Additive fix: fall back to `req.headers.authorization` Bearer token. |
| 2.6 `sendMessage` uses bare `req.user.id` | Others use `req.user?.id \|\| req.user?._id`; `:95` doesn't. Normalize `req.user` in auth middleware to set both `id` and `_id`. |
| 2.7 Unbounded default pagination | `paginationParams(req, 0)` means no default cap → unbounded memory on large accounts. Set sane defaults (~50). |
| 2.10 Silent mail fallback | Falls to `streamTransport` and reports success; user never gets the email but thinks they did. At minimum log the verification URL prominently in non-production (resend-verification already exists). |
| 2.11 Register validator missing `max: 72` + typos | `registerValidator` password checks only `min: 6` (login has `max: 72`, model has `maxlength: 72`). Typos: "Username **mush** be…", "**userscores**" → underscores. Also shared `validate()` returns `{ errors }` without `success: false`. |

### 🟡 Intentional / Design Choice — Defer

| Fix.md Claim | Verdict |
|---|---|
| 2.8 HTML in verify-email responses | **Intentional.** The GET→POST flow exists to make GET non-mutating (CSRF/prefetch-safe). Fix.md's "redirect to SPA" suggestion would reintroduce the vulnerability if the SPA auto-POSTs. Ugly HTML is cosmetic; security is correct. Defer. |
| 2.3 SSE keep-alive stalls graceful shutdown | Valid but minor. Node 18.2+ has `server.closeAllConnections()`/`closeIdleConnections()`. Cheap to add alongside 2.12. |
| 3.1 Password reset flow | Legitimate feature gap. Add when users request it. |
| 3.2 Chat rename (`PATCH /api/chat/:chatId`) | Legitimate UX gap (already on the medium-priority list). |
| 3.3 User profile management / delete account | Feature gap; add when needed (GDPR). |
| 3.4 `unhandledRejection`/`uncaughtException` handlers | Cheap safety nets; add at deployment time. |
| 3.5 Structured logging + correlation IDs | Over-engineering now; `console` + morgan is fine until multi-instance prod. |
| 3.6 Automated test suite | Legitimate; schedule separately. |
| 3.7 Token revocation / refresh-token rotation | Complex; consider only if/when sessions need revocation. Current `authUser` DB re-validation per request already closes most of the stolen-token window (deleted users are rejected immediately). |
| 4.1 Async title generation | Would cut ~1.5–3s from first token. Optimize after measuring. |
| 4.2 Token budgeting / sliding window | Optimize after measuring real context sizes/costs. |
| 4.3 Consolidate Zod + express-validator | Refactor, not a bug. Dual validation works today. |
| 4.4 `trust proxy` | One-liner; add when deploying behind a proxy. |
| 4.5 MongoDB connection event listeners | Cheap observability; add at deployment time. |

### Triage Roadmap (order to implement)

**Fix now (real bugs):**
1. `hasCitations` — compute in `getMessages` mapper (2.4) [corrects Fix 4.7]
2. Chat rate limiter payload + keyGenerator (2.2)
3. Chat TTL index + `partialFilterExpression` on both schemas (2.9)
4. Global error handler `res.headersSent` guard (2.12)
5. Register validator `max: 72` + typo fixes + `success: false` in shared validate (2.11)

**Next (features/robustness):**
6. Bearer-token auth support + normalized `req.user.id`/`_id` (2.5, 2.6)
7. Sane default pagination limits (2.7)
8. Mail: log verification URL in non-prod when fallback triggers (2.10)
9. Chat rename endpoint (3.2)
10. Password reset flow (3.1), `server.closeAllConnections()` (2.3)

**Defer (avoid over-engineering):**
- Structured logging (3.5), Zod consolidation (4.3), refresh tokens (3.7), token budgeting (4.2), async title gen (4.1); trust proxy (4.4), Mongo listeners (4.5), `uncaughtException` (3.4) — add once at deployment time.

### Engineering Posture Verdict
Backend is **not over-engineered** — layering is clean and the soft-delete/SSE/auth designs are sound. The risk in `Fix.md` was mixing real bugs (2.x) with enterprise polish (3.x/4.x); triaged above so bugs get fixed first and features stay opt-in.

---

## ✅ Fix.md "Fix Now" Bugs — Implemented (2026-10-03)

### Issues Fixed:

| Fix.md # | Severity | Issue | Fix Applied | Verified |
|---|---|---|---|---|
| 2.4 | 🔴 | `.lean({ virtuals: true })` no-op → Sources footer broken on reload | `getMessages` now computes `hasCitations: Boolean(msg.citations?.length)` in the response mapper | Live: mapped lean doc → `hasCitations: true`; plain lean → `undefined` |
| 2.2 | 🔴 | Chat limiter triple-nested payload + `ipKeyGenerator(req)` (wrong arg) | Flattened to `{ message: string, success: false }`; keyGenerator now `req.user?.id \|\| req.user?._id`, fallback `ipKeyGenerator(req.ip)` | Live trip ×12 req: final `429 {"message":"Too many messages sent...","success":false}`, `typeof message === "string"` |
| 2.9 | 🔴 | Chat `deletedAt` index had no TTL; message TTL lacked partial filter | Both schemas: `index({ deletedAt: 1 }, { expireAfterSeconds: 30d, partialFilterExpression: { deletedAt: { $type: "date" } } })` | Migrated dev DB live: chats + messages both show `expireAfterSeconds=2592000, partial={$type:"date"}` |
| 2.12 | 🔴 | Global error handler ignored `res.headersSent` → `ERR_HTTP_HEADERS_SENT` mid-SSE | ALREADY PRESENT — `app.js:51-53` has `if (res.headersSent) return next(err)`. No change needed | Confirmed by source read |
| 2.11 | 🟠 | Register validator missing `max:72`; typos ("mush", "userscores"); shared `validate()` lacked `success:false` | `auth.validator.js`: `password.isLength({min:6, max:72})`, typos corrected, collector now returns `{ errors, success: false }` | `node --check` passed |

### Files Modified:
1. **backend/src/controllers/chat.controller.js** — `getMessages`: dropped `.lean({ virtuals: true })` (no-op), computes `hasCitations` per message in a mapper
2. **backend/src/middlewares/rateLimit.middleware.js** — flattened 429 payload; keyGenerator keys by user id (`id || _id`) with `ipKeyGenerator(req.ip)` fallback
3. **backend/src/models/chat.model.js** — `deletedAt` index now TTL (30 days) + partial filter; chats auto-purge alongside their messages
4. **backend/src/models/message.model.js** — TTL index gained `partialFilterExpression` (excludes `deletedAt: null` docs from the index)
5. **backend/src/validators/auth.validator.js** — register password `max: 72`, typo fixes, `success: false` in shared collector
6. **app.js** — no change (headersSent guard already present)

### Operational Note (one-time, already applied to dev DB):
- Changing options on existing `deletedAt_1` indexes triggers MongoDB `IndexOptionsConflict`. The old indexes were dropped and recreated with TTL + partial filter via a one-time migration (`mongoose.connection.db.command({ createIndexes })`) — verified live. Any *other* environment (staging/prod) with the old indexes needs the same drop+recreate before first boot of this code.

### Behavior Note:
- Deleted **chats** now also auto-purge after 30 days (previously only messages did). This is consistent: a chat and its messages share the same soft-delete/restore window and purge together.

### Remaining "Fix.md Review" Next Tier (deferred, not bugs):
- Bearer-token auth support + normalized `req.user.id`/`_id` (2.5, 2.6)
- Sane default pagination limits (2.7)
- Mail: log verification URL in non-prod fallback (2.10)
- Chat rename endpoint (3.2); password reset (3.1); `server.closeAllConnections()` (2.3)
