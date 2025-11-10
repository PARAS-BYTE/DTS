import asyncHandler from "express-async-handler";
import User from "../Models/User.js";

//
// ─── GET ALL TASKS (USER CALENDAR) ─────────────────────────────
// @route   GET /api/calendar
// @access  Private (Student)
//
export const getCalendarTasks = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      calendarData: user.calendarData || [],
      upcomingTasks: user.upcomingTasks || [],
      completedTasks: user.completedTasks || [],
    });
  } catch (error) {
    console.error("Get Calendar Tasks Error:", error.message);
    res.status(500).json({ message: "Server error while fetching calendar tasks" });
  }
});

//
// ─── ADD NEW TASK ───────────────────────────────────────────────
// @route   POST /api/calendar/add
// @access  Private (Student)
//
export const addCalendarTask = asyncHandler(async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, type } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and due date are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTask = {
      taskId: new Date().getTime().toString(),
      title,
      description: description || "",
      date: dueDate,
      status: "pending",
      type: type || "task",
      priority: priority || "medium",
      category: category || "General",
    };

    user.calendarData.push(newTask);
    user.upcomingTasks.push({
      title,
      dueDate,
      course: category || "",
      type: type || "task",
    });

    await user.save();

    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.error("Add Task Error:", error.message);
    res.status(500).json({ message: "Server error while adding task" });
  }
});

//
// ─── MARK TASK AS COMPLETED ─────────────────────────────────────
// @route   PATCH /api/calendar/complete/:taskId
// @access  Private (Student)
//
export const markTaskCompleted = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const task = user.calendarData.find((t) => t.taskId === taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "completed") {
      return res.status(400).json({ message: "Task already completed" });
    }

    // Update task status
    task.status = "completed";
    user.completedTasks.push({ taskId, completedAt: new Date() });

    // Remove from upcomingTasks if present
    user.upcomingTasks = user.upcomingTasks.filter((t) => t.title !== task.title);

    await user.save();

    res.status(200).json({ message: "Task marked as completed", task });
  } catch (error) {
    console.error("Mark Task Complete Error:", error.message);
    res.status(500).json({ message: "Server error while completing task" });
  }
});

//
// ─── DELETE TASK ────────────────────────────────────────────────
// @route   DELETE /api/calendar/:taskId
// @access  Private (Student)
//
export const deleteTask = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.calendarData = user.calendarData.filter((t) => t.taskId !== taskId);
    user.upcomingTasks = user.upcomingTasks.filter((t) => t.taskId !== taskId);
    user.completedTasks = user.completedTasks.filter((t) => t.taskId !== taskId);

    await user.save();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error.message);
    res.status(500).json({ message: "Server error while deleting task" });
  }
});

//
// ─── TODAY'S SUMMARY ────────────────────────────────────────────
// @route   GET /api/calendar/summary
// @access  Private (Student)
//
export const getTodaySummary = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalTasks = user.calendarData.length;
    const completedTasks = user.completedTasks.length;
    const pendingTasks = totalTasks - completedTasks;

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      today: new Date(),
    });
  } catch (error) {
    console.error("Get Summary Error:", error.message);
    res.status(500).json({ message: "Server error while fetching summary" });
  }
});
