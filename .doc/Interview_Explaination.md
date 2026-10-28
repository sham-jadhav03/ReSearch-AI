# 🎙️ ResearchAI — Interview Explanation Guide

> **60–90 second explanations for every endpoint + complete project flow**

---

## 🏆 "Tell Me About Your Project" — Complete Scripts

> Use these when the interviewer says: *"Walk me through a project you've built"* or *"Tell me about yourself and your work."*

---

### 🎯 The Problem

> **What problem did you solve?**

Most people doing research — students, analysts, developers — bounce between multiple Google tabs, read through long articles, and manually piece together information. Existing tools like ChatGPT answer from training data that can be stale, and raw Google Search dumps links without synthesizing answers.

**The core problem:** There was no tool that could:
1. Understand a research question in natural language
2. Pull **live, up-to-date information** from the web in real time
3. Return a **structured, source-backed answer** — not just a link dump or a hallucinated paragraph
4. Do all of this **streamed token-by-token**, so the user sees results immediately rather than waiting for a full response

---

### 💡 The Solution — What I Built

> **One-liner:** ResearchAI is a full-stack AI-powered answer engine — like Perplexity AI — where users ask questions and get structured, real-time answers backed by live web sources.

**Here's exactly what it does:**
- User types a question → the system decides if it needs a web search
- If yes → a **LangChain ReAct agent** autonomously calls the **Tavily Search API** to fetch live web results
- The AI (Google Gemini) reads those results and generates a structured markdown response
- The answer streams **token by token** to the user via **Server-Sent Events** — no waiting for the full response
- Web sources are parsed, deduplicated, and shown as **clickable citations** below the answer
- Everything is persisted — users can revisit past chats, which are organized in a sidebar

---

### 🗣️ 60-Second Elevator Pitch (Say This Out Loud)

> *Perfect for the first 60 seconds when asked "tell me about your project."*

---

**"I built ResearchAI — a full-stack AI-powered answer engine, similar to how Perplexity AI works.**

**The problem I was solving:** When people do research, they waste time reading multiple articles and piecing information together manually. Existing AI tools either hallucinate or use outdated training data.

**My solution:** I built an application where you type a question, and a LangChain agent — powered by Google's Gemini model — decides in real time whether to search the internet using the Tavily Search API. If it does search, it fetches live results, synthesizes them into a structured answer, and streams it back to the user token by token using Server-Sent Events. The sources are extracted, validated, deduplicated, and displayed as citations.

**On the backend,** I used Node.js with Express 5, MongoDB for persistence with soft deletes and TTL indexes, and JWT-based authentication — both email/password and Google OAuth. I implemented rate limiting, IDOR protection, and AbortController for client disconnect handling.

**On the frontend,** I used React with Redux Toolkit. The SSE stream is consumed in a custom `useChat` hook that processes typed events — text deltas, tool calls, results — and batches React re-renders via requestAnimationFrame to keep the UI smooth.

**The biggest technical challenge** was building the SSE streaming pipeline correctly — handling agent tool calls in the middle of a stream, persisting structured 'parts' (text blocks + tool call blocks) to MongoDB, and reconnecting citations to the persisted message on reload."

---

### 🔬 90-Second Deep Dive (For Technical Rounds)

> *Use when the interviewer follows up with "can you go deeper?" or when you're in a senior/SDE-2 round.*

---

**"Let me walk you through the architecture.**

The entry point is `POST /api/chat/message`. When it arrives, I create an `AbortController` and wire its `abort()` to both `req.close` and `res.close` — so if the user navigates away, the Gemini API call cancels immediately rather than running to completion and wasting quota.

Then `resolveChat()` either finds an existing chat — verifying ownership by including `user: userId` in the query, which closes an IDOR vulnerability — or creates a new one. For new chats, it calls a **separate fast Groq-hosted model** to generate a 2-4 word title from the user's first message. This is intentionally a different model from the main pipeline so title generation doesn't block the primary stream.

Then I open the SSE connection and run the **LangChain ReAct agent**. The agent has one tool: `internetSearch`, backed by Tavily, which returns up to 5 results. Gemini decides autonomously whether to invoke it based on whether the question needs current information. The stream emits typed events — `text-delta` for content chunks, `tool-call-start`, `tool-call-delta`, `tool-call-result` for the search lifecycle — and finally a `done` event with the persisted message and deduplicated citations.

On the frontend, `useChat.js` consumes these events. Text deltas are accumulated in a ref and rendered via `requestAnimationFrame` — batching updates to a maximum of 60fps rather than triggering a re-render per token. Tool call events build a live 'parts' array that renders a 'Searching the web...' indicator.

On persistence: messages store both a flat `content` field and a structured `parts` array — `[{ type: 'text', text }, { type: 'dynamic-tool', toolName, args, output, state }]`. This means when a user reopens a past chat, I can reconstruct exactly what the agent did — which searches it ran and what it found — not just the final answer.

For the database design, both Chat and Message models use **soft delete** — setting `deletedAt` on delete rather than removing the document. I put a TTL index with `partialFilterExpression: { deletedAt: { $type: 'date' } }` — this means the TTL index excludes all active records entirely, preventing index bloat and auto-purging deleted data after 30 days with zero cron jobs."

