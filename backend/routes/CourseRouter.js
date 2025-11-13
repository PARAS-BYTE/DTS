import express from "express";
// import {
//     getAllCourses,
//     getCourseById,
//     createCourse,
//     updateCourse,
//     deleteCourse,
//     enrollInCourse,
//     getMyCourses,
// } from "../Controllers/CourseController.js";
import { getAllCourses, createCourse, updateCourse, deleteCourse, enrollInCourse, getMyCourses, getCourseDetails, autoCreateCourse, getPlaylistVideos } from "../Controllers/CourseController.js";
// import { isAdmin } from "../middleware/roleCheck.js";

const router = express.Router();

router.get("/", getAllCourses);
// router.get("/:id", getCourseById);

router.get("/my", getMyCourses);
router.post("/getsingle",getCourseDetails)
router.post("/enroll", enrollInCourse);

router.post("/",  createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.post("/aigen",autoCreateCourse)
router.post("/ytcr",getPlaylistVideos)

export default router;
