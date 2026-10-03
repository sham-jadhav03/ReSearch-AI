import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

chatSchema.index({ user: 1, lastMessageAt: -1 });
// Purges soft-deleted chats after 30 days (same window as messages).
// partialFilterExpression keeps the index out of every `deletedAt: null`
// live chat, avoiding index bloat; TTL monitor still only sees docs with a
// real date, so active chats are immune.
chatSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { deletedAt: { $type: "date" } },
  },
);

const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;
