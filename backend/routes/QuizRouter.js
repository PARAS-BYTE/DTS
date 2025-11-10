import express from "express";
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesByCourse,
  attemptQuiz,
} from "../Controllers/QuizController.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllQuizzes);
router.get("/:id", protect, getQuizById);
router.get("/course/:courseId", getQuizzesByCourse);

// Admin/instructor routes
router.post("/", createQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

// Student routes
router.post("/:id/attempt",  attemptQuiz);

export default router;
