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
        const headers: any = {};
        
        // Only add Authorization header if token exists in localStorage
        // Otherwise, rely on httpOnly cookie (which is set during signup/login)
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const res = await axios.get("http://localhost:5000/api/auth/dashboard", {
          headers,
          withCredentials: true, // This ensures cookies are sent
        });
        setUser(res.data);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-black hover:bg-gray-800 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Process real data from backend
  const studyTimeData = (user?.last7DaysStudy ?? []).map((item: any) => ({
    day: item.day || item.week || 'Mon',
    hours: item.hours || 0,
  }));

  // XP History - backend sends day-based data, we'll use it as-is
  const xpGrowthData = (user?.xpHistory ?? []).map((item: any) => ({
    day: item.day || item.week || 'Mon',
    xp: item.xp || 0,
  }));

  const courses = user?.courses ?? [];
  const upcomingTasks = user?.upcomingTasks ?? [];
  const statistics = user?.statistics ?? {};
  const streakStats =
    user?.streakStats ?? {
      currentStreak: user?.streak ?? user?.streakDays ?? 0,
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
    user?.weakTopics ?? 
    (user?.learningPreferences?.weakAreas && user.learningPreferences.weakAreas.length > 0
      ? user.learningPreferences.weakAreas
      : ["No weak areas identified yet"]);

  return (
    <div className="p-8 space-y-8 bg-white">
      {/* ✅ Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 text-black">
          Welcome back, <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">{user?.name || user?.username || "Student"}</span>! 👋
        </h1>
        <p className="text-gray-700 text-lg">
          You are learning with <b>learnNova</b>. Keep up the momentum 🔥
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
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">App Usage Time</CardTitle>
              <Clock className="w-4 h-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black font-mono">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
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
          color="black"
          type="area"
          data={studyTimeData}
          xKey="day"
          yKey="hours"
          fillId="colorHours"
        />

        <ChartCard
          title="XP Growth"
          icon={Zap}
          color="black"
          type="line"
          data={xpGrowthData}
          xKey="day"
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
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-black">{title}</CardTitle>
          <Icon className={`w-4 h-4 text-black`} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold text-black`}>{value}</div>
          <p className="text-xs text-gray-600 mt-1">{sub}</p>

          {progress && <Progress value={progress} className="mt-3 h-2" />}

          {streak && (
            <div className="flex gap-1 mt-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < streak ? "bg-black" : "bg-gray-200"
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
  // Use black/gray theme colors
  const strokeColor = color === "black" ? "#000000" : "#4B5563";
  const fillColor = color === "black" ? "#000000" : "#4B5563";

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <Icon className="w-5 h-5 text-black" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            {type === "area" ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={fillId || "colorFill"} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={fillColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey={xKey} 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#000000'
                  }}
                />

                <Area
                  type="monotone"
                  dataKey={yKey}
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill={`url(#${fillId || "colorFill"})`}
                />
              </AreaChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey={xKey} 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#000000'
                  }}
                />

                <Line
                  type="monotone"
                  dataKey={yKey}
                  stroke={strokeColor}
                  strokeWidth={3}
                  dot={{ fill: strokeColor, r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            <p className="text-sm">No data available yet. Complete tasks to see your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ✅ Upcoming tasks */
const TaskSection = ({ upcomingTasks }: any) => (
  <Card className="bg-white border border-gray-200 shadow-sm">
    <CardHeader>
      <CardTitle className="text-lg text-black">Upcoming Tasks</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {upcomingTasks && upcomingTasks.length > 0 ? (
        upcomingTasks.slice(0, 3).map((task: any, i: number) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
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
              <p className="font-medium text-sm text-black">{task.title || "Untitled Task"}</p>
              <p className="text-xs text-gray-600 truncate">
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
        <p className="text-gray-600 text-sm">No upcoming tasks. Check your calendar to add tasks!</p>
      )}
      <Link to="/student/calendar">
        <Button variant="ghost" className="w-full mt-2 text-gray-700 hover:text-black">
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);

/* ✅ Courses Section */
const CoursesSection = ({ courses }: any) => (
  <Card className="bg-white border border-gray-200 shadow-sm">
    <CardHeader>
      <CardTitle className="text-lg text-black">Continue Learning</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {courses && courses.length > 0 ? (
        courses.slice(0, 2).map((course: any, i: number) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-black" />
              <p className="font-medium text-sm text-black">{course.title || "Untitled Course"}</p>
            </div>

            <Progress value={course.progress || 0} className="h-2" />
            <p className="text-xs text-gray-600 mt-2">
              {course.progress || 0}% complete
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-sm">No enrolled courses yet. Browse courses to get started!</p>
      )}

      <Link to="/student/courses">
        <Button variant="ghost" className="w-full mt-2 text-gray-700 hover:text-black">
          View All Courses <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);

/* ✅ Focus Area Section */
const FocusSection = ({ weakTopics }: any) => (
  <Card className="bg-white border border-gray-200 shadow-sm">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2 text-black">
        <Target className="w-5 h-5 text-black" />
        Focus Areas
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-2">
      <p className="text-sm text-gray-700 mb-2">
        Nova Learn recommends reviewing these topics:
      </p>

      {weakTopics && weakTopics.length > 0 ? (
        weakTopics.map((topic: string, i: number) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-xs font-medium text-black">
              {i + 1}
            </div>
            <span className="text-sm text-black">{topic}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600">No weak areas identified. Keep up the great work! 🎉</p>
      )}

      {weakTopics && weakTopics.length > 0 && (
        <Button className="w-full mt-3 bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/20 hover:shadow-black/30">
          Start Review Session
        </Button>
      )}
    </CardContent>
  </Card>
);