---

### 🌱 Fresher-Friendly Version (60 Seconds)

> *Use this if you're a fresher or the interviewer seems less technical.*

---

**"I built a project called ResearchAI — it's an AI chat application where users can ask research questions and get real-time, structured answers with sources from the internet.**

Think of it like a smarter Google — instead of getting 10 links, you get a well-formatted answer that actually synthesizes information from multiple sources, streamed live as the AI thinks.

**What I built on the backend:** A Node.js + Express REST API with MongoDB. Users can register, login with email/password or Google OAuth, and chat with the AI. I used JWT tokens stored in HttpOnly cookies for authentication. The AI uses Google's Gemini model through LangChain, and it can search the internet using the Tavily API when it needs current information.

**What I built on the frontend:** A React application with Redux for state management. The AI response streams character by character using Server-Sent Events — similar to how ChatGPT shows text appearing live. I built a sidebar for chat history, citation display for sources, and error handling with retry logic.

**What I'm most proud of:** Getting the streaming pipeline to work end-to-end — from the AI generating tokens, to those tokens appearing live on screen, to the final message being correctly saved to the database with all the source citations attached."

---

### 🔁 Common Follow-Up Questions & Quick Answers

| Interviewer asks | Your answer |
|---|---|
| **"Why SSE instead of WebSockets?"** | SSE is one-directional (server → client), which is all I need for AI streaming. It's simpler, works over HTTP/1.1, auto-reconnects natively, and avoids the overhead of WebSocket upgrade handshakes and bidirectional socket management. |
| **"How did you handle authentication?"** | JWT signed with a secret, stored as an HttpOnly cookie — JS can't read it, preventing XSS theft. For Google OAuth I used Passport.js. I also have a separate `EMAIL_SECRET` for email verification links so those tokens can't be used as auth tokens. |
| **"What if the AI model is down?"** | I built a fallback chain — the system tries Gemini Flash Lite first. If it fails before emitting any tokens, it silently retries with the larger Gemini Flash model. Once streaming starts, I don't retry because I can't restart mid-stream without duplicating content. |
| **"How did you handle the user closing the tab mid-stream?"** | I attach `AbortController.abort()` to both `req.on('close')` and `res.on('close')`. This signals LangChain to cancel the in-progress Gemini API call and the `for await` stream loop exits cleanly. |
| **"Why MongoDB? Why not PostgreSQL?"** | The message `parts` array — which stores mixed text blocks and tool call objects — is semi-structured data that fits naturally into MongoDB's flexible document model. Storing that in SQL would require multiple tables and JOINs for every message load. |
| **"What would you improve?"** | Short-lived access tokens + refresh token rotation instead of 7-day JWTs. A token blacklist for proper logout invalidation. Streaming response cancel button on the frontend. Possibly a vector database for semantic chat history retrieval instead of just the last 10 messages. |
| **"What was the hardest part?"** | The SSE streaming pipeline — specifically mapping LangChain's async generator chunks (AI messages, tool messages, partial tool call chunks) to a clean event protocol the frontend could consume, and then correctly persisting the final structured `parts` to MongoDB so citations survive a page reload. |
| **"How does it scale?"** | Each SSE connection holds a Node.js async stream open. Since Node is single-threaded event-loop based, it handles many concurrent streams efficiently without spawning threads. The rate limiter (10 msgs/min/user) prevents abuse. For further scale: horizontal scaling behind a load balancer, and moving to a message queue (e.g. Redis pub/sub) to decouple the AI pipeline from the HTTP layer. |

---

### 📌 One-Liner Answers (For Rapid-Fire Rounds)

- **What is it?** → "An AI answer engine that searches the web in real time and streams structured responses with citations."
- **Stack?** → "React + Redux frontend, Node/Express backend, MongoDB, LangChain with Gemini + Tavily, JWT auth + Google OAuth."
- **Biggest challenge?** → "End-to-end SSE streaming with LangChain agents — handling tool calls mid-stream and persisting structured message parts."
- **What's unique?** → "The AI autonomously decides when to search the internet, and I built the full streaming + citation pipeline from scratch."
- **Lines of code / scale?** → "Full-stack project — ~2,000 lines across backend services, controllers, AI pipeline, and React frontend."

---

## 📐 Project Overview

**ResearchAI** is a full-stack AI-powered answer engine — similar in spirit to Perplexity AI — that lets users ask research questions and receive structured, source-backed answers in real time.

| Layer | Tech Stack |
|---|---|
| **Frontend** | React 18 + Vite, Redux Toolkit, Vanilla CSS |
| **Backend** | Node.js + Express 5, MongoDB + Mongoose |
| **AI Layer** | LangChain agents, Gemini (Google GenAI), Groq, Tavily Search |
| **Auth** | JWT (cookie-based) + Google OAuth 2.0 via Passport.js |
| **Email** | Nodemailer + Gmail OAuth2 |
| **Security** | Helmet, CORS, express-rate-limit, bcryptjs |

---

## 🗺️ Complete Project Architecture Flow

