import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
// Removed: import gsap from "gsap"; // Animation removed
import {
  Brain,
  Sparkles,
  Loader2,
  Send,
  Layers,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/BackButton";
import { palette } from "@/theme/palette";

const NovaCourseGenerator = () => {
  const [form, setForm] = useState({
    topic: "",
    level: "Beginner",
    category: "General",
    customCategory: "",
  });
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);

  const categories = [
    "General",
    "Technology",
    "Health & Fitness",
    "Business",
    "Music & Art",
    "Science",
    "Psychology",
    "Self-Development",
    "Cooking",
    "History",
    "Finance",
    "Other",
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];

  // Removed useEffect with gsap animation

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      toast({ description: "⚠️ Please enter a topic first!" });
      return;
    }

    const category =
      form.category === "Other" && form.customCategory
        ? form.customCategory
        : form.category;

    setLoading(true);
    setCourse(null);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/courses/aigen",
        { ...form, category },
        { withCredentials: true }
      );
      setCourse(data.course);
      toast({ description: "🎓 Course generated successfully!" });
    } catch (err) {
      console.error(err);
      toast({ description: "❌ Failed to generate course." });
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (l) => {
    handleChange("level", l);
    setLevelOpen(false);
  };

  const handleCategoryChange = (c) => {
    handleChange("category", c);
    setCategoryOpen(false);
    setShowCustom(c === "Other");
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: palette.bg }}
    >
      {/* ─── Header ───────────────────────────── */}
      <div
        className=" sm:py-8 px-5 space-y-4"
        // Removed motion.div wrapper from header
      >
        <div className="mb-6 max-w-7xl mx-auto">
          <BackButton to="/student/courses" label="Back to Courses" />
        </div>
        <div className="text-center">
          <div className="flex justify-center items-center gap-3">
            <div
              // Removed motion.div wrapper for Brain icon animation
            >
              <Brain className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: palette.text }} />
            </div>
            <h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight"
              style={{ color: palette.text }}
            >
              Nova Course Creator
            </h1>
          </div>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mt-4"
            style={{ color: palette.text2 }}
          >
            Create immersive, structured courses on{" "}
            <span style={{ color: palette.text, fontWeight: '600' }}>any topic</span> —
            art, finance, cooking, science, or anything else — powered by Gemini
            AI.
          </p>
        </div>
      </div>

      {/* ─── Input Section ───────────────────────────── */}
      <motion.div
        className="max-w-4xl mx-auto rounded-2xl shadow-xl p-6 sm:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}` }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl" style={{ color: palette.text }}>
            <Sparkles className="w-5 h-5" style={{ color: palette.accentDeep }} /> Generate a New Course
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Input
            placeholder="Enter your course topic (e.g., 'Astrophysics for Curious Minds', 'Vegan Cooking Basics')"
            className="focus:ring-0 focus:border-opacity-70"
            style={{ backgroundColor: palette.card, borderColor: palette.border, color: palette.text, outline: 'none' }}
            value={form.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
          />

          {/* ─── Category Dropdown ───────────────── */}
          <div className="relative z-30">
            <button
              onClick={() => setCategoryOpen((p) => !p)}
              className="w-full rounded-lg px-4 py-2 text-left flex justify-between items-center transition-all"
              style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}`, color: palette.text }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = palette.accent}
              onMouseOut={(e) => e.currentTarget.style.borderColor = palette.border}
            >
              <span className="text-sm sm:text-base">{form.category}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform`}
                style={{ transform: categoryOpen ? "rotate(180deg)" : "rotate(0deg)", color: palette.text2 }}
              />
            </button>
            {categoryOpen && (
              <div
                // Changed motion.ul to div to reduce unnecessary animation
                className="absolute z-40 mt-1 rounded-lg shadow-lg w-full overflow-hidden max-h-60 overflow-y-auto"
                style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}` }}
              >
                {categories.map((c, i) => (
                  <li
                    key={i}
                    onClick={() => handleCategoryChange(c)}
                    className={`px-4 py-2 cursor-pointer transition-all text-sm sm:text-base list-none`}
                    style={{ color: palette.text, backgroundColor: c === form.category ? palette.bg : palette.card }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = palette.cardHover}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = c === form.category ? palette.bg : palette.card}
                  >
                    {c}
                  </li>
                ))}
              </div>
            )}
          </div>

          {showCustom && (
            <Input
              placeholder="Enter custom category name"
              className="focus:ring-0 focus:border-opacity-70"
              style={{ backgroundColor: palette.card, borderColor: palette.border, color: palette.text, outline: 'none' }}
              value={form.customCategory}
              onChange={(e) => handleChange("customCategory", e.target.value)}
            />
          )}

          {/* ─── Level Dropdown ───────────────── */}
          <div className="relative z-20">
            <button
              onClick={() => setLevelOpen((p) => !p)}
              className="w-full rounded-lg px-4 py-2 text-left flex justify-between items-center transition-all"
              style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}`, color: palette.text }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = palette.accent}
              onMouseOut={(e) => e.currentTarget.style.borderColor = palette.border}
            >
              <span className="text-sm sm:text-base">{form.level}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform`}
                style={{ transform: levelOpen ? "rotate(180deg)" : "rotate(0deg)", color: palette.text2 }}
              />
            </button>
            {levelOpen && (
              <div
                // Changed motion.ul to div to reduce unnecessary animation
                className="absolute z-30 mt-1 rounded-lg shadow-lg w-full"
                style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}` }}
              >
                {levels.map((l, i) => (
                  <li
                    key={i}
                    onClick={() => handleLevelChange(l)}
                    className={`px-4 py-2 cursor-pointer transition-all text-sm sm:text-base list-none`}
                    style={{ color: palette.text, backgroundColor: l === form.level ? palette.bg : palette.card }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = palette.cardHover}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = l === form.level ? palette.bg : palette.card}
                  >
                    {l}
                  </li>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 font-semibold px-6 py-2 rounded-lg shadow-lg"
              style={{ backgroundColor: palette.accentDeep, color: palette.card, boxShadow: `0 4px 6px -1px ${palette.accentDeep}33` }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = palette.accent}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = palette.accentDeep}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Generate Course
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </motion.div>

      {/* ─── Generated Course ───────────────── */}
      {loading && (
        <div
          // Simplified loading animation wrapper
          className="flex justify-center mt-12"
        >
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: palette.text }} />
        </div>
      )}

      {course && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto mt-14 rounded-2xl p-6 sm:p-8 shadow-xl"
          style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}` }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: palette.text }}>
            {course.title}
          </h2>
          <p style={{ color: palette.text2 }} className="mb-4">
            {course.description}
          </p>
          <p className="text-sm mb-6" style={{ color: palette.text2 }}>
            Category: <span style={{ color: palette.text }}>{course.category}</span> • Level: <span style={{ color: palette.text }}>{course.level}</span> • Duration:{" "}
            <span style={{ color: palette.text }}>{course.duration} hrs</span>
          </p>

          {course.modules?.map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} // Subtle motion remaining
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className="rounded-xl p-5 mb-6"
              style={{ backgroundColor: palette.bg, border: `1px solid ${palette.border}` }}
            >
              <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-2" style={{ color: palette.text }}>
                <Layers className="w-5 h-5" style={{ color: palette.accentDeep }} /> Module {i + 1}: {mod.title}
              </h3>
              <p style={{ color: palette.text2 }} className="mb-3">
                {mod.description}
              </p>
              <ul className="ml-5 space-y-1 list-disc" style={{ color: palette.text2 }}>
                {mod.lessons?.map((lesson, j) => (
                  <li key={j} className="text-sm">
                    {lesson.title} — {lesson.duration} min
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => toast({ description: "✨ Course saved successfully!" })}
              className="flex items-center gap-2 px-5 py-2 shadow-lg"
              style={{ backgroundColor: palette.accentDeep, color: palette.card, boxShadow: `0 4px 6px -1px ${palette.accentDeep}33` }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = palette.accent}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = palette.accentDeep}
            >
              <Lightbulb className="w-4 h-4" /> Save Course
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NovaCourseGenerator;