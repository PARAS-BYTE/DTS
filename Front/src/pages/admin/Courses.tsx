import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Users, BarChart, Search, Edit, Trash2, Brain } from 'lucide-react';
import { useState } from 'react';

const AdminCourses = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const courses = [
    {
      id: '1',
      title: 'Advanced Machine Learning',
      students: 45,
      progress: 68,
      lessons: 24,
      category: 'AI & ML',
    },
    {
      id: '2',
      title: 'Web Development Masterclass',
      students: 62,
      progress: 75,
      lessons: 32,
      category: 'Development',
    },
    {
      id: '3',
      title: 'Data Structures & Algorithms',
      students: 38,
      progress: 82,
      lessons: 28,
      category: 'Computer Science',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Course Management</h1>
          <p className="text-muted-foreground text-lg">Create and manage your courses</p>
        </div>
        <Button size="lg" className="glow-primary">
          <Plus className="w-5 h-5 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="hover:scale-105 transition-transform cursor-pointer hover:border-primary/50 h-full">
              <CardHeader>
                <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mb-4">
                  <BookOpen className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mt-2">
                  {course.category}
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{course.students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 hover:text-destructive hover:border-destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>

                <Button size="sm" className="w-full bg-warning hover:bg-warning/90 text-warning-foreground">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Enhance Course
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminCourses;
