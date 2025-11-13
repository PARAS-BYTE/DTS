import express from "express";
import {
  createAssignment,
  getAdminAssignments,
  getStudentAssignments,
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
  aiGradeAssignment,
} from "../Controllers/AssignmentController.js";
import { protectAdmin } from "../MiddleWare/adminAuthMiddleware.js";

const router = express.Router();

// Admin routes (must come before parameterized routes)
router.post("/", protectAdmin, createAssignment);
router.get("/admin", protectAdmin, getAdminAssignments);
router.get("/:id/submissions", protectAdmin, getAssignmentSubmissions);
router.put("/:assignmentId/grade/:submissionId", protectAdmin, gradeAssignment);
router.post("/:assignmentId/ai-grade/:submissionId", protectAdmin, aiGradeAssignment);

// Student routes (must come before parameterized routes)
router.get("/student", getStudentAssignments);
router.post("/:id/submit", submitAssignment);

export default router;

