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
chatSchema.index({ deletedAt: 1 });

const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;
