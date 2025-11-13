import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import Calendar from "../Models/Calendar.js";
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

const ensureCalendarForUser = async (user) => {
  let calendar = await Calendar.findOne({ userId: user._id });

  if (!calendar) {
    calendar = new Calendar({
      userId: user._id,
      studyPreferences: {
        subjects:
          user.enrolledCourses?.map((course) => course.title) || [
            "General Learning",
          ],
        difficultyLevel:
          user.level > 2 ? "advanced" : user.level > 1 ? "intermediate" : "beginner",
        dailyStudyTime: 60,
        learningGoals: ["Improve knowledge", "Build consistent study habits"],
        preferredLearningStyles: ["visual", "practical"],
      },
    });
    await calendar.save();
  } else if (calendar.cleanupInvalidTasks) {
    calendar.cleanupInvalidTasks();
    await calendar.save();
  }

  return calendar;
};

const sameDay = (dateA, dateB) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return a.getTime() === b.getTime();
};

const dailyLabel = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

const minutesToHours = (minutes) =>
  Math.round(((minutes || 0) / 60) * 10) / 10;

const taskXp = (task) => {
  const bonus =
    task.difficulty === "advanced"
      ? 20
      : task.difficulty === "intermediate"
      ? 10
      : 0;
  return 30 + bonus;
};

export const getStudentDashboard = asyncHandler(async (req, res) => {
  try {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const calendar = await ensureCalendarForUser(user);
    const tasks = Array.isArray(calendar.tasks) ? calendar.tasks : [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7DaysStudy = [];
    const xpHistory = [];

    for (let i = 6; i >= 0; i -= 1) {
      const target = new Date();
      target.setHours(0, 0, 0, 0);
      target.setDate(today.getDate() - i);

      const completedTasks = tasks.filter((task) => {
        if (task.status !== "completed") return false;
        const completionDate = task.completedAt || task.date;
        return completionDate && sameDay(completionDate, target);
      });

      const minutes = completedTasks.reduce(
        (sum, task) => sum + (task.estimatedDuration || 30),
        0
      );
      const xp = completedTasks.reduce((sum, task) => sum + taskXp(task), 0);

      last7DaysStudy.push({
        day: dailyLabel(target),
        hours: minutesToHours(minutes),
      });

      xpHistory.push({
        day: dailyLabel(target),
        xp,
      });
    }

    const weeklyXP = xpHistory.reduce((sum, entry) => sum + entry.xp, 0);

    const upcomingTasks = tasks
      .filter((task) => {
        const date = new Date(task.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime() >= today.getTime() && task.status !== "completed";
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
      .map((task) => ({
        taskId: task.taskId,
        title: task.title,
        type: task.type,
        status: task.status,
        dueDate: task.date,
        estimatedDuration: task.estimatedDuration || 30,
      }));

    const calendarStats = calendar.statistics?.toObject
      ? calendar.statistics.toObject()
      : calendar.statistics || {};

    const summary = user.getDashboardSummary();
    summary.last7DaysStudy = last7DaysStudy;
    summary.xpHistory = xpHistory;
    summary.upcomingTasks = upcomingTasks;
    summary.weeklyXP = weeklyXP;
    summary.streak = calendar.streak?.currentStreak || 0;
    summary.personalBestStreak = calendar.streak?.longestStreak || 0;

    res.status(200).json({
      ...summary,
      statistics: calendarStats,
      streakStats: calendar.streak || { currentStreak: 0, longestStreak: 0 },
    });
  } catch (error) {
    console.error("Dashboard Fetch Error:", error.message);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});
