# Research-AI 🚀

Welcome to **Research-AI**! This is a full-stack, real-time chat application built using the powerful **MERN** stack (MongoDB, Express.js, React, Node.js) combined with modern tooling like Vite, TailwindCSS v4, and Socket.io for a seamless real-time experience. 

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Complete Project Workflow](#-complete-project-workflow)
- [API Endpoints](#-api-endpoints)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Getting Started (Installation)](#-getting-started-installation)
- [Disclaimer](#-disclaimer)

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
├── backend/                  # Server-side Application & Logic
│   ├── .env                  # Local Environment Variables & Secrets
│   ├── server.js             # Networking Bootstrapper & Socket Initializer
│   └── src/
│       ├── app.js            # Express Initialization, CORS, and Middlewares
│       ├── config/           # Fundamental configurations (MongoDB connectDB)
│       ├── controllers/      # Function declarations matching API Routes
│       ├── middlewares/      # Security guards, Authentication wrappers
│       ├── models/           # Document definitions & schemas
│       ├── routes/           # Concrete path routing declarations
│       ├── socket/           # WebSocket real-time operational handlers
│       └── validators/       # Input Request constraint logic
│
└── frontend/                 # Client-Side Web Application GUI
    ├── vite.config.js        # Modern compilation module bundler config
    ├── eslint.config.js      # Code standard lint configuration
    ├── index.html            # Webpack structural entry foundation
    └── src/
        ├── APP/              # Core layout styling (`index.css`) & config structure
        ├── features/         # Features module folders separated by topic (`auth`, `chat`)
        └── main.jsx          # Frontend tree DOM initiator
```

---