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

  const handleNextLesson = () => {
    if (!course) return;
    let foundNext = false;
    for (let i = 0; i < course.modules.length; i++) {
      const lessons = course.modules[i].lessons;
      for (let j = 0; j < lessons.length; j++) {
        if (lessons[j].videoUrl === activeVideo.videoUrl) {
          if (lessons[j + 1]) {
            setActiveVideo(lessons[j + 1]);
            fetchTranscript(lessons[j + 1].videoUrl);
          } else if (course.modules[i + 1]) {
            const nextMod = course.modules[i + 1];
            if (nextMod.lessons[0]) {
              setActiveVideo(nextMod.lessons[0]);
              fetchTranscript(nextMod.lessons[0].videoUrl);
            }
          }
          foundNext = true;
          break;
        }
      }
      if (foundNext) break;
    }
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
    <div className="p-6 lg:p-10 bg-background">
      {/* ─── Top Section ───────────────────────────── */}
      <div className="flex flex-col gap-3 mb-6">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground">{course.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> {course.category}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> {course.duration} hrs
          </span>
          <span className="font-medium">{course.level}</span>
        </div>

        <div className="mt-3">
          <Progress value={course.userProgress.progress} className="h-2" />
          <div className="flex justify-between text-xs mt-1">
            <span>Your Progress</span>
            <span className="font-medium text-primary">
              {course.userProgress.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* ─── Video + Sidebar Layout ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Video Player + Transcript */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg">
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
                <div className="h-[450px] flex justify-center items-center text-muted-foreground">
                  Select a lesson to begin
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript Section */}
          <Card className="border border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground max-h-[300px] overflow-y-auto whitespace-pre-line">
                {transcript}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Modules and Lessons */}
        <div className="space-y-4">
          {course.modules.map((mod: any, modIndex: number) => (
            <motion.div
              key={modIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: modIndex * 0.1 }}
            >
              <Card className="border border-primary/10 hover:border-primary/30 transition-all shadow-sm">
                <CardHeader
                  className="cursor-pointer flex flex-row justify-between items-center"
                  onClick={() =>
                    setExpandedModule(
                      expandedModule === modIndex ? null : modIndex
                    )
                  }
                >
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {expandedModule === modIndex ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {mod.title}
                  </CardTitle>
                </CardHeader>

                {expandedModule === modIndex && (
                  <CardContent className="space-y-2">
                    {mod.lessons.map((lesson: any, index: number) => (
                      <Button
                        key={index}
                        variant={
                          activeVideo?.videoUrl === lesson.videoUrl
                            ? "default"
                            : "outline"
                        }
                        className="w-full justify-between"
                        onClick={() => handleLessonSelect(lesson)}
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          <span>{lesson.title}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
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
        <div className="text-center mt-8">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-primary font-semibold text-lg">
            🎉 Congratulations! You’ve completed this course!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyGround;
