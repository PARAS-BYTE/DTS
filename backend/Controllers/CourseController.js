import asyncHandler from "express-async-handler";
import Course from "../Models/Course.js";
import User from "../Models/User.js";
import jwt from 'jsonwebtoken'
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import axios from 'axios'

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
        console.log("📩 Create course request received");

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

        // ─── 3. Continue Original Logic ───────────────────
        console.log(req.body);
        await Course.insertOne(req.body)
        // You can now safely insert the data using req.body
        // e.g. const course = await Course.create({ ...req.body, instructor: user._id });

        return res.send({
            msg: "Done work from my side",
            authenticatedUser: user.username,
        });
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
        // console.log(`Sending Data`, courses)
        // ─── 4. Respond ────────────────────────────────────────────────────────
        res.status(200).json(courses);
    } catch (error) {
        console.error("My Courses Error:", error.message);
        res
            .status(500)
            .json({ message: "Server error while fetching enrolled courses" });
    }
});


export const autoCreateCourse = async (req, res) => {
    try {
        const { topic, category = "General", level = "Beginner" } = req.body;
        if (!topic) return res.status(400).json({ error: "Topic is required" });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Prompt (kept small to avoid overload)
        const prompt = `
You are an expert e-learning content creator.
Generate a small sample online course (for demo) using the topic below.

Topic: "${topic}"
Category: "${category}"
Level: "${level}"

⚙️ Rules:
- Only 1–2 modules total.
- Each module has 1–2 lessons.
- Use real YouTube video links related to each lesson topic.
- Keep content concise and realistic for an online course.
- Return ONLY valid JSON, no markdown or explanations.

JSON structure:
{
  "title": "string",
  "description": "string",
  "thumbnail": "https://example.com/image.jpg",
  "modules": [
    {
      "title": "string",
      "description": "string",
      "order": 1,
      "lessons": [
        {
          "title": "string",
          "videoUrl": "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
          "content": "string",
          "duration": 8,
          "order": 1
        }
      ]
    }
  ],
  "tags": ["string", "string"]
}

Output only JSON, nothing else.
`;

        // Ask Gemini to generate
        const result = await model.generateContent(prompt);
        let rawText = "";
        console.log("Result", result)
        try {
            rawText = (await result.response.text()).trim();
        } catch {
            rawText = result.response?.text?.trim?.() || "";
        }

        // Helper: extract JSON safely
        const extractJson = (text) => {
            const match = text.match(/({[\s\S]*})/);
            return match ? match[1] : text;
        };

        let candidate = extractJson(rawText);
        let parsed;
        try {
            parsed = JSON.parse(candidate);
        } catch {
            try {
                parsed = JSON5.parse(candidate);
            } catch {
                console.error("❌ Gemini invalid JSON:", rawText);
                return res.status(500).json({
                    error: "Invalid JSON output from Gemini",
                    raw: rawText,
                });
            }
        }

        // Sanitize & default values
        parsed.modules = Array.isArray(parsed.modules) ? parsed.modules : [];
        parsed.modules.forEach((m, i) => {
            m.order = m.order || i + 1;
            m.lessons = Array.isArray(m.lessons) ? m.lessons : [];
            m.lessons.forEach((l, j) => {
                l.order = l.order || j + 1;
                l.duration = l.duration || 8;
                if (typeof l.videoUrl !== "string") l.videoUrl = "";
            });
        });

        // Save to DB
        const newCourse = new Course({
            title: parsed.title || topic,
            description: parsed.description || "",
            category,
            level,
            thumbnail: parsed.thumbnail || "",
            modules: parsed.modules,
            tags: parsed.tags || [topic],
            published: false,
        });

        await newCourse.save();

        res.status(201).json({
            message: "✅ Course generated successfully using Gemini 2.5 Flash",
            course: newCourse,
        });
    } catch (error) {
        console.error("❌ Course Generation Error:", error);
        res.status(500).json({ error: "Failed to generate course", details: error.message });
    }
};

export const getPlaylistVideos = async (req, res) => {
    try {
        const { playlistUrl, title, description, category = "Other", level = "Beginner" } = req.body;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!playlistUrl)
            return res.status(400).json({ error: "Playlist URL is required" });
        if (!apiKey)
            return res.status(500).json({ error: "Missing YOUTUBE_API_KEY in .env" });

        // ─── Extract playlist ID ───────────────────────────────
        const idMatch = playlistUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
        const playlistId = idMatch ? idMatch[1] : playlistUrl;

        let nextPageToken = "";
        const videos = [];

        // ─── Fetch playlist videos (with snippet for title & thumbnails) ───
        do {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ""
                }`;

            const response = await axios.get(url);
            const items = response.data.items || [];

            for (const item of items) {
                const videoId = item.contentDetails?.videoId;
                if (videoId) {
                    videos.push({
                        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                        title: item.snippet?.title || `Lesson ${videos.length + 1}`,
                        thumbnail:
                            item.snippet?.thumbnails?.high?.url ||
                            item.snippet?.thumbnails?.default?.url ||
                            "",
                        description: item.snippet?.description || "",
                    });
                }
            }

            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

        if (videos.length === 0)
            return res.status(404).json({ error: "No videos found in this playlist" });

        // ─── Group videos: 3 per module ─────────────────────────
        const modules = [];
        let moduleCount = 0;

        for (let i = 0; i < videos.length; i += 3) {
            const chunk = videos.slice(i, i + 3);
            moduleCount++;

            const lessons = chunk.map((v, index) => ({
                title: v.title,
                videoUrl: v.videoUrl,
                content: v.description || "No description available.",
                duration: 10, // placeholder (can use YouTube videos.list API for real durations)
                order: index + 1,
            }));

            modules.push({
                title: `Module ${moduleCount}`,
                description: `Covers lessons ${i + 1} to ${i + chunk.length}.`,
                lessons,
                order: moduleCount,
            });
        }

        // ─── Build course object ───────────────────────────────
        const newCourse = new Course({
            title: title || `Course from YouTube Playlist`,
            description:
                description ||
                `Automatically created from playlist: ${playlistUrl}`,
            category,
            level,
            thumbnail: videos[0]?.thumbnail || "",
            modules,
            tags: ["YouTube", "AutoGenerated", category],
            published: false,
        });

        await newCourse.save();
        
        res.status(201).json({
            message: "✅ Course created successfully from playlist",
            totalVideos: videos.length,
            totalModules: modules.length,
            course: newCourse,
        });
    } catch (error) {
        console.error("❌ Error creating course from playlist:", error.message);
        res.status(500).json({ error: "Failed to create course from playlist" });
    }
};