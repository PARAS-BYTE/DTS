import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
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

  useEffect(() => {
    gsap.from(".nova-title", {
      opacity: 0,
      y: -40,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20">
      {/* ─── Header ───────────────────────────── */}
      <motion.div
        className="py-16 space-y-4 nova-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-6 px-8">
          <BackButton to="/student/courses" label="Back to Courses" />
        </div>
        <div className="text-center">
          <div className="flex justify-center items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
            >
              <Brain className="w-12 h-12 text-black" />
            </motion.div>
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Nova Course Creator
            </h1>
          </div>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed mt-4">
            Create immersive, structured courses on{" "}
            <span className="text-black font-semibold">any topic</span> —
            art, finance, cooking, science, or anything else — powered by Gemini
            AI.
          </p>
        </div>
      </motion.div>

      {/* ─── Input Section ───────────────────────────── */}
      <motion.div
        className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black text-xl">
            <Sparkles className="w-5 h-5" /> Generate a New Course
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Input
            placeholder="Enter your course topic (e.g., 'Astrophysics for Curious Minds', 'Vegan Cooking Basics')"
            className="bg-white border-gray-300 text-black focus:border-black focus:ring-black/20"
            value={form.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
          />

          {/* ─── Category Dropdown ───────────────── */}
          <div className="relative">
            <button
              onClick={() => setCategoryOpen((p) => !p)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex justify-between items-center hover:border-black transition-all text-black"
            >
              <span>{form.category}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  categoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {categoryOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 bg-white border border-gray-200 mt-1 rounded-lg shadow-lg w-full overflow-hidden max-h-60 overflow-y-auto"
              >
                {categories.map((c, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      handleChange("category", c);
                      setCategoryOpen(false);
                      setShowCustom(c === "Other");
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 transition-all text-black ${
                      c === form.category ? "bg-black/5" : ""
                    }`}
                  >
                    {c}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          {showCustom && (
            <Input
              placeholder="Enter custom category name"
              className="bg-white border-gray-300 text-black focus:border-black focus:ring-black/20"
              value={form.customCategory}
              onChange={(e) => handleChange("customCategory", e.target.value)}
            />
          )}

          {/* ─── Level Dropdown ───────────────── */}
          <div className="relative">
            <button
              onClick={() => setLevelOpen((p) => !p)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex justify-between items-center hover:border-black transition-all text-black"
            >
              <span>{form.level}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  levelOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {levelOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 bg-white border border-gray-200 mt-1 rounded-lg shadow-lg w-full"
              >
                {levels.map((l, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      handleChange("level", l);
                      setLevelOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 transition-all text-black ${
                      l === form.level ? "bg-black/5" : ""
                    }`}
                  >
                    {l}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg shadow-black/20 hover:shadow-black/30"
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-12"
        >
          <Loader2 className="w-12 h-12 animate-spin text-black" />
        </motion.div>
      )}

      {course && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto mt-14 bg-white border border-gray-200 rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-3xl font-bold text-black mb-2">
            {course.title}
          </h2>
          <p className="text-gray-700 mb-4">{course.description}</p>
          <p className="text-sm text-gray-600 mb-6">
            Category: {course.category} • Level: {course.level} • Duration:{" "}
            {course.duration} hrs
          </p>

          {course.modules?.map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6"
            >
              <h3 className="text-xl font-semibold text-black flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5" /> Module {i + 1}: {mod.title}
              </h3>
              <p className="text-gray-600 mb-3">{mod.description}</p>
              <ul className="ml-5 space-y-1">
                {mod.lessons?.map((lesson, j) => (
                  <li key={j} className="text-gray-700 text-sm">
                    <span className="text-black">•</span>{" "}
                    {lesson.title} — {lesson.duration} min
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => toast({ description: "✨ Course saved successfully!" })}
              className="bg-black hover:bg-gray-800 text-white flex items-center gap-2 px-5 py-2 shadow-lg shadow-black/20 hover:shadow-black/30"
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