```
User opens browser
       │
       ▼
 React Frontend (Vite + React Router)
       │  On mount: calls GET /api/auth/get-me to hydrate Redux auth state
       │
       ├─── Auth Feature (Login / Register / Google OAuth)
       │         │
       │         ▼ POST /api/auth/register OR POST /api/auth/login
       │         │
       │         └── JWT token set as HttpOnly cookie (7-day expiry)
       │
       └─── Chat Feature (useChat hook + Redux chat slice)
                 │
                 ├─── GET /api/chat/            → load sidebar chat list
                 ├─── GET /api/chat/:id/messages → load chat history
                 ├─── POST /api/chat/message     → send message (SSE stream)
                 └─── DELETE /api/chat/delete/:id → soft-delete chat

Backend (Express 5)
       │
       ├── Global Middlewares: helmet, cors, cookie-parser, morgan, JSON limit 10kb
       ├── /api/auth  → authRouter
       ├── /api/chat  → chatRouter  (all routes guarded by authUser middleware)
       └── /api/health → healthRouter

AI Pipeline (per message)
       │
       ├── 1. resolveChat()  → find existing chat OR create new + generate title via Groq
       ├── 2. createUserMessage() → persist user message to MongoDB
       ├── 3. buildContext() → last 10 messages as LangChain message history
       ├── 4. setupSSE() → open Server-Sent Events stream to client
       ├── 5. searchAgent (LangChain ReAct agent)
       │       ├── Model: Gemini 3.5 Flash Lite (fallback: Gemini 3.5 Flash)
       │       └── Tool: internetSearch (Tavily API — up to 5 results)
       ├── 6. Stream chunks → text-delta / tool-call-start / tool-call-result events
       ├── 7. buildCitations() → deduplicate Tavily URLs into citation list
       └── 8. createAiMessage() → persist final AI message + parts + citations
```

---

## 🔐 Authentication Endpoints

---

### 1. `POST /api/auth/register`

**Files:** `auth.routes.js` → `auth.controller.js → register()`

#### 60-second Explanation:
> "This is the user registration endpoint. It first applies a **rate limiter** — max 5 attempts per minute per IP — to prevent abuse. Then it runs **express-validator** to validate that `username`, `email`, and `password` are present and correctly formatted.
>
> Inside the controller, I first check if a user already exists with the same username or email using a `$or` query. If the user exists but is unverified, in dev mode I return the verification URL directly. If they're fully registered, I return a generic 'Registration failed' message — intentionally vague to avoid user enumeration attacks.
>
> For a new user, I call `userModel.create()`. The **User model** has a `pre('save')` hook that automatically **bcrypt-hashes** the password with a salt factor of 10 before storing it. Then I generate an **email verification JWT** signed with `EMAIL_SECRET` and expiring in 1 hour, and send it via `nodemailer` using **Gmail OAuth2**. The response is 201 with the user's ID, username, and email. The user is marked `verified: false` until they click the email link."

**Flow:** `registerLimiter → registerValidator → register()`  
**Response:** `201 { success, user: { id, username, email }, verificationEmailSent }`

---

### 2. `POST /api/auth/login`

**Files:** `auth.routes.js` → `auth.controller.js → login()`

#### 60-second Explanation:
> "The login endpoint accepts `email` and `password`, runs through a **10-attempts-per-minute rate limiter**, and validates inputs with express-validator.
>
> In the controller, I query MongoDB by email. If no user is found, or if `user.comparePassword()` returns false — it uses `bcrypt.compare` under the hood — I return a generic 'Invalid email or password' for both cases to prevent user enumeration. I also block login if `user.verified` is false, telling them to verify their email first.
>
> On success, I call `setAuthCookie()` — a helper that signs a **JWT** containing `id` and `username`, with a 7-day expiry, and sets it as an **HttpOnly cookie**. In production, `secure: true` and `sameSite: 'none'` are set; in development, it's `sameSite: 'lax'` so localhost works. The cookie being HttpOnly means JavaScript cannot read it — protecting against XSS attacks."

**Flow:** `loginLimiter → loginValidator → login() → setAuthCookie()`  
**Response:** `200 { success, user: { id, username, email } }`

---

### 3. `GET /api/auth/google` + `GET /api/auth/google/callback`

**Files:** `auth.routes.js` → `passport.js → findOrLinkGoogleUser()` → `auth.controller.js → googleLogin()`

#### 90-second Explanation:
> "The Google OAuth flow uses **Passport.js with the GoogleStrategy**. When the user hits `/api/auth/google`, Passport redirects them to Google's consent screen requesting `openid`, `email`, and `profile` scopes. I also use a **cookie-session** scoped to `/api/auth/google` to carry CSRF state — this session expires in 10 minutes and is HttpOnly.
>
> After Google authenticates the user, it redirects to `/api/auth/google/callback`. Passport calls my `findOrLinkGoogleUser()` function. The logic has three cases: first, it checks if a user with that `googleId` already exists — that's a returning user. Second, if a user with the same email exists, it **links the Google identity** to the existing account by setting `googleId` and marking them `verified: true`. Third, if no user exists, it creates a brand new account, generating a unique username from the email's local part.
>
> Race conditions on user creation are handled by catching the Mongo duplicate key error (code 11000) and re-querying. After resolving the user, `googleLogin()` calls `setAuthCookie()` and redirects the browser to the frontend. Failure redirects to `/login?error=google_auth_failed`."

