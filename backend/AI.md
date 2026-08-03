# AI Folder Structure & Agent Configuration

This document describes the structure, models, tools, and agents configured under the [ai](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai) directory in the backend.

---

## Directory Overview

The AI integration components are organized as follows:

```text
backend/src/
├── ai/                      # AI integration root folder
│   ├── agent/               # Autonomous agents
│   │   └── search.agent.js  # Configures the Langchain agent and its tools
│   ├── internet.js          # Handles web search via the Tavily API
│   └── model.js             # Initializes and exports LLM/API instances
└── services/                # Backend application services
    └── ai.service.js        # Service containing prompt logic and orchestrating /ai functions
```

### Components Glossary

- **[ai/](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai)**: Core AI directory grouping models, tools, and agents.
- **[search.agent.js](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/agent/search.agent.js)**: Configures the [searchAgent](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/agent/search.agent.js#L14) and registers tools for web-enabled tasks.
- **[internet.js](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/internet.js)**: Holds the [internetSearch](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/internet.js#L3) utility method.
- **[model.js](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/model.js)**: Initializes models like [geminiModel](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/model.js#L7) and [mistrilModel](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/model.js#L12).
- **[ai.service.js](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/services/ai.service.js)**: Implements [generateResponse](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/services/ai.service.js#L49) and orchestrates AI/agent logic for the application.

---

## 1. Models Configuration

The LLM and API configurations are defined in [model.js](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/model.js). It initializes the following instances:

### [geminiModel](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/model.js#L7)
- **Library**: `@langchain/google-genai`
- **Model Name**: `gemini-2.5-flash-lite`
- **Purpose**: A lightweight, fast Google Gemini model used for general agent orchestration and fast response generation.

### [mistrilModel](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/model.js#L12)
- **Library**: `@langchain/mistralai`
- **Model Name**: `mistral-small-latest`
- **Purpose**: Mistral model configuration for alternative reasoning or processing.

### [tavily](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/model.js#L17)
- **Library**: `@tavily/core`
- **Purpose**: Tavily Search client to execute search queries and retrieve structured internet results.

---

## 2. Internet Search Utility

The [internet.js](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/internet.js) file exports the [internetSearch](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/internet.js#L3) function, which serves as the primary gateway to fetch information from the web.

### [internetSearch](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/internet.js#L3)
- **Description**: An asynchronous function that accepts a `query` parameter.
- **Behavior**:
  1. Calls `tavily.search()` with the query and limits results to a maximum of `5`.
  2. Processes results by extracting:
     - `title`: The title of the webpage.
     - `url`: The link to the source.
     - `content`: The snippet of text, sliced to the first `500` characters to prevent token overflow.
  3. Formats the results into a structured text layout:
     ```text
     Source [Number]
     Title: [title]
     URL: [url]
     Summary: [content]
     ```
  4. Joins the sources with double newlines (`\n\n`) and returns the final string.

---

## 3. Search Agent

The search agent logic resides in [search.agent.js](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/agent/search.agent.js). It integrates the LLM with the internet search utility as a tool.

### [searchInternetTool](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/agent/search.agent.js#L6)
- **Created via**: Langchain `tool` helper.
- **Underlying Function**: Links directly to the [internetSearch](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/internet.js#L3) helper.
- **Metadata**:
  - **Name**: `internetSearch`
  - **Description**: `User this to get the latest information from the internet.`
  - **Schema**: Validated using `zod` (`z.object({ query: z.string() })`).

### [searchAgent](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/agent/search.agent.js#L14)
- **Created via**: Langchain `createAgent` helper.
- **Configuration**:
  - **Model**: [geminiModel](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/model.js#L7)
  - **Tools**: Includes [searchInternetTool](file:///c:/Users/ghans/Devloper/PROJECT/Research-AI/backend/src/ai/agent/search.agent.js#L6) within its tools list to let the agent perform web searches dynamically.
