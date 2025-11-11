import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // ─── Identity ───────────────────────────────
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },

    // ─── Learning Progress ───────────────────────
    xp: { type: Number, default: 0 },
    weeklyXP: { type: Number, default: 0 }, // new → for "+250 this week"
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    personalBestStreak: { type: Number, default: 0 }, // new
    totalStudyTime: { type: Number, default: 0 }, // minutes
    masteryScore: { type: Number, default: 0 },
    focusScore: { type: Number, default: 0 },
    accuracyScore: { type: Number, default: 0 },

    // ─── Charts / History (Dashboard visuals) ────
    last7DaysStudy: [
      {
        day: String, // e.g., 'Mon'
        hours: Number,
      },
    ],
    xpHistory: [
      {
        week: String, // e.g., 'W1'
        xp: Number,
      },
    ],

    // ─── Calendar & Tasks ────────────────────────
    calendarData: [
        {
          taskId: String,
          title: String,
          description: String,
          date: { type: Date, default: Date.now },
          status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
          },
          type: { type: String, default: "task" },
          category: { type: String, default: "General" },
          priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
          },
        },
      ],
    upcomingTasks: [
      {
        title: String,
        dueDate: Date,
        course: String,
        type: String,
      },
    ],
    completedTasks: [{ taskId: String, completedAt: Date }],

    // ─── Courses & Progress ──────────────────────
    enrolledCourses: [
      {
        courseId: { type: Schema.Types.ObjectId, ref: "Course" },
        title: String, // optional frontend display
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        lastAccessed: { type: Date, default: Date.now },
      },
    ],
    quizAttempts: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        resultData: { type: Object, required: true }, // ✅ store entire frontend-style result
        attemptDate: { type: Date, default: Date.now },
      },
    ],
    assignments: [
      {
        assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment" },
        submittedAt: Date,
        grade: Number,
        feedback: String,
      },
    ],

    // ─── Gamification ────────────────────────────
    currentRank: { type: String, default: "Bronze" },
    rankPercentile: { type: Number, default: 100 }, // for “Top 15% globally”
    coins: { type: Number, default: 0 },
    badges: [
      {
        badgeId: { type: Schema.Types.ObjectId, ref: "Badge" },
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    // ─── AI & Personalization ────────────────────
    learningPreferences: {
      pace: { type: String, default: "moderate" },
      preferredTopics: [String],
      weakAreas: [String],
    },
    aiTwinProfile: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    // ─── Analytics & Reports ─────────────────────
    lastLogin: { type: Date, default: Date.now },
    notifications: [
      {
        title: String,
        message: String,
        type: String,
        createdAt: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],
    reports: [
      {
        weekStart: Date,
        insights: String,
        progressChange: Number,
      },
    ],
  },
  { timestamps: true }
);

//
// ─── PASSWORD HASHING ───────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//
// ─── METHODS ────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.addXP = function (amount) {
  this.xp += amount;
  this.weeklyXP += amount;
  const threshold = this.level * 100;
  if (this.xp >= threshold) {
    this.level += 1;
    this.xp -= threshold;
  }
};

userSchema.methods.updateStreak = function (activeToday) {
  if (activeToday) {
    this.streakDays += 1;
    if (this.streakDays > this.personalBestStreak)
      this.personalBestStreak = this.streakDays;
  } else {
    this.streakDays = 0;
  }
};

userSchema.methods.awardBadge = function (badgeId) {
  const alreadyEarned = this.badges.some(
    (b) => b.badgeId.toString() === badgeId.toString()
  );
  if (!alreadyEarned) this.badges.push({ badgeId });
};

userSchema.methods.addCalendarTask = function (taskData) {
  this.calendarData.push(taskData);
};

userSchema.methods.recordCompletion = function (taskId) {
  const task = this.calendarData.find((t) => t.taskId === taskId);
  if (task) task.status = "completed";
  this.completedTasks.push({ taskId, completedAt: new Date() });
};

userSchema.methods.updateAIProfile = function (feedback) {
  for (const [key, value] of Object.entries(feedback)) {
    this.aiTwinProfile.set(key, value);
  }
};

// ─── Dashboard Summary (for frontend API) ────────────
userSchema.methods.getDashboardSummary = function () {
  return {
    _id: this._id,
    name: this.username,
    email: this.email,
    xp: this.xp,
    weeklyXP: this.weeklyXP,
    level: this.level,
    streak: this.streakDays,
    personalBestStreak: this.personalBestStreak,
    masteryScore: this.masteryScore,
    focusScore: this.focusScore,
    accuracyScore: this.accuracyScore,
    rank: this.currentRank,
    rankPercentile: this.rankPercentile,
    coins: this.coins,
    badges: this.badges.length,
    upcomingTasks: this.upcomingTasks.slice(0, 5),
    courses: this.enrolledCourses.map((c) => ({
      title: c.title,
      progress: c.progress,
      completed: c.completed,
    })),
    last7DaysStudy: this.last7DaysStudy,
    xpHistory: this.xpHistory,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
