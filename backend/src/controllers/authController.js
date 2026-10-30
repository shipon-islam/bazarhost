import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { audit } from "../services/audit.js";
import { tokenMatches } from "../services/invite.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { effectivePermissions } from "../utils/permissions.js";
import { ok } from "../utils/response.js";

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd || env.COOKIE_SAMESITE === "none",
  sameSite: env.COOKIE_SAMESITE,
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/",
});

const signToken = (user) =>
  jwt.sign({ tv: user.tokenVersion }, env.JWT_SECRET, {
    subject: String(user._id),
    expiresIn: Math.round(env.JWT_EXPIRES_DAYS * 86400),
    algorithm: "HS256",
  });

function setSessionCookie(res, user) {
  const token = signToken(user);
  res.cookie(env.COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: env.JWT_EXPIRES_DAYS * 86400000,
  });
  return token;
}

/** User JSON + flattened permission list for the frontend's route guards and menu filtering. */
export const sessionUser = (user) => ({
  ...user.toJSON(),
  isSuperAdmin: user.role.isSuperAdmin === true,
  permissions: effectivePermissions(user),
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, returnToken } = req.body;
  const user = await User.findOne({ email })
    .select("+passwordHash")
    .populate("role");
  const match = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_HASH,
  );
  if (!user || !user.passwordHash || !match)
    throw new ApiError(401, "Invalid email or password", {
      code: "INVALID_CREDENTIALS",
    });
  if (user.status !== "active")
    throw new ApiError(
      403,
      `Your account is ${user.status}. Please contact an administrator.`,
      { code: "ACCOUNT_INACTIVE" },
    );
  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  user.lastLoginAt = new Date();
  const token = setSessionCookie(res, user);
  req.user = user;
  audit(req, "auth.login", "user", user._id);
  ok(res, { user: sessionUser(user), ...(returnToken ? { token } : {}) });
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) {
    throw new ApiError(409, "A user with this email already exists", {
      code: "EMAIL_IN_USE",
      details: [{ field: "email", message: "Email already in use" }],
    });
  }
  const role = await Role.findOne({ slug: "user", type: "customer" });
  if (!role)
    throw new ApiError(
      503,
      "User registration is not configured. Run the database seed first.",
      { code: "REGISTRATION_UNAVAILABLE" },
    );

  const user = new User({ name, email, role: role._id, status: "active" });
  await user.setPassword(password);
  try {
    await user.save();
  } catch (err) {
    if (err?.code === 11000)
      throw new ApiError(409, "A user with this email already exists", {
        code: "EMAIL_IN_USE",
        details: [{ field: "email", message: "Email already in use" }],
      });
    throw err;
  }
  user.role = role;
  user.lastLoginAt = new Date();
  req.user = user;
  setSessionCookie(res, user);
  audit(req, "auth.register", "user", user._id);
  ok(res, { user: sessionUser(user) }, undefined, 201);
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.COOKIE_NAME, cookieOptions());
  ok(res, { message: "Signed out" });
});

export const me = asyncHandler(async (req, res) =>
  ok(res, { user: sessionUser(req.user) }),
);

export const updateMe = asyncHandler(async (req, res) => {
  req.user.set(req.body);
  await req.user.save();
  ok(res, { user: sessionUser(req.user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id)
    .select("+passwordHash")
    .populate("role");
  if (
    !user.passwordHash ||
    !(await bcrypt.compare(currentPassword, user.passwordHash))
  ) {
    throw new ApiError(400, "Current password is incorrect", {
      details: [{ field: "currentPassword", message: "Incorrect password" }],
    });
  }
  await user.setPassword(newPassword); // bumps tokenVersion => all other sessions are signed out
  await user.save();
  setSessionCookie(res, user);
  audit(req, "auth.password_changed", "user", user._id);
  ok(res, { message: "Password updated" });
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const invalid = new ApiError(
    400,
    "This invite link is invalid or has expired",
    { code: "INVALID_INVITE" },
  );
  const [id, raw] = req.body.token.split(".");
  if (!/^[a-f\d]{24}$/i.test(id ?? "") || !raw) throw invalid;
  const user = await User.findById(id).select(
    "+inviteTokenHash +inviteExpiresAt",
  );
  if (
    !user ||
    !user.inviteExpiresAt ||
    user.inviteExpiresAt < new Date() ||
    !tokenMatches(raw, user.inviteTokenHash)
  )
    throw invalid;
  await user.setPassword(req.body.password);
  await user.save();
  ok(res, { message: "Password set. You can now sign in." });
});
