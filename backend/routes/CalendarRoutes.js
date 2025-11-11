import express from "express";
import {
  getCalendar,
  addCalendarTask,
  completeTask,
  getCalendarSummary,
  updateDailyStreak,
} from "../controllers/calendarController.js";

const router = express.Router();

router.get("/", getCalendar);
router.get("/summary", getCalendarSummary);
router.post("/add", addCalendarTask);
router.patch("/complete/:taskId", completeTask);
router.patch("/streak", updateDailyStreak);

export default router;
