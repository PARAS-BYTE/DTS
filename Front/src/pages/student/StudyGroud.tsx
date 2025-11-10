import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const StudyGround = () => {
  const { state: courseId } = useLocation();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [transcript, setTranscript] = useState<string>("");

  // ─── Fetch Course Data ───────────────────────────────
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

  useEffect(() => {
    fetchCourse();
  }, []);

  // ─── Fetch Transcript from Backend ────────────────────────
  const fetchTranscript = async (videoUrl: string) => {
    try {
      setTranscript("Loading transcript...");
      const { data } = await axios.post(
        "http://localhost:5000/trans",
        { videoUrl },
        { withCredentials: true }
      );

      setTranscript(data.transcript || "Transcript not available.");
    } catch (err) {
      console.error("⚠️ Transcript Fetch Error:", err);
      setTranscript("Transcript unavailable for this video.");
    }
  };

  // ─── When user selects another lesson ─────────────────────
  const handleLessonSelect = (lesson: any) => {
    setActiveVideo(lesson);
    fetchTranscript(lesson.videoUrl);
  };

  // ─── Move to next lesson ─────────────────────────────
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
    <div className="p-8 space-y-8">
      {/* ─── Header Info ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="lg:w-1/3">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full rounded-2xl shadow-lg object-cover"
          />
        </div>

        <div className="lg:w-2/3 space-y-4">
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground text-lg">{course.description}</p>

          <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> {course.category}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> {course.duration} hrs
            </div>
            <span className="font-medium">{course.level}</span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Progress</span>
              <span className="font-medium text-primary">
                {course.userProgress.progress}%
              </span>
            </div>
            <Progress value={course.userProgress.progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* ─── Main Learning Area ───────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Video Player Section */}
        <Card className="lg:w-2/3 border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl flex justify-between items-center">
              <span>{activeVideo?.title || "Select a Lesson"}</span>
              {activeVideo && (
                <Button
                  onClick={handleNextLesson}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {activeVideo ? (
              <div>
                <div className="aspect-video rounded-xl overflow-hidden bg-black mb-4">
                  <iframe
                    src={activeVideo.videoUrl.replace("watch?v=", "embed/")}
                    title={activeVideo.title}
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>

                {/* Transcript Section */}
                <div className="p-4 bg-muted/30 rounded-lg max-h-[350px] overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-2 text-primary">
                    Transcript
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {transcript}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[400px] text-muted-foreground">
                Select a lesson to start learning
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar: Modules + Lessons */}
        <div className="lg:w-1/3 space-y-4">
          {course.modules.map((mod: any, modIndex: number) => (
            <motion.div
              key={modIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: modIndex * 0.1 }}
            >
              <Card className="border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader
                  className="cursor-pointer flex flex-row justify-between items-center"
                  onClick={() =>
                    setExpandedModule(
                      expandedModule === modIndex ? null : modIndex
                    )
                  }
                >
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
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
                        className="justify-between w-full"
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

      {/* ─── Completion Info ─────────────────────────── */}
      {course.userProgress.completed && (
        <div className="text-center py-6">
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