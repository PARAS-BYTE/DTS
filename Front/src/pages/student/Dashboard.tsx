import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target, Flame, TrendingUp, BookOpen, Clock, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // or use cookies
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log(res.data)
        setUser(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const studyTimeData = user.last7DaysStudy || [];
  const xpGrowthData = user.xpHistory || [];
  const courses = user.courses || [];
  const upcomingTasks = user.upcomingTasks || [];
  const weakTopics = user.weakTopics || ['Neural Networks', 'Dynamic Programming', 'React Context'];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, <span className="text-gradient">{user?.name}</span>! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          You are learning with <b>Nova Learn</b>. Keep up the momentum 🔥
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total XP" icon={Zap} color="primary" value={user.xp?.toLocaleString()} sub={`+${user.weeklyXP || 0} this week`} progress={75} />
        <StatCard title="Study Streak" icon={Flame} color="warning" value={`${user.streak} days`} sub={`Personal best: ${user.personalBestStreak || 0} days`} streak={user.streak} />
        <StatCard title="Avg. Mastery" icon={Target} color="success" value={`${user.masteryScore || 0}%`} sub="+5% from last month" progress={user.masteryScore || 0} />
        <StatCard title="Rank" icon={Trophy} color="secondary" value={user.rank || 'Bronze'} sub={`Top ${user.rankPercentile || 100}% globally`} />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Weekly Study Time"
          icon={Clock}
          color="primary"
          type="area"
          data={studyTimeData}
          xKey="day"
          yKey="hours"
          fillId="colorHours"
        />
        <ChartCard
          title="XP Growth"
          icon={Zap}
          color="secondary"
          type="line"
          data={xpGrowthData}
          xKey="week"
          yKey="xp"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.slice(0, 3).map((task: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        task.type === 'quiz'
                          ? 'bg-warning'
                          : task.type === 'assignment'
                          ? 'bg-destructive'
                          : 'bg-success'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No upcoming tasks</p>
              )}
              <Link to="/student/calendar">
                <Button variant="ghost" className="w-full mt-2">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Continue Learning */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Continue Learning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.slice(0, 2).map((course: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <p className="font-medium text-sm">{course.title}</p>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">{course.progress}% complete</p>
                </div>
              ))}
              <Link to="/student/courses">
                <Button variant="ghost" className="w-full mt-2">
                  View All Courses <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Focus Areas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}>
          <Card className="border-warning/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-warning" />
                Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Nova Learn recommends reviewing these topics:
              </p>
              {weakTopics.map((topic: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center text-xs font-medium text-warning">
                    {i + 1}
                  </div>
                  <span className="text-sm">{topic}</span>
                </div>
              ))}
              <Button className="w-full mt-3 bg-warning hover:bg-warning/90 text-warning-foreground">
                Start Review Session
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// ─── Helper Components ──────────────────────────────

const StatCard = ({ title, icon: Icon, color, value, sub, progress, streak }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
    <Card className={`bg-gradient-to-br from-${color}/20 to-${color}/5 border-${color}/30 hover:scale-105 transition-transform cursor-pointer`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`w-4 h-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold text-${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        {progress && <Progress value={progress} className="mt-3 h-2" />}
        {streak && (
          <div className="flex gap-1 mt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i < streak ? `bg-${color}` : 'bg-muted'}`} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const ChartCard = ({ title, icon: Icon, color, type, data, xKey, yKey, fillId }: any) => (
  <motion.div initial={{ opacity: 0, x: type === 'area' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 text-${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={`hsl(var(--${color}))`} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={`hsl(var(--${color}))`}
                fillOpacity={1}
                fill={`url(#${fillId})`}
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" />
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
                dataKey={yKey}
                stroke={`hsl(var(--${color}))`}
                strokeWidth={3}
                dot={{ fill: `hsl(var(--${color}))`, strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </motion.div>
);

export default Dashboard;