**Flow:** `GET /google → Passport OAuth → callback → findOrLinkGoogleUser() → setAuthCookie() → redirect`

---

### 4. `GET /api/auth/get-me`

**Files:** `auth.routes.js` → `auth.middleware.js → authUser` → `auth.controller.js → getMe()`

#### 60-second Explanation:
> "This endpoint is called on every app load — in `App.jsx` inside a `useEffect` — to restore the user's session from the cookie. It is protected by the `authUser` middleware.
>
> The **authUser middleware** reads the JWT from `req.cookies.token` first; if missing, it falls back to the `Authorization: Bearer <token>` header for API clients. It verifies the token with `jwt.verify()`, then does a live DB lookup to confirm the user still exists — this prevents zombie sessions for deleted accounts. It attaches `req.user` with decoded claims and the real `_id`.
>
> The `getMe` controller calls `userModel.findById()` with `.select('-password')` to exclude the password hash, then sets `Cache-Control: no-store` to prevent browsers from caching user data. The frontend uses this to hydrate the Redux auth state on every page load."

**Flow:** `authUser (cookie → JWT verify → DB check) → getMe() → user without password`  
**Response:** `200 { success, user }` (password excluded)

---

### 5. `GET /api/auth/verify-email` + `POST /api/auth/verify-email`

**Files:** `auth.routes.js` → `auth.controller.js → getVerifyEmailPage() / verifyEmail()`

#### 60-second Explanation:
> "Email verification is a two-step flow. The link in the email hits `GET /api/auth/verify-email?token=...`. The GET handler validates the JWT signed with `EMAIL_SECRET` (different from the auth JWT to prevent token reuse) and checks the `purpose: 'email_verification'` claim. If valid and unverified, it renders a simple HTML page with a confirmation button — a form that POSTs the token back.
>
> The `POST /api/auth/verify-email` handler re-validates the same token and uses `userModel.updateOne({ email }, { $set: { verified: true } })`. I check `result.matchedCount` to distinguish 'user not found' from success. On success, it renders an HTML confirmation page with a login link. This design separates the read (GET) from the write (POST), which is proper REST convention and prevents verification by simply loading the URL."

**Two-step:** `GET → render HTML form → POST → set verified: true in DB`

---

### 6. `POST /api/auth/logout`

**Files:** `auth.routes.js` → `auth.controller.js → logout()`

#### 30-second Explanation:
> "Logout is stateless — since we use JWTs, there's no server-side session to destroy. We simply call `res.clearCookie('token')` with the matching cookie options so the browser removes it. In a production improvement, we'd maintain a token blacklist or implement short-lived access tokens with refresh token rotation for true server-side invalidation."

**Response:** `200 { success, message: "Logged out successfully" }`

---

### 7. `POST /api/auth/resend-verification`

**Files:** `auth.routes.js` → `auth.controller.js → resendVerification()`

#### 45-second Explanation:
> "If a user didn't receive their verification email, they can request a new one here. It's protected by a **3-attempts-per-minute rate limiter** to prevent email spam abuse. The controller looks up the user by email (normalized to lowercase+trimmed), checks they exist and aren't already verified, then generates a fresh 1-hour `EMAIL_SECRET` JWT and sends a new verification email via the nodemailer Gmail OAuth2 service."

**Rate Limit:** 3/min | **Response:** `200 { success, message }`

---

## 💬 Chat Endpoints

> All chat endpoints require the `authUser` middleware — no valid JWT cookie = 401 Unauthorized.

---

### 8. `POST /api/chat/message` ⭐ (Core Feature)

**Files:** `chat.routes.js` → `auth.middleware.js` → `rateLimit.middleware.js` → `chat.controller.js → sendMessage()`  
**AI:** `ai.service.js → generateResponse()` → `agent/search.agent.js`

#### 90-second Explanation:
> "This is the most complex endpoint — it powers the entire AI chat experience using **Server-Sent Events** for real-time streaming.
>
> When a message arrives, the controller creates an **AbortController** and attaches abort handlers to both `req.on('close')` and `res.on('close')` — so if the client disconnects mid-stream, the AI API call is cancelled immediately and no orphaned work continues.
>
> It calls `resolveChat()`: if a `chatId` is provided, it verifies the chat belongs to the logged-in user (preventing IDOR). If no chatId, it creates a new chat and calls `generateChatTitle()` — a fast separate call to a **Groq-hosted GPT model** that produces a 2-4 word title from the first message.
>
> Then it persists the user's message via `createUserMessage()`, fetches the last 10 messages as context via `buildContext()`, and opens the SSE stream with `setupSSE()`. A 15-second heartbeat ping keeps the connection alive through proxies and load balancers.
>
> The **LangChain ReAct agent** (Gemini 3.5 Flash Lite with fallback to Gemini 3.5 Flash) streams typed events: the agent can call the `internetSearch` tool backed by Tavily to fetch live web results. On completion, `buildCitations()` deduplicates URLs, and the final AI message is persisted to MongoDB with structured `parts` array and citation list."

**SSE Events streamed:**

