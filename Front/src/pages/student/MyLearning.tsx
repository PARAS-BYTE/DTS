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
import { Link, useNavigate } from "react-router-dom";

const MyLearning = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate()
    function listner(id) {
        navigate("/student/ground", { state: id })
    }
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

    useEffect(() => {
        fetchMyCourses();
    }, []);

    // ─── Filter Search ────────────────────────────────────────
    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                                        {course.completed ? (
                                            <Button className="flex-1" disabled>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Completed
                                            </Button>
                                        ) : (

                                            <Button className="flex-1 glow-primary" onClick={() => listner(course._id)}>
                                                <Play className="w-4 h-4 mr-2" />
                                                Continue
                                            </Button>

                                        )}
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
        </div>
    );
};

export default MyLearning;
