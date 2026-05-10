# 📋 Implementation Plan: Custom Advanced Streaming & Message Rendering

**Goal:** Replicate the advanced "parts-based" streaming functionality seen in `temp.md` (which supports mixing text and dynamic UI components in a single message stream) using our existing manual SSE code, *without* the Vercel AI SDK.

We will focus on implementing the core **Data Protocol**, **State Management**, and **Message Rendering** logic first.

---

## 🛠 Phase 1: Define the Shared Data Structures
Both frontend and backend need to agree on how a message is structured. We will move away from a simple string and adopt a `parts` array model.

**Message Structure:**
```javascript
{
  id: "msg-123",
  role: "ai",
  parts: [
    // Text Part
    { type: "text", text: "Here is what I found:" },
    // Tool Part (e.g., Sources/Citations)
    { type: "dynamic-tool", toolName: "searchInternet", state: "done", output: { ... } },
    // More Text
    { type: "text", text: "Hope this helps!" }
  ]
}
```

---

## 🖥 Phase 2: Backend Protocol Update (`chat.controller.js` & `ai.service.js`)
Currently, the backend extracts only text chunks and sends `{ type: "token", token: "..." }`. We need to update this to send structured events.

**Step 2.1:** Update `ai.service.js` to yield different types of events from the LangChain stream, not just text.
- If it's a text chunk: yield `{ type: "text-delta", delta: "chunk_content" }`
- If it's a tool call starting: yield `{ type: "tool-call-start", toolName: "tool_name" }`
- If it's a tool call completing: yield `{ type: "tool-call-result", result: { ... } }`

**Step 2.2:** Update `chat.controller.js` to emit these precise events over the SSE stream instead of the old `"token"` event.

---

## 🌐 Phase 3: Frontend State Management (`useChat.js`)
We need to drastically change how `useChat.js` buffers the streaming data. It can no longer just append strings to `streamingText`.

**Step 3.1:** Introduce a new `streamingParts` state array (using refs for performance during the loop).
**Step 3.2:** Update the `while (true)` loop inside `handleSendMessage`:
- **On `text-delta`**: Check if the last item in the `parts` array is a `"text"` part. If so, append the delta. If not, push a new `"text"` part to the array.
- **On `tool-call-start`**: Push a new `"dynamic-tool"` part into the array with `state: "streaming"`.
- **On `tool-call-result`**: Find the active tool part and update its state to `"done"`, attaching the result data.
**Step 3.3:** Use `requestAnimationFrame` to push the current `streamingParts` array to React state so the UI can re-render smoothly.

---

## 🎨 Phase 4: Building the Message Renderer (`MessageRenderer.jsx`)
We will create a central component responsible for rendering a message based on its `parts` array, exactly like the reference project.

**Step 4.1:** Create `MessageRenderer.jsx`. It will accept a `messages` array.
**Step 4.2:** Iterate through `messages`, and then iterate through `message.parts`.
**Step 4.3:** Render based on part type:
```jsx
// Pseudo-code for MessageRenderer
{message.parts.map((part, index) => {
  if (part.type === "text") {
    // Render text block (using Markdown/Streamdown eventually)
    return <MessageResponse key={index}>{part.text}</MessageResponse>;
  }
  
  if (part.type === "dynamic-tool" && part.toolName === "searchInternet") {
    // Generative UI: Render the React component for the tool
    if (part.state === "done") {
        return <SourcesList key={index} citations={part.output} />;
    } else {
        return <ToolLoadingSpinner key={index} toolName="Searching the web..." />;
    }
  }
})}
```

---

## ⏭ Next Steps after Review
Once you approve this plan, we will start by executing **Phase 1** and **Phase 2** to establish the foundation, and then we'll move on to building the UI renderer. Let me know what you think!
