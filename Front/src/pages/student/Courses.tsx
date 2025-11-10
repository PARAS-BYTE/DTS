import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Clock,
  User,
  Search,
  Play,
  CheckCircle2,
} from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // ─── Fetch all courses ────────────────────────────────
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/courses', {
        withCredentials: true,
      });
      setCourses(data);
    } catch (err: any) {
      console.error('Fetch Courses Error:', err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ─── Enroll in a Course ────────────────────────────────
  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);

      const { data } = await axios.post(
        'http://localhost:5000/api/courses/enroll',
        { courseId },
        { withCredentials: true }
      );

      console.log('Enrollment Success:', data);

      // Optional: update course list or progress immediately
      alert(`✅ ${data.message}`);
      fetchCourses();
    } catch (err: any) {
      console.error('Enrollment Error:', err);
      alert(
        err.response?.data?.message ||
          '❌ Enrollment failed. Please try again.'
      );
    } finally {
      setEnrolling(null);
    }
  };

  // ─── Filtered Courses ────────────────────────────────
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient">My Courses</h1>
        <p className="text-muted-foreground text-lg">
          Continue your learning journey
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading or Error States */}
      {loading && (
        <p className="text-center text-muted-foreground">Loading courses...</p>
      )}
      {error && <p className="text-center text-destructive">{error}</p>}

      {/* Courses Grid */}
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
                        'https://via.placeholder.com/400x250?text=Course+Image'
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>
                        {course.instructor?.username || 'Instructor'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || 0}h</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
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
                    {course.progress === 100 ? (
                      <Button className="flex-1" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 glow-primary"
                        disabled={enrolling === course._id}
                        onClick={() => handleEnroll(course._id)}
                      >
                        {enrolling === course._id ? (
                          'Enrolling...'
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Enroll
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {course.category || 'General'}
                    </span>
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
              No courses found matching your search.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Courses;
