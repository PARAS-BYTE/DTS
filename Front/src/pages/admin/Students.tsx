import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Search, Filter, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  _id: string;
  name: string;
  email: string;
  progress: number;
  xp: number;
  level: number;
  streakDays: number;
  totalStudyTime: number;
  masteryScore: number;
  focusScore: number;
  accuracyScore: number;
  enrolledCoursesCount: number;
  avatarUrl?: string;
  trend: 'up' | 'down';
  lastActive: string;
}

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Get Admin Token ────────────────────────────────
  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  // ─── Fetch Students ────────────────────────────────
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const { data } = await axios.get('http://localhost:5000/api/admin/auth/students', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (data.success) {
        setStudents(data.students);
      }
    } catch (err: any) {
      console.error('Fetch Students Error:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format study time
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient">Students</h1>
        <p className="text-muted-foreground text-lg">
          Monitor and manage student progress ({students.length} enrolled)
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      )}

      {/* Students Grid */}
      {!loading && filteredStudents.length > 0 ? (
        <div className="grid gap-4">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:border-primary/50 transition-all cursor-pointer hover:glow-primary">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar and Basic Info */}
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg">
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            {student.name}
                            {student.trend === 'up' ? (
                              <TrendingUp className="w-5 h-5 text-success" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-destructive" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Level {student.level} • {student.streakDays} day streak • {formatStudyTime(student.totalStudyTime)} studied
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{student.xp}</div>
                          <p className="text-xs text-muted-foreground">Total XP</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-medium text-primary">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Courses</p>
                          <p className="font-semibold text-lg">{student.enrolledCoursesCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mastery</p>
                          <p className="font-semibold text-lg">{student.masteryScore}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Focus</p>
                          <p className="font-semibold text-lg">{student.focusScore}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No students found matching your search.' : 'No students enrolled yet.'}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Students;