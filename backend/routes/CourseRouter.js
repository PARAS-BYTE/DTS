import express from "express";
import { getAllCourses, createCourse, updateCourse, deleteCourse, enrollInCourse, getMyCourses, getCourseDetails, trackCourseAccess, completeLesson, autoCreateCourse, getPlaylistVideos } from "../Controllers/CourseController.js";
import { protectAdmin } from "../MiddleWare/adminAuthMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCourses);
router.get("/my", getMyCourses);
router.post("/getsingle", getCourseDetails);
router.post("/enroll", enrollInCourse);

// Student routes (require authentication via JWT in controller)
router.post("/:id/access", trackCourseAccess);
router.post("/:id/complete-lesson", completeLesson);

// Admin protected routes
router.post("/", protectAdmin, createCourse);
router.put("/:id", protectAdmin, updateCourse);
router.delete("/:id", protectAdmin, deleteCourse);

// AI and playlist routes
router.post("/aigen", autoCreateCourse);
router.post("/ytcr", getPlaylistVideos);

export default router;
