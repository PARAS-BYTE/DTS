import asyncHandler from "express-async-handler";
import Quiz from "../Models/Quiz.js";
import User from "../Models/User.js";
import Course from "../Models/Course.js";

//
// ─── GET ALL QUIZZES ───────────────────────────────────────────────
// @route   GET /api/quizzes
// @access  Public
//
export const getAllQuizzes = asyncHandler(async (req, res) => {
  const { category, level, search } = req.query;
  const query = {};

  if (category) query.category = category;
  if (level) query.level = level;
  if (search) query.title = { $regex: search, $options: "i" };

  try {
    const quizzes = await Quiz.find(query)
      .select("title description category level totalMarks timeLimit averageScore course")
      .populate("course", "title")
      .populate("createdBy", "username email");

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Get Quizzes Error:", error.message);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
});

//
// ─── GET QUIZ BY ID ───────────────────────────────────────────────
// @route   GET /api/quizzes/:id
// @access  Private (Student/Admin)
//
export const getQuizById = asyncHandler(async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("course", "title category")
      .populate("createdBy", "username email");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error("Get Quiz Error:", error.message);
    res.status(500).json({ message: "Failed to fetch quiz details" });
  }
});

//
// ─── CREATE QUIZ ───────────────────────────────────────────────
// @route   POST /api/quizzes
// @access  Private (Admin/Instructor)
//
export const createQuiz = asyncHandler(async (req, res) => {
  try {
    const { title, description, category, level, course, timeLimit, passingPercentage, questions } =
      req.body;

    if (!title || !course || !questions?.length) {
      return res.status(400).json({ message: "Title, course, and questions are required" });
    }

    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ message: "Course not found" });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      level,
      course,
      timeLimit,
      passingPercentage,
      questions,
      createdBy: req.user._id,
    });

    // Add to course reference
    courseExists.quizzes.push({ quizId: quiz._id });
    await courseExists.save();

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error("Create Quiz Error:", error.message);
    res.status(500).json({ message: "Failed to create quiz" });
  }
});

//
// ─── UPDATE QUIZ ───────────────────────────────────────────────
// @route   PUT /api/quizzes/:id
// @access  Private (Admin/Instructor)
//
export const updateQuiz = asyncHandler(async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this quiz" });
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    res.status(200).json({ message: "Quiz updated successfully", quiz });
  } catch (error) {
    console.error("Update Quiz Error:", error.message);
    res.status(500).json({ message: "Failed to update quiz" });
  }
});

//
// ─── DELETE QUIZ ───────────────────────────────────────────────
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin/Instructor)
//
export const deleteQuiz = asyncHandler(async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this quiz" });
    }

    await quiz.deleteOne();

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete Quiz Error:", error.message);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
});

//
// ─── GET QUIZZES OF A COURSE ─────────────────────────────────────
// @route   GET /api/quizzes/course/:courseId
// @access  Public
//
export const getQuizzesByCourse = asyncHandler(async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId })
      .select("title description level totalMarks timeLimit averageScore published")
      .populate("course", "title category");

    if (!quizzes.length) {
      return res.status(404).json({ message: "No quizzes found for this course" });
    }

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Get Quizzes By Course Error:", error.message);
    res.status(500).json({ message: "Failed to fetch course quizzes" });
  }
});

//
// ─── ATTEMPT QUIZ (AUTO SCORING) ─────────────────────────────────
// @route   POST /api/quizzes/:id/attempt
// @access  Private (Student)
//
export const attemptQuiz = asyncHandler(async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, selectedOptions[] }
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers must be provided as an array" });
    }

    let score = 0;
    let correctCount = 0;

    quiz.questions.forEach((q) => {
      const submitted = answers.find((a) => a.questionId === q._id.toString());
      if (!submitted) return;

      // For single/multiple choice
      const correctOptions = q.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.text.toLowerCase().trim());
      const selectedOptions = submitted.selectedOptions.map((opt) =>
        opt.toLowerCase().trim()
      );

      const isCorrect =
        correctOptions.length === selectedOptions.length &&
        correctOptions.every((val) => selectedOptions.includes(val));

      if (isCorrect) {
        score += q.marks;
        correctCount++;
      }
    });

    // Record attempt in quiz
    quiz.recordAttempt(req.user._id, score, correctCount);
    await quiz.save();

    // Record attempt in user
    const user = await User.findById(req.user._id);
    user.quizAttempts.push({
      quizId: quiz._id,
      score,
      accuracy: (correctCount / quiz.questions.length) * 100,
    });
    await user.save();

    const percentage = (score / quiz.totalMarks) * 100;
    const passed = percentage >= quiz.passingPercentage;

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      percentage,
      passed,
    });
  } catch (error) {
    console.error("Attempt Quiz Error:", error.message);
    res.status(500).json({ message: "Server error while submitting quiz" });
  }
});