| Event | Payload |
|---|---|
| `start` | `{ chatId, title? }` |
| `text-delta` | `{ delta: "..." }` |
| `tool-call-start` | `{ toolName, toolCallId }` |
| `tool-call-delta` | `{ toolCallId, args }` |
| `tool-call-result` | `{ toolCallId, result }` |
| `done` | `{ aiMessage, citations, hasCitations }` |
| `error` | `{ code, message }` |

**Rate Limit:** 10 messages/min per userId (falls back to IP if unauthenticated)

---

### 9. `GET /api/chat/`

**Files:** `chat.routes.js` → `auth.middleware.js` → `chat.controller.js → getChats()`

#### 60-second Explanation:
> "This endpoint returns the sidebar list of all chats for the authenticated user. It queries `chatModel.find({ user: userId, deletedAt: null })` — the `deletedAt: null` filter implements **soft delete**, so deleted chats are excluded without physically removing them from MongoDB.
>
> Results are sorted by `lastMessageAt` descending (most recent first). The `user` and `__v` fields are excluded via projection. It supports **optional pagination** via `?page=` and `?limit=` query params (capped at 100 per page). If no pagination is specified, up to 50 chats are returned. The frontend `useChat` hook calls this on load and stores the result in a Redux `chats` dictionary keyed by `chatId` for O(1) lookup."

**Response:** `200 { success, chats: [...], pagination? }`

---

### 10. `GET /api/chat/:chatId/messages`

**Files:** `chat.routes.js` → `auth.middleware.js` → `chat.validator.js` → `chat.controller.js → getMessages()`

#### 60-second Explanation:
> "This endpoint loads the message history for a specific chat. The `chatId` path param is validated as a valid MongoDB ObjectId by `chatIdParamValidator`. Then the controller verifies ownership by querying `chatModel.findOne({ _id: chatId, user: userId, deletedAt: null })` — this prevents IDOR attacks where any authenticated user could read another user's chat.
>
> Messages are fetched sorted by `createdAt` ascending (oldest first) with optional pagination. I use `.lean()` for query performance, but since `lean()` strips Mongoose virtual fields, the `hasCitations` virtual (computed from `citations.length`) would be lost. So I manually compute it in a `.map()` after the query — there's an inline comment explaining this is a Mongoose 9.9.1 known behavior. The frontend caches these messages per chat in Redux to avoid duplicate network calls."

**Response:** `200 { success, messages: [...], pagination? }`

---

### 11. `DELETE /api/chat/delete/:chatId`

**Files:** `chat.routes.js` → `auth.middleware.js` → `chat.controller.js → deleteChat()`

#### 60-second Explanation:
> "This endpoint implements **soft delete using a MongoDB session transaction**. Rather than using a DELETE query, it sets `deletedAt` to the current timestamp on both the chat document and all its associated messages.
>
> I use `mongoose.startSession()` with `session.withTransaction()` to ensure atomicity — either both the chat and its messages are marked deleted, or neither is. On the data side, MongoDB has a **TTL index** on `deletedAt` with `expireAfterSeconds: 2592000` (30 days) and a `partialFilterExpression: { deletedAt: { $type: 'date' } }` — so active chats where `deletedAt: null` are completely invisible to the TTL monitor. Deleted data auto-purges after 30 days without any cron job."

**Response:** `200 { success, message: "Chat deleted successfully." }`

---

### 12. `GET /api/health`

**Files:** `health.routes.js`

#### 30-second Explanation:
> "A lightweight health check for deployment monitoring and load balancers. It reads `mongoose.connection.readyState` — values 0-3 map to disconnected, connected, connecting, disconnecting. If the DB is in state 1 (connected), it returns 200 with `{ status: 'ok', database: 'connected', environment, version }`. Otherwise it returns 503 `{ status: 'degraded' }`. Uptime monitors and Kubernetes liveness probes hit this to decide if the instance should receive traffic."

**Response:** `200 { status: "ok" }` or `503 { status: "degraded" }`

---

## 🤖 AI Pipeline Deep Dive

### LangChain Agent + Fallback Chain

```
generateResponse(messages, onChunk, signal)
       │
       ├── Try: gemini-3.5-flash-lite  ──► runAgent()
       │                                       │
       │                                       ├── searchAgent(modelId) [in-memory cache]
       │                                       │       ├── model: ChatGoogleGenerativeAI
       │                                       │       └── tools: [internetSearchTool (Tavily)]
       │                                       │
       │                                       └── agent.stream({ messages }, streamMode: "messages")
       │                                           → handleAIChunk() / handleToolChunk()
       │
       └── If model fails & no chunks emitted yet → Try: gemini-3.5-flash
           (If chunks already emitted → throw immediately, can't restart mid-stream)
```

### SSE → Redux State Mapping

| Backend SSE Event | `useChat.js` Frontend Action |
|---|---|
| `start` | Creates chat in Redux (`createNewChat`), dispatches user message, sets `streamingChatId` |
| `text-delta` | Appends to `streamingPartsRef`, batches updates via `requestAnimationFrame` |
| `tool-call-start` | Pushes `{ type: 'dynamic-tool', state: 'streaming' }` part |
| `tool-call-delta` | Accumulates `args` string on the streaming tool part |
| `tool-call-result` | Sets `state: 'done'` and `output` on the tool part |
| `done` | Commits full AI message to Redux, clears streaming state, saves parts + citations |
| `error` | Throws, sets `retryPayload` if stream never started (safe to re-send) |

