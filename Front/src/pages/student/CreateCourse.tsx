import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Layers,
  Video,
  Plus,
  Trash2,
  Send,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackButton from "@/components/BackButton";
import { palette } from "@/theme/palette";

// Extended palette with status colors
const extendedPalette = {
  ...palette,
  success: "#10B981",
  warning: "#F59E0B",
  destructive: "#EF4444",
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
};


const CreateCourse = () => {
  const navigate=useNavigate()
  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "Other",
    level: "Beginner",
    modules: [],
  });

  // ─── HANDLERS ───────────────────────────────
  const addModule = () =>
    setCourse((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        { title: "", description: "", lessons: [] },
      ],
    }));

  const removeModule = (i) =>
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== i),
    }));

  const addLesson = (modIndex) => {
    const updated = [...course.modules];
    updated[modIndex].lessons.push({
      title: "",
      videoUrl: "",
      content: "",
      duration: "",
    });
    setCourse({ ...course, modules: updated });
  };

  const removeLesson = (modIndex, lesIndex) => {
    const updated = [...course.modules];
    updated[modIndex].lessons = updated[modIndex].lessons.filter(
      (_, i) => i !== lesIndex
    );
    setCourse({ ...course, modules: updated });
  };

  const updateCourse = (key, val) =>
    setCourse((prev) => ({ ...prev, [key]: val }));

  const updateModule = (i, key, val) => {
    const updated = [...course.modules];
    updated[i][key] = val;
    setCourse({ ...course, modules: updated });
  };

  const updateLesson = (modIndex, lesIndex, key, val) => {
    const updated = [...course.modules];
    updated[modIndex].lessons[lesIndex][key] = val;
    setCourse({ ...course, modules: updated });
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    console.log("🎓 Course Created:", course);
    // Api Calling and Navigating Twoards My Learning to the User
      try{
        const some=  await axios.post("http://localhost:5000/api/courses/user",course,{withCredentials:true})
        console.log("The Data i am getting",some)
        navigate(-1)
        toast({ description: "✅ Course created successfully!" });
      }catch(err){
        console.error("Course creation error:", err);
        toast({ description: "❌ Failed to create course. Please try again." });
      }
  };

  // ─── UI ───────────────────────────────
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: extendedPalette.bg }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-10"
      >
        <div className="mb-4 sm:mb-6  max-w-5xl mx-auto">
          <BackButton to="/student/courses" label="Back to Courses" />
        </div>
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 sm:w-9 sm:h-9" style={{ color: extendedPalette.text }} />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: extendedPalette.text }}>
              Create a New Course
            </h1>
          </div>
          <p className="text-sm sm:text-lg" style={{ color: extendedPalette.text2 }}>
            Build your personalized learning experience with modules & lessons.
          </p>
        </div>
      </motion.div>

      {/* Course Info */}
      <Card 
            className="w-full max-w-5xl mx-auto shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: extendedPalette.card, border: `1px solid ${extendedPalette.border}` }}
        >
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2" style={{ color: extendedPalette.text }}>
            <Layers className="w-5 h-5" style={{ color: extendedPalette.accentDeep }} /> Course Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Course Title"
            className="focus:ring-0 transition-all text-sm sm:text-base"
            style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
            value={course.title}
            onChange={(e) => updateCourse("title", e.target.value)}
          />
          <Textarea
            placeholder="Course Description"
            className="focus:ring-0 transition-all text-sm sm:text-base"
            style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
            value={course.description}
            onChange={(e) => updateCourse("description", e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-0 transition-all"
              style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
              value={course.category}
              onChange={(e) => updateCourse("category", e.target.value)}
            >
              <option>Programming</option>
              <option>AI/ML</option>
              <option>Web Development</option>
              <option>Data Science</option>
              <option>Design</option>
              <option>Other</option>
            </select>
            <select
              className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-0 transition-all"
              style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
              value={course.level}
              onChange={(e) => updateCourse("level", e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Modules Section */}
      <div className="w-full max-w-5xl space-y-4 sm:space-y-8 mt-6 sm:mt-10 mx-auto">
        {course.modules.map((module, modIndex) => (
          <motion.div
            key={modIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300"
                style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold" style={{ color: extendedPalette.text }}>
                <Layers className="w-5 h-5" style={{ color: extendedPalette.accentDeep }} /> Module {modIndex + 1}
              </h3>
              <Button
                size="sm"
                onClick={() => removeModule(modIndex)}
                className="text-sm border"
                style={{ 
                    backgroundColor: extendedPalette.dangerSoft, 
                    color: extendedPalette.danger, 
                    borderColor: extendedPalette.danger,
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = extendedPalette.dangerSoft + 'CC'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = extendedPalette.dangerSoft}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <Input
              placeholder="Module Title"
              className="focus:ring-0 transition-all text-sm sm:text-base"
              style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
              value={module.title}
              onChange={(e) =>
                updateModule(modIndex, "title", e.target.value)
              }
            />
            <Textarea
              placeholder="Module Description"
              className="mt-3 focus:ring-0 transition-all text-sm sm:text-base"
              style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
              value={module.description}
              onChange={(e) =>
                updateModule(modIndex, "description", e.target.value)
              }
            />

            {/* Lessons Section */}
            <div className="mt-6 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: extendedPalette.bg, border: `1px solid ${extendedPalette.border}` }}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: extendedPalette.text }}>
                  <Video className="w-4 h-4" style={{ color: extendedPalette.accent }} /> Lessons
                </h4>
                <Button
                  size="sm"
                  onClick={() => addLesson(modIndex)}
                  className="text-xs sm:text-sm border"
                  style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border, color: extendedPalette.text2 }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = extendedPalette.cardHover}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = extendedPalette.card}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Lesson
                </Button>
              </div>

              {module.lessons.map((lesson, lesIndex) => (
                <div
                  key={lesIndex}
                  className="border rounded-lg p-3 sm:p-4 mt-3 space-y-2"
                    style={{ backgroundColor: extendedPalette.card, borderColor: extendedPalette.border }}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-xs sm:text-sm" style={{ color: extendedPalette.text }}>
                      Lesson {lesIndex + 1}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLesson(modIndex, lesIndex)}
                      className="text-xs sm:text-sm"
                        style={{ color: extendedPalette.danger, backgroundColor: 'transparent' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = extendedPalette.dangerSoft}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Lesson Title"
                    className="focus:ring-0 transition-all text-sm"
                    style={{ backgroundColor: extendedPalette.cardHover, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
                    value={lesson.title}
                    onChange={(e) =>
                      updateLesson(modIndex, lesIndex, "title", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Video URL"
                    className="mt-2 focus:ring-0 transition-all text-sm"
                    style={{ backgroundColor: extendedPalette.cardHover, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
                    value={lesson.videoUrl}
                    onChange={(e) =>
                      updateLesson(
                        modIndex,
                        lesIndex,
                        "videoUrl",
                        e.target.value
                      )
                    }
                  />
                  <Textarea
                    placeholder="Lesson Content"
                    className="mt-2 focus:ring-0 transition-all text-sm"
                    style={{ backgroundColor: extendedPalette.cardHover, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
                    value={lesson.content}
                    onChange={(e) =>
                      updateLesson(
                        modIndex,
                        lesIndex,
                        "content",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    className="mt-2 focus:ring-0 transition-all text-sm"
                    style={{ backgroundColor: extendedPalette.cardHover, borderColor: extendedPalette.border, color: extendedPalette.text, outlineColor: extendedPalette.accent }}
                    value={lesson.duration}
                    onChange={(e) =>
                      updateLesson(
                        modIndex,
                        lesIndex,
                        "duration",
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Add Module Button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={addModule}
            className="flex items-center gap-2 shadow-lg px-6 py-2"
            style={{ background: extendedPalette.accent, color: extendedPalette.card }}
            onMouseEnter={(e) => e.currentTarget.style.background = extendedPalette.accentDeep}
            onMouseLeave={(e) => e.currentTarget.style.background = extendedPalette.accent}
          >
            <Plus className="w-4 h-4" /> Add Module
          </Button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 rounded-lg shadow-lg"
            style={{ background: extendedPalette.accentDeep, color: extendedPalette.card }}
            onMouseEnter={(e) => e.currentTarget.style.background = extendedPalette.accent}
            onMouseLeave={(e) => e.currentTarget.style.background = extendedPalette.accentDeep}
          >
            <Send className="w-4 h-4" /> Create Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;