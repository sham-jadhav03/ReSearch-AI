import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [72, "Password must be at most 72 characters long"],
      validate: {
        validator: (value) => !value || Buffer.byteLength(value, "utf8") <= 72,
        message: "Password must not exceed 72 bytes",
      },
    },
    googleId: {
      type: String,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ verified: 1 });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const userModel = mongoose.model("User", userSchema);

export default userModel;