### Citation Building

```
buildCitations(parts)
  ├── Filter: type === "dynamic-tool" && toolName === "internetSearch" && state === "done"
  ├── Parse JSON output from Tavily API
  ├── Validate each source with Zod schema: { title, url, content }
  ├── Deduplicate by URL using Set<string>
  └── Return: [{ index: 1, title, url }, ...]
```

---

## 🗃️ Data Models Summary

### User Model
```js
{ username, email, password (bcrypt), googleId (sparse), verified: Boolean }
```
- `pre('save')` hook hashes password automatically
- `comparePassword()` method for login
- Indexes: `verified`, `googleId (sparse unique)`

### Chat Model
```js
{ user: ObjectId, title, lastMessageAt, deletedAt }
```
- Compound index: `{ user, lastMessageAt: -1 }` for fast sidebar queries
- TTL index on `deletedAt` (30 days auto-purge, partial filter)

### Message Model
```js
{
  chat: ObjectId, content, role: "user"|"ai",
  citations: [{ index, title, url }],
  parts: [{ type: "text"|"dynamic-tool", text?, toolName?, state?, args?, output? }],
  deletedAt
}
```
- Virtual `hasCitations`: `citations.length > 0` (manually computed in lean queries)
- Index: `{ chat, createdAt }` for sorted loading
- TTL index on `deletedAt` (30 days, partial filter)

---

## 🔒 Security Highlights

| Concern | Implementation |
|---|---|
| **Password storage** | bcrypt salt factor 10, 72-byte max enforced at schema level |
| **XSS / Cookie theft** | HttpOnly JWT cookie — JavaScript cannot access it |
| **CSRF (OAuth)** | cookie-session on `/api/auth/google` path with JWT-signed state |
| **IDOR** | Every chat/message query includes `user: userId` ownership filter |
| **Brute force** | Rate limiters: register 5/min, login 10/min, chat 10/min/user |
| **Request bombs** | 10kb JSON body limit, Helmet security headers |
| **Prompt injection** | System prompt labels tool output as "untrusted reference material" |
| **Data retention** | Soft delete + 30-day TTL auto-purge via partial index |

---

## 🖼️ Frontend Architecture Summary

```
frontend/src/
├── APP/
│   ├── App.jsx           ← calls getMe() on mount to restore session
│   ├── routes/           ← React Router protected/public routes
│   └── store/            ← Redux store (auth + chat slices)
├── features/
│   ├── auth/
│   │   ├── hooks/useAuth.js     ← login, register, logout, getMe handlers
│   │   └── services/auth.api.js ← axios calls to /api/auth/*
│   └── chat/
│       ├── hooks/useChat.js     ← SSE stream consumer, all chat CRUD
│       ├── state/chat.slices.js ← Redux slice: chats dict, streaming state
│       └── services/chat.api.js ← fetch/axios calls to /api/chat/*
└── components/ErrorBoundary.jsx
```

**Redux Chat State Shape:**
```js
{
  chats: {
    "<chatId>": { id, title, messages: [...], messagesLoaded: bool, lastUpdated }
  },
  currentChatId: string | null,
  isLoadingChats: bool,
  loadingChatId:  string | null,
  deletingChatId: string | null,
  error: { message, code } | null
}
```

---

## 🚀 Key Engineering Decisions (Interview Talking Points)

1. **SSE over WebSockets** — Unidirectional streaming is sufficient for AI responses. SSE is simpler, works over HTTP/1.1, auto-reconnects via the browser's native EventSource, and avoids WebSocket handshake overhead and server-side socket management.

2. **AbortController for client disconnect** — Attaching abort to both `req.close` and `res.close` ensures the Gemini API call is cancelled when the user navigates away, preventing wasted compute and API quota.

3. **Fallback model chain** — If the primary model (Gemini Flash Lite) fails before emitting any chunks, the system silently retries with the larger Gemini Flash model. Once chunks start streaming, a failure throws directly — can't restart mid-stream without duplicating content.

4. **requestAnimationFrame batching** — In `useChat.js`, streaming text deltas are accumulated in a `ref` and rendered via `rAF` — this batches up to 60fps updates instead of triggering a React re-render per token, keeping the UI smooth under fast streams.

5. **Soft delete + partial TTL index** — `deletedAt: null` for active records, `deletedAt: Date` for deleted ones. The `partialFilterExpression: { deletedAt: { $type: 'date' } }` means the TTL index never includes active documents, avoiding index bloat. 30-day auto-purge without any cron job.

6. **Two separate JWTs** — `JWT_SECRET` for auth sessions (7d, HttpOnly cookie), `EMAIL_SECRET` for email verification links (1h, URL param). Separate secrets prevent a verification token from being used as an auth token.

7. **IDOR protection** — Every chat/message query includes `user: userId` in the MongoDB filter. An attacker who guesses or reuses a `chatId` receives a 404 — not the actual data.

8. **Agent + model caching** — `searchAgent()` and `getModel()` use in-memory Maps keyed by `modelId`. This avoids re-initializing LangChain agents and LLM client instances on every request.

