import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Layers,
  Video,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
        const some=  await axios.post("http://localhost:5000/api/courses/user",course,{withCredentials:true})
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
    <div className="min-h-screen bg-gradient-to-b from-[#0B0B14] to-[#111827] text-white p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="flex justify-center items-center gap-3 mb-2">
          <BookOpen className="w-9 h-9 text-indigo-400 drop-shadow-glow" />
          <h1 className="text-4xl font-bold tracking-tight">
            Create a New Course
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Build your personalized learning experience with modules & lessons.
        </p>
      </motion.div>

      {/* Course Info */}
      <Card className="w-full max-w-5xl mx-auto bg-[#1C1F2A] border border-gray-700 shadow-lg hover:shadow-indigo-600/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-indigo-400 flex items-center gap-2">
            <Layers className="w-5 h-5" /> Course Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Course Title"
            className="bg-[#11141E] border-gray-700 text-white"
            value={course.title}
            onChange={(e) => updateCourse("title", e.target.value)}
          />
          <Textarea
            placeholder="Course Description"
            className="bg-[#11141E] border-gray-700 text-white"
            value={course.description}
            onChange={(e) => updateCourse("description", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              className="bg-[#11141E] border border-gray-700 text-gray-200 rounded-lg px-3 py-2"
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
              className="bg-[#11141E] border border-gray-700 text-gray-200 rounded-lg px-3 py-2"
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
      <div className="w-full max-w-5xl space-y-8 mt-10 mx-auto">
        {course.modules.map((module, modIndex) => (
          <motion.div
            key={modIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1C1F2A] rounded-xl border border-gray-700 p-5 shadow-md hover:shadow-indigo-600/10 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-400">
                <Layers className="w-5 h-5" /> Module {modIndex + 1}
              </h3>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeModule(modIndex)}
                className="bg-red-500/20 text-red-400 hover:bg-red-600/40"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <Input
              placeholder="Module Title"
              className="bg-[#11141E] border-gray-700 text-white"
              value={module.title}
              onChange={(e) =>
                updateModule(modIndex, "title", e.target.value)
              }
            />
            <Textarea
              placeholder="Module Description"
              className="mt-3 bg-[#11141E] border-gray-700 text-white"
              value={module.description}
              onChange={(e) =>
                updateModule(modIndex, "description", e.target.value)
              }
            />

            {/* Lessons Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-indigo-400 font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4" /> Lessons
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addLesson(modIndex)}
                  className="text-indigo-300 border-indigo-400/40 hover:bg-indigo-600/20"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Lesson
                </Button>
              </div>

              {module.lessons.map((lesson, lesIndex) => (
                <div
                  key={lesIndex}
                  className="bg-[#11141E] border border-gray-700 rounded-lg p-4 mt-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-sm text-indigo-300">
                      Lesson {lesIndex + 1}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLesson(modIndex, lesIndex)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Lesson Title"
                    className="bg-[#0D0F17] border-gray-700 text-white"
                    value={lesson.title}
                    onChange={(e) =>
                      updateLesson(modIndex, lesIndex, "title", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Video URL"
                    className="mt-2 bg-[#0D0F17] border-gray-700 text-white"
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
                    className="mt-2 bg-[#0D0F17] border-gray-700 text-white"
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
                    className="mt-2 bg-[#0D0F17] border-gray-700 text-white"
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
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" /> Add Module
          </Button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            <Send className="w-4 h-4" /> Create Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
