import asyncHandler from "express-async-handler";
import Course from "../Models/Course.js";
import User from "../Models/User.js";
import jwt from 'jsonwebtoken'
//
// ─── GET ALL COURSES ───────────────────────────────────────────────
// @route   GET /api/courses
// @access  Public
//
export const getAllCourses = asyncHandler(async (req, res) => {
    try {
        const { category, level, search } = req.query;
        const query = {};

        if (category) query.category = category;
        if (level) query.level = level;
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        const courses = await Course.find(query)
            .select("title description category level thumbnail averageRating duration instructor")
            .populate("instructor", "username email");

        res.status(200).json(courses);
    } catch (error) {
        console.error("Get Courses Error:", error.message);
        res.status(500).json({ message: "Server error while fetching courses" });
    }
});

//
// ─── GET SINGLE COURSE BY ID ───────────────────────────────────────
// @route   GET /api/courses/:id
// @access  Public
//
export const getCourseDetails = asyncHandler(async (req, res) => {
    try {
      console.log("📩 Course details request received");
  
      // ─── 1. Extract JWT ───────────────────────────────
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
  
      // ─── 2. Verify JWT ────────────────────────────────
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ─── 3. Get Course ID from Body ───────────────────
      const { courseId } = req.body;
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }
  
      // ─── 4. Fetch Course with Instructor Only ─────────
      const course = await Course.findById(courseId).populate(
        "instructor",
        "username email"
      );
  
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
  
      // ─── 5. Extract User Progress ─────────────────────
      const userCourse = user.enrolledCourses.find(
        (ec) => ec.courseId.toString() === courseId.toString()
      );
  
      const userProgress = userCourse
        ? {
            progress: userCourse.progress || 0,
            completed: userCourse.completed || false,
            lastAccessed: userCourse.lastAccessed || null,
          }
        : { progress: 0, completed: false };
  
      // ─── 6. Build Module + Lesson Response ────────────
      const formattedModules = course.modules.map((mod) => ({
        title: mod.title,
        description: mod.description,
        order: mod.order,
        lessons: mod.lessons.map((lesson) => ({
          title: lesson.title,
          videoUrl: lesson.videoUrl, // only videos included
          duration: lesson.duration,
          order: lesson.order,
        })),
      }));
  
      // ─── 7. Final Response ────────────────────────────
      const response = {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        thumbnail:
          course.thumbnail ||
          "https://via.placeholder.com/400x250?text=Course+Thumbnail",
        instructor: course.instructor,
        modules: formattedModules,
        userProgress,
      };
  
      res.status(200).json(response);
    } catch (error) {
      console.error("Get Course Error:", error.message);
      res.status(500).json({
        message: "Server error while fetching course details",
      });
    }
  });
  

//
// ─── CREATE COURSE (ADMIN) ─────────────────────────────────────────
// @route   POST /api/courses
// @access  Private (Admin)
//
export const createCourse = asyncHandler(async (req, res) => {
    try {
        const { title, description, category, level, duration, thumbnail } = req.body;

        const existing = await Course.findOne({ title });
        if (existing) {
            return res.status(400).json({ message: "Course with this title already exists" });
        }

        const course = await Course.create({
            title,
            description,
            category,
            level,
            duration,
            thumbnail,
            instructor: req.user._id,
        });

        res.status(201).json(course);
    } catch (error) {
        console.error("Create Course Error:", error.message);
        res.status(500).json({ message: "Server error while creating course" });
    }
});

//
// ─── UPDATE COURSE ────────────────────────────────────────────────
// @route   PUT /api/courses/:id
// @access  Private (Admin)
//
export const updateCourse = asyncHandler(async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to update this course" });
        }

        Object.assign(course, req.body);
        await course.save();

        res.status(200).json({ message: "Course updated successfully", course });
    } catch (error) {
        console.error("Update Course Error:", error.message);
        res.status(500).json({ message: "Server error while updating course" });
    }
});

//
// ─── DELETE COURSE ────────────────────────────────────────────────
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
//
export const deleteCourse = asyncHandler(async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this course" });
        }

        await course.deleteOne();
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Delete Course Error:", error.message);
        res.status(500).json({ message: "Server error while deleting course" });
    }
});

//
// ─── ENROLL STUDENT IN COURSE ─────────────────────────────────────
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
//
export const enrollInCourse = asyncHandler(async (req, res) => {
    try {
        // ─── 1. Extract JWT ───────────────────────────────
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

        // ─── 2. Verify Token ──────────────────────────────
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ─── 3. Fetch User ────────────────────────────────
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ─── 4. Get Course ID from Body ───────────────────
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }

        // ─── 5. Find Course ───────────────────────────────
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // ─── 6. Check if Already Enrolled ─────────────────
        const alreadyEnrolled = course.enrolledStudents.some(
            (s) => s.studentId.toString() === user._id.toString()
        );
        if (alreadyEnrolled) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        // ─── 7. Add Enrollment ────────────────────────────
        course.enrolledStudents.push({ studentId: user._id });
        await course.save();

        user.enrolledCourses.push({
            courseId: course._id,
            title: course.title,
        });
        await user.save();

        // ─── 8. Response ──────────────────────────────────
        res.status(200).json({
            message: `Successfully enrolled in "${course.title}"`,
            courseId: course._id,
            userId: user._id,
        });
    } catch (error) {
        console.error("Enrollment Error:", error.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});


//
// ─── GET ENROLLED COURSES OF A STUDENT ─────────────────────────────
// @route   GET /api/courses/my
// @access  Private (Student)
//
export const getMyCourses = asyncHandler(async (req, res) => {
    console.log('Request Recieved')
    try {
        // ─── 1. Extract JWT from cookies or headers ─────────────────────────────
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

        // ─── 2. Verify JWT and get user ─────────────────────────────────────────
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).populate(
            "enrolledCourses.courseId"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ─── 3. Build Course Response ───────────────────────────────────────────
        const courses = user.enrolledCourses.map((ec) => ({
            _id: ec.courseId?._id,
            title: ec.courseId?.title,
            description: ec.courseId?.description,
            progress: ec.progress || 0,
            completed: ec.completed || false,
            thumbnail:
                ec.courseId?.thumbnail ||
                "https://via.placeholder.com/400x250?text=Course+Image",
        }));
        console.log(`Sending Data`, courses)
        // ─── 4. Respond ────────────────────────────────────────────────────────
        res.status(200).json(courses);
    } catch (error) {
        console.error("My Courses Error:", error.message);
        res
            .status(500)
            .json({ message: "Server error while fetching enrolled courses" });
    }
});