---

## 🗂️ Conversation History — Deep Dive & Interview Q&A

> This is one of the most commonly probed areas in AI project interviews. Know every layer — how history is **built**, **sent to the AI**, **persisted**, and **reloaded**.

---

### How Conversation History Works — End to End

```
User sends a new message
         │
         ▼
1. sendMessage() in chat.controller.js
         │
         ├── resolveChat()  →  find or create the Chat document
         ├── createUserMessage()  →  persist user's message to MongoDB
         │
         ▼
2. buildContext()  ← ai.service.js
         │
         │   messageModel.find({ chat: chatId, deletedAt: null })
         │     .select("role content parts")
         │     .sort({ createdAt: 1 })       ← oldest first
         │     .lean()
         │
         │   → slice last 10 messages
         │   → trim leading AI messages (start from first "user" turn)
         │
         ▼
3. toLangchainMessages(contextMessages)
         │
         ├── [SystemMessage]  ← static system prompt (ResearchAI identity + rules)
         ├── [HumanMessage]   ← each role === "user"
         └── [AIMessage]      ← each role === "ai"
         │
         ▼
4. agent.stream({ messages })  →  Gemini sees the full conversation window
         │
         ▼
5. AI response streamed + persisted as new Message document
         │
         └── next message cycle: this response is now part of context
```

---

### `buildContext()` — The Context Window Logic

```js
// ai.service.js
const MAX_MESSAGES = 10;

export const buildContext = (messages) => {
  const recentMessages = messages.slice(-MAX_MESSAGES);      // last 10
  const firstUserMessage = recentMessages.findIndex(         // trim orphan AI turns
    (message) => message.role === "user"
  );
  return firstUserMessage === -1
    ? recentMessages
    : recentMessages.slice(firstUserMessage);                // start from first user turn
};
```

**Why slice from the first user message?**
After slicing the last 10 messages, it's possible the window starts with an AI message (if there were many exchanges). Sending an AI message as the first item to Gemini is invalid — the conversation must start with a user turn. `findIndex` trims any orphan leading AI messages.

---

### How History is Persisted

Every message — user and AI — is written to MongoDB via `persistMessage()` in `message.service.js`:

```js
const persistMessage = async (payload) => {
  const parsed = createMessageSchema.parse(payload);  // Zod validation
  const message = await messageModel.create(parsed);

  // Keep Chat.lastMessageAt in sync for sidebar ordering
  await chatModel.updateOne(
    { _id: payload.chat },
    { $set: { lastMessageAt: new Date() } }
  );
  return message;
};
```

Each **Message document** stores:
| Field | Purpose |
|---|---|
| `content` | Full plain-text response (for context window — fast to query) |
| `role` | `"user"` or `"ai"` |
| `parts` | Structured array: text blocks + tool call records (for UI replay) |
| `citations` | Deduplicated web sources `[{ index, title, url }]` |
| `chat` | Foreign key → parent Chat document |
| `deletedAt` | Soft delete timestamp (null = active) |

---

### How History is Reloaded on Page Refresh

```
User reopens a past chat (clicks sidebar)
         │
         ▼
handleOpenChat(chatId)  ← useChat.js
         │
         ├── Check: chats[chatId].messagesLoaded?
         │     YES → skip network call (Redux cache hit)
         │     NO  → call GET /api/chat/:chatId/messages
         │
         ▼
getMessages()  ← chat.controller.js
         │
         ├── Ownership check: findOne({ _id: chatId, user: userId, deletedAt: null })
         ├── messageModel.find({ chat: chatId, deletedAt: null })
         │     .sort({ createdAt: 1 })
         │     .lean()
         │
         ├── Manually compute hasCitations:
         │     messages.map(msg => ({ ...msg, hasCitations: Boolean(msg.citations?.length) }))
         │     (lean() strips Mongoose virtuals — computed inline instead)
         │
         └── dispatch(addMessages({ chatId, messages }))  →  Redux cache
```

**Key detail:** `messagesLoaded: true` is set once messages are fetched. If the user switches between chats rapidly, subsequent visits to the same chat are served instantly from Redux — no extra network round-trips.

---

### 🔁 Conversation History — Interviewer Q&A

---

**Q: How does the AI know what was said earlier in the conversation?**

> "Every time the user sends a new message, I fetch all messages for that chat from MongoDB — sorted oldest-first — using `messageModel.find({ chat: chatId, deletedAt: null })`. Then `buildContext()` slices the last 10 messages and converts them into LangChain `HumanMessage` and `AIMessage` objects, prepended by a `SystemMessage`. This full array is passed to the Gemini agent, which sees the conversation as continuous context."

---

**Q: What is the context window limit and why did you choose 10 messages?**

> "I chose 10 messages — 5 user turns + 5 AI replies — as a practical balance between context relevance and token cost. Gemini Flash has a large context window, but sending 50+ messages on every request wastes tokens and increases latency. The last 10 messages cover the immediate topic of the conversation. In a production system I'd move to a sliding window with token counting or use a vector store for semantic retrieval of relevant past messages."

---

**Q: What happens if the context window starts with an AI message?**

