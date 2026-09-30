import mongoose from "mongoose";

const partsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "dynamic-tool"],
      required: true,
    },
    // text-part field
    text: {
      type: String,
      required: function () {
        return this.type === "text";
      },
    },

    toolName: {
      type: String,
      required: function () {
        return this.type === "dynamic-tool";
      },
    },

    state: {
      type: String,
      enum: ["streaming", "done"],
      required: function () {
        return this.type === "dynamic-tool";
      },
    },
    args: {
      type: String,
      default: "",
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false },
);

const citationSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

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
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    citations: {
      type: [citationSchema],
      default: [],
    },
    parts: {
      type: [partsSchema],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

messageSchema.index({ chat: 1, createdAt: 1 });

// Purges soft-deleted messages (deletedAt set) automatically after 30 days.
// Documents with deletedAt: null are never touched by the TTL monitor,
// so active messages are immune — only cascaded (deleted) ones expire.
messageSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

messageSchema.virtual("hasCitations").get(function () {
  return this.citations.length > 0;
});
messageSchema.set("toJSON", { virtuals: true });
messageSchema.set("toObject", { virtuals: true });

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
