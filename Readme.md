# Research-AI 🚀

Welcome to **Research-AI**! This is a full-stack, real-time chat application built using the powerful **MERN** stack (MongoDB, Express.js, React, Node.js) combined with modern tooling like Vite, TailwindCSS v4, and Socket.io for a seamless real-time experience. 

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Complete Project Workflow](#-complete-project-workflow)
- [AI Integration & Services](#-ai-integration--services)
- [Frontend-Backend Integration](#-frontend-backend-integration)
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

The `backend/src/services` directory contains the core business logic handling the AI capabilities, acting as the bridge between user input, internet search, and our database memory structure.

### 1. `ai.service.js` (The Brain)
This service initializes two separate AI models using Langchain:
- **Mistral (`mistral-small-latest`)**: Efficiently generates short, descriptive chat titles (`generateChatTitle`) by analyzing the very first message sent by a user.
- **Gemini (`gemini-2.5-flash-lite`)**: Acts as the primary conversational agent evaluating user queries and returning context-aware answers.
- **Langchain Agent Integration**: A dynamic agent is created where Gemini is provided a specialized tool (`internetSearch`). The internal system prompt explicitly instructs the AI to utilize this tool if a question requires up-to-date real-world information.

### 2. `internetSearch.service.js` (The Eyes)
- Relies directly on the **Tavily API** to securely execute real-time internet web queries via `@tavily/core`.
- Configured specifically as a Langchain Tool, the Gemini AI automatically detects when knowledge is missing, passes a refined search query, and parses the returned relevant web data (limited to the top 5 results for efficiency) directly into its response context!

### 3. Controller Integration (`chat.controller.js`)
When a `POST` request to `/message` is fired, the AI interaction pipeline kicks in:
- The controller checks if a `chatId` was provided. If missing (meaning it's a new conversation), it triggers `generateChatTitle` and persists a new `chatModel` entry.
- **Persistent Conversational Memory**: The `chat.controller.js` executes a database lookup inside `messageModel` fetching *all* chronological chat history tied to the active `chatId`. 
- This entire array of historical context is forwarded directly into `generateResponse(messages)` resolving context seamlessly.

### 4. Database Memory Structure (`chat.model` & `message.model`)
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

## 🔌 API Endpoints
Endpoints are completely categorized, safeguarded, logging-enabled (via Morgan), and highly cohesive. A complete list revolves around:

### **Auth Endpoints** (`/api/auth`)
| Method | Endpoint | Description | Access | Payload/Parameters |
| ------ | -------- | ----------- | ------ | ------------------ |
| `POST` | `/register` | Proposes creation of new user data. | Public | Body: `{ username, email, password }` |
| `POST` | `/login` | Authenticate identity. Resolves with Cookie. | Public | Body: `{ email, password }` |
| `GET`  | `/get-me` | Echoes persistent logged-in profile context. | Private | `authUser` middleware |
| `GET`  | `/verify-email` | Validate a linked email string via auth-token. | Public | Query: `?token=XYZ...` |

### **Chat Endpoints** (`/api/chat`)
| Method | Endpoint | Description | Access | Payload/Parameters |
| ------ | -------- | ----------- | ------ | ------------------ |
| `GET`  | `/` | Intercept continuous connected chat histories. | Private | `authUser` middleware |
| `POST` | `/message` | Generates a new real-time message payload base. | Private | Body dependencies + auth |
| `GET`  | `/:chatId/messages` | Stream past messages attached uniquely to the `chatId`. | Private | Params: `chatId` |
| `GET`  | `/delete/:chatId` | Force destruct conversation history locally & DB wide. | Private | Params: `chatId` |

*(Note: Every `Private` scoped endpoint is strictly walled behind an `authUser` wrapper expecting validated JSON Web Tokens configured tightly in cookies!)*

---

## 🗂 Project Architecture & Directory Structure
```text
Research-AI/
├── backend/                  # Server-side environment & application logic
│   ├── .env                  # Environment Variables (MongoDB connection, API Keys, JWT Secrets)
│   ├── package.json          # Server dependencies (Express, Mongoose, Socket.io, Langchain)
│   ├── server.js             # Initial bootstrapper, Node.js HTTP server & Socket adapter
│   └── src/
│       ├── app.js            # Main Express configurations, Middlewares, and CORS options
│       ├── config/           # Setup definitions (`db.js` connecting Mongoose to DB)
│       ├── controllers/      # Core functions executing behind API Routes (`auth.controller.js`)
│       ├── middlewares/      # Security wrappers validating token permissions (`auth.middleware.js`)
│       ├── models/           # DB schema representations (`chat.model.js`, `message.model.js`)
│       ├── routes/           # Exposed endpoint mappings handling public/private traffic
│       ├── services/         # Complex logic integrations (`ai.service.js`, `internetSearch.service.js`)
│       ├── socket/           # WebSocket processors capturing individual payloads
│       └── validators/       # Input requirement sanitization and request verification
│
└── frontend/                 # Client-Side Web Application dynamic interface
    ├── vite.config.js        # Modern rapid module bundler core configuration
    ├── eslint.config.js      # System formatter defining standards & strict linting
    ├── package.json          # Client resources (React v19, Redux Toolkit, Tailwind CSS v4)
    ├── index.html            # Root DOM template fundamentally mounting the application
    └── src/
        ├── APP/              # Core global application structures targeting the parent layout
        │   ├── index.css     # Root CSS & standard Tailwind framework imports
        │   ├── routes/       # React Router DOM hierarchical view pathway settings
        │   └── store/        # Central Redux definitions tying UI slices deeply together
        ├── features/         # Scalable feature-based module pattern separating logic zones
        │   ├── auth/         # Encapsulated Authentication tree (Login, Register, `auth.api.js`)
        │   └── chat/         # Encapsulated Live Chat tree (Sidebar, `useChat.js`, `chat.socket.js`)
        └── main.jsx          # Root rendering pipeline firing the Vite/React ecosystem
```

---