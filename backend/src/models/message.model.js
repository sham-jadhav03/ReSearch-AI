import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    citations: {
      type: Array,
      default: []
    },
    hasCitations: {
      type: Boolean,
      default: false
    },
    parts: {
      type: Array,
      default: []
    }
  },
  { timestamps: true },
);

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel
