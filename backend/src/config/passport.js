import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config.js";
import userModel from "../models/user.model.js";

const createGoogleUsername = async (email) => {
  const localPart = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  const base = localPart.length >= 3 ? localPart : "google_user";

  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const username =
      suffix === 0
        ? base.slice(0, 30)
        : `${base.slice(0, 29 - String(suffix).length)}_${suffix}`;
    if (!(await userModel.exists({ username }))) return username;
  }

  throw new Error("Unable to create a unique username for Google account");
};

const linkGoogleIdentity = async (user, googleId) => {
  if (user.googleId) return user.googleId === googleId ? user : null;

  const linkedUser = await userModel.findOneAndUpdate(
    {
      _id: user._id,
      $or: [{ googleId: { $exists: false } }, { googleId: null }],
    },
    { $set: { googleId, verified: true } },
    { new: true, runValidators: true },
  ).select("+googleId");

  if (linkedUser) return linkedUser;

  const identityOwner = await userModel.findOne({ googleId }).select("+googleId");
  return identityOwner?._id.equals(user._id) ? identityOwner : null;
};

export const findOrLinkGoogleUser = async (profile) => {
  const email =
    typeof profile._json?.email === "string"
      ? profile._json.email.trim().toLowerCase()
      : "";
  if (!profile.id || !email || profile._json?.email_verified !== true) {
    return null;
  }

  const linkedIdentity = await userModel
    .findOne({ googleId: profile.id })
    .select("+googleId");
  if (linkedIdentity) return linkedIdentity;

  const existingUser = await userModel.findOne({ email }).select("+googleId");
  if (existingUser) return linkGoogleIdentity(existingUser, profile.id);

  try {
    return await userModel.create({
      username: await createGoogleUsername(email),
      email,
      googleId: profile.id,
      verified: true,
    });
  } catch (error) {
    if (error.code !== 11000) throw error;

    const identityOwner = await userModel
      .findOne({ googleId: profile.id })
      .select("+googleId");
    if (identityOwner) return identityOwner;

    const emailOwner = await userModel.findOne({ email }).select("+googleId");
    if (emailOwner) return linkGoogleIdentity(emailOwner, profile.id);
    throw error;
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrLinkGoogleUser(profile);
        done(null, user || false);
      } catch (error) {
        done(error);
      }
    },
  ),
);

export default passport;
