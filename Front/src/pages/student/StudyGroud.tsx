import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StudyGround = () => {
  const { state: courseId } = useLocation();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [transcript, setTranscript] = useState<string>("");

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:5000/api/courses/getsingle",
        { courseId },
        { withCredentials: true }
      );
      setCourse(data);

      const firstLesson = data.modules[0]?.lessons[0];
      if (firstLesson) {
        setActiveVideo(firstLesson);
        fetchTranscript(firstLesson.videoUrl);
      }
    } catch (err) {
      console.error("❌ Fetch Course Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscript = async (videoUrl: string) => {
    try {
      setTranscript("Loading transcript...");
      const { data } = await axios.post("http://localhost:5000/trans", {
        videoUrl,
      });
      setTranscript(data.transcript || "Transcript not available.");
    } catch (err) {
      console.error("⚠️ Transcript Fetch Error:", err);
      setTranscript("Transcript unavailable for this video.");
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const handleLessonSelect = (lesson: any) => {
    setActiveVideo(lesson);
    fetchTranscript(lesson.videoUrl);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-muted-foreground">
        Loading course...
      </div>
    );

  if (!course)
    return (
      <div className="flex justify-center items-center h-[80vh] text-destructive">
        Course not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 lg:p-10">
      {/* ─── Top Section ───────────────────────────── */}
      <div className="flex flex-col gap-3 mb-6 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white">{course.title}</h1>
        <p className="text-gray-400">{course.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" /> {course.category}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" /> {course.duration} hrs
          </span>
          <span className="text-purple-400 font-medium">{course.level}</span>
        </div>

        <div className="mt-3">
          <Progress value={course.userProgress.progress} className="h-2" />
          <div className="flex justify-between text-xs mt-1 text-gray-400">
            <span>Your Progress</span>
            <span className="font-medium text-blue-400">
              {course.userProgress.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* ─── Course Layout: Video + Sidebar ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Video + Transcript Section */}
        <div className="space-y-6">
          {/* Video Player */}
          <Card className="border-none shadow-xl bg-gray-900/60 backdrop-blur-md">
            <CardContent className="p-0">
              {activeVideo ? (
                <div className="rounded-xl overflow-hidden">
                  <iframe
                    src={activeVideo.videoUrl.replace("watch?v=", "embed/")}
                    title={activeVideo.title}
                    allowFullScreen
                    className="w-full h-[450px]"
                  ></iframe>
                </div>
              ) : (
                <div className="h-[450px] flex justify-center items-center text-gray-500">
                  Select a lesson to begin
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card className="border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-400">
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed text-gray-300 max-h-[300px] overflow-y-auto whitespace-pre-line scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {transcript}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Sidebar (Scrollable Modules List) ───────────────────────────── */}
        <div className="lg:h-[calc(100vh-180px)] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {course.modules.map((mod: any, modIndex: number) => (
            <motion.div
              key={modIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: modIndex * 0.05 }}
            >
              <Card className="border border-gray-800 bg-gray-900/50 hover:border-blue-500/40 transition-all duration-200">
                <CardHeader
                  className="cursor-pointer flex flex-row justify-between items-center p-4"
                  onClick={() =>
                    setExpandedModule(
                      expandedModule === modIndex ? null : modIndex
                    )
                  }
                >
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                    {expandedModule === modIndex ? (
                      <ChevronDown className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    {mod.title}
                  </CardTitle>
                </CardHeader>

                {expandedModule === modIndex && (
                  <CardContent className="space-y-2 pt-2">
                    {mod.lessons.map((lesson: any, index: number) => (
                      <Button
                        key={index}
                        variant={
                          activeVideo?.videoUrl === lesson.videoUrl
                            ? "default"
                            : "outline"
                        }
                        className={`w-full justify-between text-left text-sm ${
                          activeVideo?.videoUrl === lesson.videoUrl
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                        }`}
                        onClick={() => handleLessonSelect(lesson)}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Play className="w-4 h-4" />
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {lesson.duration} mins
                        </span>
                      </Button>
                    ))}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Completion Banner ───────────────────────────── */}
      {course.userProgress.completed && (
        <div className="text-center mt-10 p-6 bg-green-900/20 rounded-xl border border-green-700/40">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-green-400 font-semibold text-lg">
            Congratulations! You’ve completed this course!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyGround;
