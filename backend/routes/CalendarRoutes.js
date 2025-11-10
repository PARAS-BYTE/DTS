import express from "express";
import {
  getCalendarTasks,
  addCalendarTask,
  markTaskCompleted,
  deleteTask,
  getTodaySummary,
} from "../Controllers/CalendarController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCalendarTasks);
router.post("/add", addCalendarTask);
router.patch("/complete/:taskId", markTaskCompleted);
router.delete("/:taskId", deleteTask);
router.get("/summary", getTodaySummary);
// router.route("/").get(protect, getCalendarTasks);
// router.route("/add").post(protect, addCalendarTask);
// router.route("/complete/:taskId").patch(protect, markTaskCompleted);
// router.route("/:taskId").delete(protect, deleteTask);
// router.route("/summary").get(protect, getTodaySummary);

export default router;
