import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import generateToken from "../Utils/generateToken.js";

//
// ─── REGISTER USER ─────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
//
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
    if (!user) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    // ✅ Create token
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server error while registering user" });
  }
});

//
// ─── LOGIN USER ────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
//
export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Create and send JWT
    generateToken(res, user._id);

    // Update lastLogin for analytics
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error while logging in" });
  }
});

//
// ─── LOGOUT USER ───────────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Private
//
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ message: "Server error while logging out" });
  }
});

//
// ─── GET USER PROFILE ─────────────────────────────────────────
// @route   GET /api/auth/profile
// @access  Private (JWT required)
//
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    // 🔹 Extract JWT from either cookie or header
    let token;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 🔹 Verify token and decode user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Return summarized dashboard data from schema method
    res.status(200).json(user.getDashboardSummary());
  } catch (error) {
    console.error("Profile Fetch Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});



const authenticateUser = async (req) => {
  let token;

  // 1️⃣ Extract token
  if (req.cookies?.jwt) token = req.cookies.jwt;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token) throw new Error("Not authorized, no token");

  // 2️⃣ Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3️⃣ Get user
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");

  return user;
};

//
// ─── GET USER PROFILE (AUTH REQUIRED) ───────────────────────────────
//
export const getUserProfilesetting = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      streakDays: user.streakDays,
      masteryScore: user.masteryScore,
      focusScore: user.focusScore,
      accuracyScore: user.accuracyScore,
      coins: user.coins,
      badges: user.badges.length,
      learningPreferences: user.learningPreferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("❌ Get Profile Error:", error.message);
    res.status(401).json({ message: error.message || "Unauthorized request" });
  }
});

//
// ─── UPDATE USER PROFILE (AUTH REQUIRED) ───────────────────────────────
//
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);

    // Only allow safe fields to update
    const allowedFields = [
      "username",
      "name",
      "avatarUrl",
      "learningPreferences",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    res.status(200).json({
      message: "✅ Profile updated successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
        learningPreferences: updatedUser.learningPreferences,
        xp: updatedUser.xp,
        level: updatedUser.level,
        coins: updatedUser.coins,
      },
    });
  } catch (error) {
    console.error("❌ Update Profile Error:", error.message);
    res.status(401).json({ message: error.message || "Unauthorized request" });
  }
});