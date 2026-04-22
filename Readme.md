# Research-AI 🚀

Welcome to **Research-AI**! This is a full-stack, real-time chat application built using the powerful **MERN** stack (MongoDB, Express.js, React, Node.js) combined with modern tooling like Vite, TailwindCSS v4, and Socket.io for a seamless real-time experience. 

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Complete Project Workflow](#-complete-project-workflow)
- [AI Integration & Services](#-ai-integration--services)
- [Frontend-Backend Integration](#-frontend-backend-integration)
- [UI Component Architecture](#-ui-component-architecture)
- [API Endpoints](#-api-endpoints)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
---

## 🌟 Project Overview
Research-AI is designed to provide secure authentication alongside an interactive real-time chat interface. Users can seamlessly establish chat sessions, send/receive messages instantly using markdown, view their active chats, and securely manage their sessions.

---

## 🛠 Tech Stack
**Frontend (Client)**
- React 19 (via **Vite**)
- **Redux Toolkit** (State Management & Data Fetching)
- **Tailwind CSS v4** (Modern Styling Setup)
- **React Router v7** (Routing & Application Flow)
- **Socket.io-Client** (Real-time seamless connection)
- **React Markdown** (Rich text formatting in chat responses)

**Backend (Server)**
- **Node.js** & **Express.js** (Core API Architecture)
- **MongoDB** with Mongoose (NoSQL Database)
- **Socket.io** (WebSockets for bi-directional live messaging)
- **JWT (JSON Web Tokens)** (Authentication via persistent HTTP-only Cookies)

---

## 🔄 Complete Project Workflow

### 1. **Authentication Flow**
- **Registration**: Users easily create an account using `email`, `username`, and `password`. The system robustly validates these details, hashes the password, and provisions the user inside the database. It also offers email verification endpoints.
- **Login**: Upon registration verification, credentials can be formulated to securely login. The server validates credentials and issues a secure, HttpOnly JWT cookie ensuring safe future requests.
- **Session Persistence (`get-me`)**: Whenever the frontend finishes loading, it automatically fires the `get-me` endpoint. This validates the background cookie and restores the user session rapidly without the hassle of relogging.

### 2. **Real-Time Chat Workflow**
- **Connection**: Upon successive login/verification, a persistent, live Socket.io connection pipeline sits open between the individual client context and the centralized server socket.
- **Fetching Chats**: The React frontend initially connects to the centralized API (`/api/chat/`) to resolve previous user conversations and populates the sidebar respectively.
- **Messaging in Real-Time**: 
  - First, a user structurally writes a test or markdown-heavy message.
  - A structured API request (`POST /api/chat/message`) stores the message payload indefinitely within MongoDB.
  - Concurrently acting as a middleman, Socket.io actively broadcasts the live message data strictly to the applicable chat session allowing for visual representation across different logged-in connections matching the conversation.
- **Chat Management**: Users may load historical messages of particular threads via `/:chatId/messages` and are even provided capabilities to remove outdated discussions through the `delete` workflow.

---

## 🤖 AI Integration & Services

The backend architecture uses a modular approach to handle AI capabilities, splitting concerns across models, tools, agents, and services.

### 1. Model Initialization (`backend/src/ai/model.js`)
This module initializes our core AI and search instances using environment variables:
- **Gemini (`gemini-2.5-flash-lite`)**: Instantiated via `@langchain/google-genai`, acting as the primary conversational brain for complex reasoning and agentic tasks.
- **Mistral (`mistral-small-latest`)**: Instantiated via `@langchain/mistralai`, utilized efficiently for generating short, descriptive chat titles.
- **Tavily**: Instantiated via `@tavily/core`, providing the real-time internet search capability.

### 2. Search Tooling (`backend/src/ai/internetSearch.ai.js`)
- **`internetSearch`**: Relies on the Tavily API to execute real-time web queries, retrieving up to 5 maximum results.
- It formats the returned data into a readable string structure containing the Source, Title, URL, and a 500-character Summary for the AI to parse easily and cite properly.

### 3. Langchain Agents (`backend/src/agents/search.agent.js`)
- **`searchInternetTool`**: Wraps the `internetSearch` function into a formal Langchain `tool` with an explicit Zod schema (requiring a `query` string).
- **`searchAgent`**: A dynamic agent created using `createAgent`, binding the `geminiModel` with the `searchInternetTool`. This allows Gemini to autonomously decide when to query the internet for up-to-date information.

### 4. Core AI Service (`backend/src/services/ai.service.js`)
This service acts as the bridge orchestrating AI interactions:
- **`generateResponse`**: Invokes `searchAgent.stream` with a highly detailed `System_Prompt` that enforces source-backed, structured responses with inline citations (e.g., `[1]`). It streams the AIMessage chunks directly back to the client.
- **`generateChatTitle`**: Passes the user's first message to `mistralModel` to generate a concise 2-4 word title.
- **Context Management**: `buildContext` truncates chat history to the last 10 messages to maintain efficiency and stay within token limits.
- **Citation Parsing**: `parseCitations` and `formatResponse` extract URL footprints from the AI's response text and map them into structured `citations` objects for the frontend UI.

### 5. Controller Integration (`chat.controller.js`)
When a `POST` request to `/message` is fired, the AI interaction pipeline kicks in:
- The controller checks if a `chatId` was provided. If missing (meaning it's a new conversation), it triggers `generateChatTitle` and persists a new `chatModel` entry.
- **Persistent Conversational Memory**: The `chat.controller.js` executes a database lookup inside `messageModel` fetching *all* chronological chat history tied to the active `chatId`. 
- This entire array of historical context is forwarded directly into `generateResponse(messages)` resolving context seamlessly.

### 6. Database Memory Structure (`chat.model` & `message.model`)
For the real-time agent to maintain long-term contextual awareness (memory over a session), the conversations are persisted relationally perfectly paired for AI consumption:
- **`chat.model.js`**: Contains the root conversation instance referencing the `User` alongside the AI generated `title`.
- **`message.model.js`**: Chronologically maps individual pieces of text closely to their parent `chat`. Crucially, it enforces a strict `role` enum (`"user"` or `"ai"`).
- Inside `ai.service.js`, the historical array from `messageModel` iterates smoothly, converting database rows exactly into Langchain's conceptual formats (`HumanMessage` & `AIMessage`). This ensures that on the 10th message of a chat sequence, the AI agent intrinsically remembers what it generated on message #1!

---

## 🔗 Frontend-Backend Integration Workflow
To guarantee a reactive and secure user interface, the React frontend handles server communication via meticulously structured API services, hooks, and global state reducers. Here is exactly how the `/frontend` communicates tightly with the `/backend`:

### 1. HTTP Client & Security Strategy (Axios)
- Both `auth.api.js` and `chat.api.js` instantiate custom **Axios** instances properly configured with a `baseURL` pointing exactly to the Node.js server target (`http://localhost:4000`).
- Critically, every axios request establishes `withCredentials: true`. This bridges the cross-origin pipeline, allowing the frontend to silently, automatically transit the secure `HttpOnly` JWT Authentication Session Cookie verified globally by the backend routers (`authUser` middleware).

### 2. Custom Hooks Orchestration (`useChat.js`)
Instead of tangling direct API calls and state management inside generic React DOM UI components, **Research-AI** delegates logic tightly within optimized custom hooks:
- **`handleSendMessage`**: Takes user text input alongside an active `chatId` and dispatches it straight to `chat.api.js`. Once the backend securely executes saving the text and producing the Langchain AI response, the hook synchronously fires several Redux dispatches (`addNewMessage`, `createNewChat`) appending both user/AI messages inherently scaling the DOM without needing a refresh point.
- **`handleGetChats` & `handleOpenChat`**: Execute cleanly against the db grabs. It optimally formats the historical databases into rapid lookup memory mapping techniques. It proactively prevents unnecessary data-fetches if a conversation thread arrays are previously cached!

### 3. Redux Global State Centralization (`store` & `slices`)
- Any resolved API network response triggers dispatched structures to local UI states segregated carefully within `auth` and `chat` slicing architectures. Loaded `chats` map dynamically onto Redux memory, guaranteeing functions like the Sidebar UI and Active Chat window maintain zero-latency switches while traversing ongoing conversation contexts.

### 4. Real-Time Persistent Socket (`chat.socket.js`)
- Leverages `socket.io-client` module natively via `intializeSocketConnect`. Activating immediately against the backend, it shares equivalent `withCredentials: true` rules dictating that websockets are exclusively tied directly alongside verified HTTP identity tokens making data manipulation highly secure.

---

## 🎨 UI Component Architecture & Formatting
The `frontend/src/features/chat` module constructs an advanced, highly-reactive interface combining complex React hooks with dynamic Markdown rendering. Key architectural elements include:

### 1. `DashBoard.jsx` (The Core Layout)
- Operates as the central command component syncing `useChat` custom hooks dynamically with the Redux `useSelector` store layout.
- Provides native loading animations ("Thinking dots" using mapped bounce delays) resolving synchronously while the AI model computes in the background.
- Captures real-time strings into native `isStreaming` mapping beautifully to a blinking tail cursor via keyframe animations.
- Automatically handles UX scroll positions natively using `scrollIntoView()` bounded into an array tracking `useEffect`.
- Processes deep footer map representations natively isolating AI "Sources" into interactive `href` citation bars exactly like modern LLM clients!

### 2. `MarkdownComponents.jsx` (Sophisticated Parsing)
AI responses contain complex formatting structurally powered by `react-markdown` applying `remarkGfm` plugins to enable syntax logic. 
- **Dynamic `<CodeBlock>`**: Intercepts generic `code` outputs embedding custom syntax headers, overflow configurations, and crucially, an interactive `onCopy` state pushing code strings securely into `navigator.clipboard`.
- **Inline Web Citations**: An incredibly deep Regex parsing mechanism resolving the AI's internal response footnotes (e.g. `[1]`). Operations structurally bind index markers alongside payload URLs to generate dynamically clickable inline footnotes exactly matching the Tavily Search integration!

### 3. `ChatInput.jsx` (Reactive Form Controls)
- Contains an interactive `textarea` mathematically auto-resizing up to a `120px` height cap calculating strictly via `ta.scrollHeight`.
- Listens actively intercepting physical keyboard `Enter` actions directly binding to `handleSubmit` preventing API racing conditions by disabling inputs dynamically relying on Redux's `isLoading` prop state.

---

## 🔌 API Endpoints
Endpoints are completely categorized, safeguarded, logging-enabled (via Morgan), and highly cohesive. A complete list revolves around:

### **Auth Endpoints** (`/api/auth`)
| Method | Endpoint | Description | Access | Payload/Parameters |
| ------ | -------- | ----------- | ------ | ------------------ |
| `POST` | `/register` | Validates inputs using Joi/Zod, hashes the password, creates a new user in MongoDB, and triggers a verification email. | Public | Body: `{ username, email, password }` |
| `POST` | `/login` | Authenticates user identity, compares password hash, and resolves with an `HttpOnly` JWT Cookie for secure session management. | Public | Body: `{ email, password }` |
| `GET`  | `/get-me` | Returns the currently logged-in user's profile details based on the valid JWT cookie. | Private | Headers: Cookie |
| `GET`  | `/verify-email` | Validates an email token and marks the user's account as verified in the database. | Public | Query: `?token=...` |

### **Chat Endpoints** (`/api/chat`)
| Method | Endpoint | Description | Access | Payload/Parameters |
| ------ | -------- | ----------- | ------ | ------------------ |
| `GET`  | `/` | Retrieves a list of all chat sessions associated with the authenticated user, sorted by recency. | Private | Headers: Cookie |
| `POST` | `/message` | Core AI interaction endpoint. Processes user messages, streams AI responses via Socket.io, saves message history, and auto-generates chat titles for new chats. | Private | Body: `{ text, chatId? }` |
| `GET`  | `/:chatId/messages` | Fetches the complete chronological message history for a specific chat session. | Private | Params: `chatId` |
| `DELETE`| `/delete/:chatId` | Completely removes a chat session and all its associated messages from the database. | Private | Params: `chatId` |

*(Note: Every `Private` scoped endpoint is strictly walled behind an `authUser` wrapper expecting validated JSON Web Tokens configured tightly in cookies!)*

---

## 🗂 Project Architecture & Directory Structure

```text
Research-AI/
│
├── backend/                      # Server-side environment & application logic
│   ├── src/
│   │   ├── agents/               # Langchain Agents and Execution Logic
│   │   │   └── search.agent.js   # Agent utilizing internet search tools
│   │   ├── ai/                   # AI model instances and tools
│   │   │   ├── internetSearch.ai.js # Tavily Search API implementation
│   │   │   └── model.js          # AI Models Initialization (Gemini, Mistral)
│   │   ├── config/               # Database and server configurations
│   │   │   ├── config.js         # Configuration setup
│   │   │   └── db.js             # Mongoose connection setup (MongoDB)
│   │   ├── controllers/          # Business logic handlers for specific routes
│   │   │   ├── auth.controller.js # Logic for user registration, login, and logout
│   │   │   └── chat.controller.js # Logic for handling chats and AI responses
│   │   ├── middlewares/          # Security and request interceptors
│   │   │   └── auth.middleware.js # Middleware to verify JWT tokens in cookies
│   │   ├── models/               # MongoDB schema definitions using Mongoose
│   │   │   ├── chat.model.js     # Schema for conversation metadata
│   │   │   ├── message.model.js  # Schema for individual chat messages
│   │   │   └── user.model.js     # Schema for user profiles and credentials
│   │   ├── routes/               # API endpoint definitions mapping to controllers
│   │   │   ├── auth.routes.js    # Routes for auth-related actions
│   │   │   └── chat.routes.js    # Routes for chat and message management
│   │   ├── services/             # Specialized logic and external integrations
│   │   │   ├── ai.service.js     # Core AI logic (Gemini & Mistral integration)
│   │   │   └── mail.service.js   # Email dispatch logic for verification
│   │   ├── socket/               # Real-time communication processors
│   │   │   └── server.socket.js  # Backend Socket.io event listeners
│   │   ├── validators/           # Request body validation and sanitization
│   │   │   └── auth.validator.js # Joi/Zod validators for auth inputs
│   │   └── app.js                # Main Express application configuration
│   ├── package.json              # Backend dependencies and execution scripts
│   ├── server.js                 # Entry point for the server and socket mounting
│   └── .env                      # Environment secrets (MongoDB, API Keys, JWT)
│
└── frontend/                     # Client-Side Application (React + Vite)
    ├── public/                   # Static assets accessible globally
    │   └── vite.svg              # Vite branding asset
    ├── src/
    │   ├── APP/                  # Global application-level logic & styling
    │   │   ├── routes/
    │   │   │   └── AppRoutes.jsx # Navigation routing (Public vs Protected)
    │   │   ├── store/
    │   │   │   └── App.store.js  # Centralized Redux store setup
    │   │   ├── App.jsx           # Root UI Layout component
    │   │   └── index.css         # Global CSS & Tailwind directives
    │   ├── features/             # Scalable feature-based directory pattern
    │   │   ├── auth/             # Authentication & User Management
    │   │   │   ├── components/
    │   │   │   │   └── Protected.jsx # Authorization wrapper for routes
    │   │   │   ├── hooks/
    │   │   │   │   └── useAuth.js   # Hook for calling registration/login
    │   │   │   ├── pages/
    │   │   │   │   ├── Login.jsx    # User Login page interface
    │   │   │   │   └── Register.jsx # Account creation page interface
    │   │   │   ├── services/
    │   │   │   │   └── auth.api.js  # Axios endpoints for Auth API
    │   │   │   └── slice/
    │   │   │       └── auth.slice.js # Global Auth state (User, Status)
    │   │   └── chat/             # Interactive Assistant & Real-time Chat
    │   │       ├── components/
    │   │       │   ├── ChatInput.jsx # Interactive message composition field
    │   │       │   ├── MarkdownComponents.jsx # Rich rendering for AI responses
    │   │       │   ├── Navbar.jsx    # Application top navigation menu
    │   │       │   ├── Reuse.jsx     # Collection of reusable UI elements
    │   │       │   └── Sidebar.jsx   # List of active conversations/history
    │   │       ├── hooks/
    │   │       │   └── useChat.js    # logic for AI response & Socket flow
    │   │       ├── pages/
    │   │       │   ├── DashBoard.jsx # The main primary chat dashboard
    │   │       │   ├── Landing.jsx   # Project Overview & Welcome page
    │   │       │   └── Profile.jsx   # User identity & security settings
    │   │       ├── services/
    │   │       │   ├── chat.api.js   # Axios endpoints for Chat/History API
    │   │       │   └── chat.socket.js # Client-side Socket.io initialization
    │   │       ├── shared/
    │   │       │   ├── global.js     # Shared UI constants & helper functions
    │   │       │   └── LogoIcon.jsx  # Scalable logo component
    │   │       ├── slices/
    │   │       │   └── chat.slices.js # Global Chat state (Messages, Threads)
    │   │       └── styles/
    │   │           ├── landing.css   # Styles specifically for Landing page
    │   │           └── navbar.css    # Styles specifically for Navbar
    │   └── main.jsx                  # Main React mount point and entry script
    ├── eslint.config.js          # ESLint rules for code quality
    ├── index.html                # Root HTML template for the SPA
    ├── package.json              # Frontend dependencies (React, Redux, etc.)
    └── vite.config.js            # Vite bundler configuration and proxying
```

---
