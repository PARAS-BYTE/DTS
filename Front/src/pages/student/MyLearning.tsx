import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Clock,
  Search,
  CheckCircle2,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";

const MyLearning = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCourse, setActiveCourse] = useState<any | null>(null);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [courseLoading, setCourseLoading] = useState(false);
  const navigate = useNavigate();
    // ─── Fetch Enrolled Courses ───────────────────────────────
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching Enrolled Courses...");

      const { data } = await axios.get(
        "http://localhost:5000/api/courses/my",
        { withCredentials: true }
      );

      console.log("✅ Received:", data);
      setCourses(data);
    } catch (err: any) {
      console.error("❌ My Courses Fetch Error:", err);
      setError("Failed to load your courses.");
    } finally {
      setLoading(false);
    }
  };

  const isYouTubeUrl = (url: string) =>
    /youtube\.com|youtu\.be/.test(url || "");

  const fetchTranscript = async (videoUrl: string) => {
    if (!videoUrl) {
      setTranscript("Transcript unavailable for this video.");
      return;
    }

    if (!isYouTubeUrl(videoUrl)) {
      setTranscript("Transcript is currently available only for YouTube lessons.");
      return;
    }

    try {
      setTranscript("Loading transcript...");
      const { data } = await axios.post("http://localhost:5000/trans", {
        videoUrl,
      });
      setTranscript(data.transcript || "Transcript not available.");
    } catch (error) {
      console.error("Transcript fetch error:", error);
      setTranscript("Transcript unavailable for this video.");
    }
  };

  const handleLessonSelect = (lesson: any) => {
    if (!lesson) return;
    setActiveLesson(lesson);
    fetchTranscript(lesson.videoUrl);
  };

  const handleContinue = async (courseId: string) => {
    try {
      setCourseLoading(true);
      setError("");
      const { data } = await axios.post(
        "http://localhost:5000/api/courses/getsingle",
        { courseId },
        { withCredentials: true }
      );

      setActiveCourse(data);
      const firstModule = data.modules?.[0];
      const firstLesson = firstModule?.lessons?.[0];

      if (firstLesson) {
        setActiveLesson(firstLesson);
        fetchTranscript(firstLesson.videoUrl);
      } else {
        setActiveLesson(null);
        setTranscript("This course does not have any lessons yet.");
      }
    } catch (err: any) {
      console.error("Continue course error:", err);
      setError(err.response?.data?.message || "Failed to open course content.");
    } finally {
      setCourseLoading(false);
    }
  };

    useEffect(() => {
        fetchMyCourses();
    }, []);

    // ─── Filter Search ────────────────────────────────────────
    const filteredCourses = courses.filter((course) =>
        (course?.title || "").toLowerCase().includes((searchQuery || "").toLowerCase())
    );
    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2 text-gradient">
                    My Learning
                </h1>
                <p className="text-muted-foreground text-lg">
                    Continue your enrolled courses
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Search enrolled courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
            
            {/* Loading & Error States */}
            {loading && (
                <p className="text-center text-muted-foreground">
                    Loading your courses...
                </p>
            )}
            {error && <p className="text-center text-destructive">{error}</p>}

            {/* Course Cards */}
            {!loading && filteredCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:scale-105 transition-transform cursor-pointer hover:glow-primary border-primary/20">
                      <CardHeader className="pb-4">
                        <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-muted/30">
                          <img
                            src={
                              course.thumbnail ||
                              "https://via.placeholder.com/400x250?text=Course+Image"
                            }
                            alt={course.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Duration + Progress */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Duration: {course.duration || 0}h</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-primary">
                              {course.progress || 0}%
                            </span>
                          </div>
                          <Progress value={course.progress || 0} className="h-2" />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 glow-primary"
                            onClick={() => handleContinue(course._id)}
                            disabled={courseLoading && activeCourse?._id === course._id}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {courseLoading && activeCourse?._id === course._id
                              ? "Loading..."
                              : "Continue"}
                          </Button>
                          <Button
                            className="flex-1"
                            variant="outline"
                            onClick={() => navigate("/student/ground", { state: course._id })}
                          >
                            Open Workspace
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    You haven’t enrolled in any courses yet.
                  </p>
                </div>
              )
            )}

            {(courseLoading || activeCourse) && (
              <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Course Player</h2>
                    {activeCourse && (
                      <p className="text-muted-foreground">{activeCourse.title}</p>
                    )}
                  </div>
                  {activeCourse && (
                    <Button
                      variant="outline"
                      onClick={() => navigate("/student/ground", { state: activeCourse._id })}
                    >
                      Open Full Course Workspace
                    </Button>
                  )}
                </div>

                {courseLoading && !activeCourse && (
                  <div className="text-center text-muted-foreground py-8">
                    Loading course content...
                  </div>
                )}

                {activeCourse && (
                  <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-6">
                      <Card className="border-none shadow-lg">
                        <CardContent className="space-y-4 p-4">
                          {activeLesson ? (
                            <>
                              <div className="rounded-xl overflow-hidden">
                                <VideoPlayer
                                  url={activeLesson.videoUrl}
                                  title={activeLesson.title}
                                />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {activeLesson.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Duration: {activeLesson.duration || 0} minutes
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                              Select a lesson to begin watching.
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {activeLesson && (
                        <Card className="border border-primary/20">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-primary">
                              Transcript
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed text-muted-foreground max-h-[260px] overflow-y-auto whitespace-pre-line">
                              {transcript || "Transcript unavailable for this video."}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <Card className="border border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                          Course Lessons
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {activeCourse.modules?.length ? (
                          activeCourse.modules.map((mod: any, modIndex: number) => (
                            <div key={modIndex} className="space-y-2">
                              <h4 className="text-sm font-semibold text-primary">
                                {mod.title || `Module ${modIndex + 1}`}
                              </h4>
                              <div className="space-y-2">
                                {mod.lessons?.length ? (
                                  mod.lessons.map((lesson: any) => {
                                    const isActive = activeLesson?._id === lesson._id;
                                    return (
                                      <Button
                                        key={lesson._id || `${modIndex}-${lesson.title}`}
                                        variant={isActive ? "default" : "outline"}
                                        className="w-full justify-between"
                                        onClick={() => handleLessonSelect(lesson)}
                                      >
                                        <span className="flex items-center gap-2">
                                          {isActive ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                          ) : (
                                            <Play className="w-4 h-4" />
                                          )}
                                          {lesson.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {lesson.duration || 0} min
                                        </span>
                                      </Button>
                                    );
                                  })
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    No lessons available in this module yet.
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            This course does not contain any modules yet.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
        </div>
    );
};

export default MyLearning;
