import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Target,
  Flame,
  BookOpen,
  Clock,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useStopwatch } from "../../App"; // ✅ Import the stopwatch hook

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // ✅ Use the global stopwatch
  const { elapsedTime, formatTime } = useStopwatch();

  // ---------------------------------------------
  // ✅ Fetch User Data
  // ---------------------------------------------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/auth/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

const studyTimeData = user?.last7DaysStudy ?? [];
const xpGrowthData = user?.xpHistory ?? [];
const courses = user?.courses ?? [];
const upcomingTasks = user?.upcomingTasks ?? [];
const statistics = user?.statistics ?? {};
const streakStats =
  user?.streakStats ?? {
    currentStreak: user?.streak ?? 0,
    longestStreak: user?.personalBestStreak ?? 0,
  };
const weeklyXP = user?.weeklyXP ?? 0;
const xpGoal = Math.max((user?.level || 1) * 100, 100);
const xpProgress = Math.min(
  100,
  xpGoal > 0 ? Math.round(((user?.xp || 0) / xpGoal) * 100) : 0
);
const masteryScore = Math.round(
  statistics?.completionRate ?? user?.masteryScore ?? 0
);
  const weakTopics =
  user?.weakTopics ?? ["Neural Networks", "Dynamic Programming", "React Context"];

  return (
    <div className="p-8 space-y-8">
      {/* ✅ Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, <span className="text-gradient">{user?.name}</span>! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          You are learning with <b>Nova Learn</b>. Keep up the momentum 🔥
        </p>
      </motion.div>

      {/* ✅ Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total XP"
          icon={Zap}
          value={user?.xp?.toLocaleString() || "0"}
          sub={`+${weeklyXP} this week`}
          progress={xpProgress}
          color="blue"
        />

        <StatCard
          title="Study Streak"
          icon={Flame}
          value={`${streakStats.currentStreak} days`}
          sub={`Personal best: ${streakStats.longestStreak || 0} days`}
          streak={streakStats.currentStreak}
          color="orange"
        />

        <StatCard
          title="Avg. Mastery"
          icon={Target}
          value={`${masteryScore}%`}
          sub={`Total tasks completed: ${statistics.totalTasksCompleted || 0}`}
          progress={masteryScore}
          color="green"
        />

        {/* ✅ Stopwatch Card - Now using global stopwatch */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">App Usage Time</CardTitle>
              <Clock className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500 font-mono">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Time spent in Nova Learn today
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ✅ Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Weekly Study Time"
          icon={Clock}
          color="blue"
          type="area"
          data={studyTimeData}
          xKey="day"
          yKey="hours"
          fillId="colorHours"
        />

        <ChartCard
          title="XP Growth"
          icon={Zap}
          color="purple"
          type="line"
          data={xpGrowthData}
          xKey="week"
          yKey="xp"
        />
      </div>

      {/* ✅ Upcoming, Courses, Focus */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <TaskSection upcomingTasks={upcomingTasks} />

        {/* Continue Learning */}
        <CoursesSection courses={courses} />

        {/* Focus Areas */}
        <FocusSection weakTopics={weakTopics} />
      </div>
    </div>
  );
};

export default Dashboard;

/* -----------------------------------------------------------
 ✅ Reusable Components
----------------------------------------------------------- */

const StatCard = ({ title, icon: Icon, value, sub, progress, streak, color }: any) => {
  const colorClasses: any = {
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-500",
    green: "from-green-500/20 to-green-500/5 border-green-500/30 text-green-500",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-500",
  };

  const bgClasses: any = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className={`bg-gradient-to-br ${colorClasses[color]}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`w-4 h-4`} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold`}>{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>

          {progress && <Progress value={progress} className="mt-3 h-2" />}

          {streak && (
            <div className="flex gap-1 mt-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < streak ? `${bgClasses[color]}` : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ✅ Chart Component */
const ChartCard = ({ title, icon: Icon, color, type, data, xKey, yKey, fillId }: any) => {
  const colorClasses: any = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    green: "text-green-500",
    purple: "text-purple-500",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${color})`} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={`var(--color-${color})`} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />

              <Area
                type="monotone"
                dataKey={yKey}
                stroke={`var(--color-${color})`}
                fill={`url(#${fillId})`}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey={yKey}
                stroke={`var(--color-${color})`}
                strokeWidth={3}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/* ✅ Upcoming tasks */
const TaskSection = ({ upcomingTasks }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {upcomingTasks.length > 0 ? (
        upcomingTasks.slice(0, 3).map((task: any, i: number) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50"
          >
            <div
              className={`w-2 h-2 rounded-full mt-2 ${
                task.type === "quiz"
                  ? "bg-orange-500"
                  : task.type === "assignment"
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{task.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                Due:{" "}
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : task.date
                  ? new Date(task.date).toLocaleDateString()
                  : "TBD"}
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
);

/* ✅ Courses Section */
const CoursesSection = ({ courses }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Continue Learning</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {courses.slice(0, 2).map((course: any, i: number) => (
        <div
          key={i}
          className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <p className="font-medium text-sm">{course.title}</p>
          </div>

          <Progress value={course.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {course.progress}% complete
          </p>
        </div>
      ))}

      <Link to="/student/courses">
        <Button variant="ghost" className="w-full mt-2">
          View All Courses <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);

/* ✅ Focus Area Section */
const FocusSection = ({ weakTopics }: any) => (
  <Card className="border-orange-500/30">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Target className="w-5 h-5 text-orange-500" />
        Focus Areas
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-2">
      <p className="text-sm text-muted-foreground mb-2">
        Nova Learn recommends reviewing these topics:
      </p>

      {weakTopics.map((topic: string, i: number) => (
        <div
          key={i}
          className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20"
        >
          <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-medium text-orange-500">
            {i + 1}
          </div>
          <span className="text-sm">{topic}</span>
        </div>
      ))}

      <Button className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white">
        Start Review Session
      </Button>
    </CardContent>
  </Card>
);