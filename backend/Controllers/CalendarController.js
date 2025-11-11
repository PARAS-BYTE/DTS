import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
// import User from "../models/userModel.js";


// ─── AUTH HELPER ───────────────────────────────
const authenticateUser = async (req) => {
  let token;
  if (req.cookies?.jwt) token = req.cookies.jwt;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  )
    token = req.headers.authorization.split(" ")[1];
  if (!token) throw new Error("Not authorized, no token");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");

  return user;
};

// ─── GET CALENDAR TASKS ───────────────────────────────
export const getCalendar = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  res.status(200).json({ calendarData: user.calendarData });
});

// ─── GET SUMMARY ───────────────────────────────
export const getCalendarSummary = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const totalTasks = user.calendarData.length;
  const completedTasks = user.calendarData.filter((t) => t.status === "completed").length;
  const pendingTasks = totalTasks - completedTasks;

  res.status(200).json({ totalTasks, completedTasks, pendingTasks });
});

// ─── ADD TASK ───────────────────────────────
export const addCalendarTask = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { title, description, date, priority, category } = req.body;

  const newTask = {
    taskId: new Date().getTime().toString(),
    title,
    description,
    date: new Date(date),
    priority: priority || "medium",
    category: category || "General",
    status: "pending",
  };

  user.addCalendarTask(newTask);
  await user.save();

  res.status(201).json({ message: "Task added successfully", task: newTask });
});

// ─── MARK TASK COMPLETE ───────────────────────────────
export const completeTask = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { taskId } = req.params;

  user.recordCompletion(taskId);
  await user.save();

  res.status(200).json({ message: "Task marked as completed" });
});

// ─── UPDATE STREAK (on marking today’s task) ───────────────────────────────
export const updateDailyStreak = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const today = new Date();
  const hasTaskToday = user.calendarData.some(
    (t) =>
      new Date(t.date).toDateString() === today.toDateString() &&
      t.status === "completed"
  );

  user.updateStreak(hasTaskToday);
  await user.save();

  res.status(200).json({
    message: hasTaskToday
      ? "Streak updated successfully!"
      : "No completed task today — streak reset.",
    streakDays: user.streakDays,
    personalBestStreak: user.personalBestStreak,
  });
});
