import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, FileCheck, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardStats {
  educatorName: string;
  activeCourses: number;
  enrolledStudents: number;
  pendingAssignments: number;
  avgPerformance: number;
  performanceImprovement: number;
  coursePerformanceData: Array<{ course: string; avg: number }>;
  engagementData: Array<{ week: string; students: number }>;
  admin: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    department: string;
  };
}

interface Activity {
  student: string;
  action: string;
  item: string;
  time: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  // ─── Get Admin Token ────────────────────────────────
  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  // ─── Fetch Dashboard Stats ────────────────────────────────
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const { data } = await axios.get('http://localhost:5000/api/admin/auth/dashboard/stats', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error('Fetch Dashboard Stats Error:', err);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch Recent Activity ────────────────────────────────
  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const token = getAdminToken();
      const { data } = await axios.get('http://localhost:5000/api/admin/auth/dashboard/activity', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (data.success) {
        setActivities(data.activities);
      }
    } catch (err: any) {
      console.error('Fetch Activity Error:', err);
      // Don't show error toast for activity, just log it
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
    
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchRecentActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-black">
            {stats?.educatorName ? `${stats.educatorName}'s Dashboard` : 'Instructor Dashboard'}
          </h1>
          <p className="text-gray-700 text-lg">
            Manage your courses and track student progress
          </p>
        </div>
        <Link to="/admin/courses">
          <Button size="lg" className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 hover:shadow-black/30">
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-white border border-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">Total Students</CardTitle>
              <Users className="w-4 h-4 text-black" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-3xl font-bold text-black">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-black">
                    {stats?.enrolledStudents ?? 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Students enrolled in your courses
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-white border border-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">Active Courses</CardTitle>
              <BookOpen className="w-4 h-4 text-black" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-3xl font-bold text-black">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-black">
                    {stats?.activeCourses ?? 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Published courses available to students
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-white border border-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">Assignments Pending</CardTitle>
              <FileCheck className="w-4 h-4 text-black" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-3xl font-bold text-black">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-black">
                    {stats?.pendingAssignments ?? 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Needs grading</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-white border border-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">Avg Performance</CardTitle>
              <TrendingUp className="w-4 h-4 text-black" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-3xl font-bold text-black">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-black">
                    {stats?.avgPerformance ?? 0}%
                  </div>
                  <p className="text-xs text-gray-700 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{stats?.performanceImprovement ?? 0}% improvement
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <BarChart className="w-5 h-5 text-black" />
                Course Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Loading chart data...
                </div>
              ) : stats?.coursePerformanceData && stats.coursePerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.coursePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="course" 
                      stroke="hsl(var(--muted-foreground))"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No performance data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <TrendingUp className="w-5 h-5 text-black" />
                Student Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Loading chart data...
                </div>
              ) : stats?.engagementData && stats.engagementData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--secondary))', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No engagement data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black">Recent Activity</CardTitle>
              <Link to="/admin/students">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Loading activity...</p>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="w-2 h-2 rounded-full bg-black mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-black">
                      <span className="font-medium">{activity.student}</span> {activity.action}{' '}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