> "That's exactly what `buildContext()` guards against. After slicing the last 10 messages, if the window starts with an AI message — which happens when there are many turns and the first user message got sliced out — passing that to Gemini would cause an API error. So I use `findIndex` to find the first user message in the window and trim everything before it. The conversation must always start with a user turn."

---

**Q: Do you store conversation history in the database or just in memory?**

> "Both, actually — for different purposes. During a live streaming session, the conversation parts accumulate in a `streamingPartsRef` on the frontend (in-memory React ref) for real-time display. Once the stream completes, the final AI message is persisted to MongoDB with the full `content` string, the structured `parts` array (text blocks + tool call records), and the deduplicated `citations`. On the next request, messages are loaded from MongoDB — so history survives page refreshes, server restarts, and multiple devices."

---

**Q: Why do you store `parts` separately from `content`?**

> "The `content` field is a flat string — the complete text of the AI's response. It's used as the context window input for the next message because that's all the AI needs: plain text. But `parts` is a structured array of `{ type: 'text', text }` and `{ type: 'dynamic-tool', toolName, args, output, state }` objects. This is used by the frontend to replay *exactly what happened* — which web searches the agent ran, what arguments it used, what it returned — rendered as a visual 'Searched the web for X' card. Without `parts`, reopening an old chat would just show the final answer with no trace of the tool calls."

---

**Q: How do you prevent one user from reading another user's chat history?**

> "Every single query against the Chat and Message collections includes `user: userId` as a filter condition — the `userId` comes from the verified JWT token in the middleware. So `chatModel.findOne({ _id: chatId, user: userId })` — even if an attacker guesses or reuses another user's `chatId`, the query returns null and they get a 404. This closes the classic IDOR vulnerability. Messages are also protected indirectly — I only fetch messages after confirming the parent chat belongs to the user."

---

**Q: What if a user sends thousands of messages? Doesn't that hurt performance?**

> "A few things prevent this. First, `buildContext()` only ever sends the last 10 messages to the AI — the query still fetches all messages with `.sort({ createdAt: 1 }).lean()`, but `lean()` makes it very fast since it bypasses Mongoose document instantiation. Second, there's a `getMessages()` pagination system — `?page=&limit=` — so the frontend can load messages in pages rather than all at once. Third, the Message schema enforces a `maxlength: 100000` on `content` to prevent unbounded document growth. And fourth, soft-deleted messages (from deleted chats) are auto-purged by MongoDB's TTL monitor after 30 days."

---

**Q: Can a user continue a conversation from where they left off?**

> "Yes, that's a core feature. Every Chat has a persistent `_id`. When the user clicks a past chat in the sidebar, `handleOpenChat(chatId)` checks if `messagesLoaded` is already true in Redux — if so, it serves from cache instantly. If not, it calls `GET /api/chat/:chatId/messages`, loads the full message history, and stores it in Redux. The next new message the user sends includes that `chatId` in the request body — `resolveChat()` finds the existing chat by ID (verifying ownership), and the full stored history feeds into `buildContext()` for the AI context window."

---

**Q: What's the difference between `chat.slices.js` and the database for history?**

> "Redux is the **client-side cache** — fast, in-memory, gone on page refresh. The database is the **source of truth** — persistent, survives everything. The architecture is: on first load of a chat, messages come from MongoDB and are stored in Redux under `chats[chatId].messages`. For the current active stream, incoming SSE events update `streamingPartsRef` (a React ref, not even Redux — avoids unnecessary renders) and only at `done` do they commit to Redux and the DB simultaneously. So Redux is always a reflection of what's in the DB, populated lazily on demand."

---

**Q: How does the `hasCitations` field work across a reload?**

> "This is a subtle Mongoose gotcha worth mentioning. `hasCitations` is defined as a virtual field on the Message schema — `this.citations.length > 0` — and it works perfectly when you do `message.toJSON()`. But when I use `.lean()` for performance (which skips Mongoose document instantiation), schema virtuals are stripped. The `lean({ virtuals: true })` option exists but requires the `mongoose-lean-virtuals` plugin, which I didn't add. So instead, after the lean query I do a `.map()` that manually computes `hasCitations: Boolean(msg.citations?.length)`. This is explicitly documented in the code with a comment explaining the Mongoose 9.9.1 behavior."

---

### 📌 Conversation History — One-Liner Cheatsheet

| Topic | One-liner |
|---|---|
| **Context window** | Last 10 messages, trimmed to start on first user turn, converted to LangChain messages |
| **Persistence** | Every message saved to MongoDB with `content` (flat text) + `parts` (structured) + `citations` |
| **Reload** | `GET /api/chat/:chatId/messages` → Redux cache → `messagesLoaded: true` prevents re-fetch |
| **IDOR** | All queries include `user: userId` — wrong user gets 404, not data |
| **Performance** | `.lean()` for fast queries, pagination for large histories, 10-message AI window |
| **hasCitations** | Virtual stripped by lean() — manually computed in `.map()` after query |
| **Parts vs Content** | `content` = plain text for AI context; `parts` = structured tool call replay for UI |
| **Streaming state** | `streamingPartsRef` (React ref) accumulates during stream → committed to Redux + DB on `done` |

---

*Generated for interview preparation — ResearchAI by Sham Jadhav*
