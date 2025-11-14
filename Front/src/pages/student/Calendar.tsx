import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Flame,
  Clock,
  CheckCircle2,
  Target,
  BookOpen,
  FileText,
  HelpCircle,
  Zap,
  TrendingUp,
  Lock,
  RefreshCw,
  Settings,
  Plus
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

// Types
interface Task {
  taskId: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "in-progress";
  category: string;
  priority: "low" | "medium" | "high";
  type: "study" | "quiz" | "reading" | "practice" | "assignment";
  estimatedDuration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  aiGenerated: boolean;
  completedAt?: string;
  content?: any;
}

interface StudyPreferences {
  subjects: string[];
  difficultyLevel: string;
  dailyStudyTime: number;
  learningGoals: string[];
  preferredLearningStyles: string[];
}

interface CalendarData {
  tasks: Task[];
  todayTasks: Task[];
  upcomingTasks: Task[];
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  statistics: {
    totalTasksCompleted: number;
    completionRate: number;
    totalStudyTime: number;
    averageDailyTasks: number;
  };
  studyPreferences: StudyPreferences;
}
// Update these in your TaskItem component
const typeIcons = {
  study: BookOpen,
  quiz: HelpCircle,
  reading: FileText,
  practice: TrendingUp,
  assignment: Zap,
  review: RefreshCw  // Add this line
};

  const typeColors = {
    study: "text-blue-600",
    quiz: "text-purple-600", 
    reading: "text-green-600",
    practice: "text-yellow-600",
    assignment: "text-orange-600",
    review: "text-pink-600"
  };

// Shape Cell Component
const ShapeCell = ({ 
  day, 
  color, 
  isToday,
  isCompleted,
  isFuture,
  hasTask,
  onClick
}: { 
  day: number;
  color: string;
  isToday: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  hasTask: boolean;
  onClick?: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ scale: hasTask && !isFuture ? 1.05 : 1 }}
      onClick={hasTask && !isFuture ? onClick : undefined}
      className={`relative w-12 h-12 flex items-center justify-center ${color} rounded-lg text-sm font-semibold transition-all border-2 ${
        isToday ? "border-black shadow-lg shadow-black/20" :
        isCompleted ? "border-green-500 shadow-lg shadow-green-500/20" :
        "border-gray-200"
      } ${isFuture ? "cursor-not-allowed opacity-60" : hasTask ? "cursor-pointer hover:scale-105 hover:shadow-md" : "cursor-default"}`}
    >
      <span className={`${isToday ? "text-white" : isCompleted ? "text-white" : "text-black"}`}>
        {day}
      </span>
      
      {/* Completion checkmark */}
      {isCompleted && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Today's indicator */}
      {isToday && !isCompleted && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full border-2 border-white animate-pulse" />
      )}

      {/* Task indicator dot */}
      {hasTask && !isCompleted && !isToday && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full" />
      )}
    </motion.div>
  );
};

// Task Item Component
const TaskItem = ({ 
  task, 
  onComplete,
  onRegenerate
}: { 
  task: Task; 
  onComplete?: (taskId: string) => void;
  onRegenerate?: () => void;
}) => {
  const navigate = useNavigate();
  
  const typeIcons = {
    study: BookOpen,
    quiz: HelpCircle,
    reading: FileText,
    practice: TrendingUp,
    assignment: Zap
  };

  const typeColors = {
    study: "text-blue-400",
    quiz: "text-purple-400", 
    reading: "text-green-400",
    practice: "text-yellow-400",
    assignment: "text-orange-400"
  };

  const TypeIcon = typeIcons[task.type] || BookOpen;

  const isTaskAvailable = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  };

  const handleTaskClick = () => {
    if (isTaskAvailable() && task.status !== "completed") {
      navigate(`/task/${task.taskId}`);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTaskAvailable() && task.status !== "completed" && onComplete) {
      onComplete(task.taskId);
    }
  };

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRegenerate) {
      onRegenerate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
        !isTaskAvailable() 
          ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
          : task.status === "completed"
          ? "bg-green-50 border-green-200 cursor-default"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer"
      }`}
      onClick={handleTaskClick}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
        task.status === "completed" 
          ? "bg-green-500 border-green-500" 
          : !isTaskAvailable()
          ? "border-gray-300"
          : "border-gray-300"
      }`}>
        {task.status === "completed" && <CheckCircle2 className="w-3 h-3 text-white" />}
        {!isTaskAvailable() && <Lock className="w-3 h-3 text-gray-400" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <TypeIcon className={`w-4 h-4 ${typeColors[task.type]}`} />
          <h4 className={`text-sm font-medium ${
            task.status === "completed" ? "text-green-700" : 
            !isTaskAvailable() ? "text-gray-500" : "text-black"
          }`}>
            {task.title}
          </h4>
          {task.aiGenerated ? (
            <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/20">
              AI
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/20">
              Custom
            </Badge>
          )}
          {task.status === "completed" && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
              Done
            </Badge>
          )}
          {isTaskAvailable() && task.status !== "completed" && (
            <Badge variant="outline" className="text-xs bg-black/5 text-black border-gray-200">
              Available
            </Badge>
          )}
        </div>
        <p className={`text-xs mb-2 ${
          !isTaskAvailable() ? "text-gray-500" : "text-gray-600"
        }`}>
          {task.description}
        </p>
        
        {/* Learning Objectives */}
        {task.content?.learningObjectives && (
          <div className="mb-2">
            <p className="text-xs text-gray-600 mb-1">Learning Objectives:</p>
            <ul className="text-xs text-gray-600 list-disc list-inside">
              {task.content.learningObjectives.slice(0, 2).map((obj, index) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className={`flex items-center gap-4 text-xs ${
          !isTaskAvailable() ? "text-gray-500" : "text-gray-600"
        }`}>
          <span>{task.estimatedDuration}min</span>
          <span>•</span>
          <span className="capitalize">{task.difficulty}</span>
          <span>•</span>
          <span>{task.category}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          {isTaskAvailable() && task.status !== "completed" && (
            <>
              <Button
                size="sm"
                onClick={handleComplete}
                className="bg-black hover:bg-gray-800 text-white text-xs shadow-lg shadow-black/20 hover:shadow-black/30"
              >
                Mark Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerate}
                className="text-xs border-gray-300 hover:bg-gray-50 text-black"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Study Preferences Component
const StudyPreferencesCard = ({ preferences }: { preferences: StudyPreferences }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner": return "text-green-600";
      case "intermediate": return "text-yellow-600";
      case "advanced": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black text-sm">
          <Settings className="w-4 h-4" /> Study Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-sm">Difficulty Level</span>
          <Badge variant="outline" className={`capitalize ${getDifficultyColor(preferences.difficultyLevel)} border-gray-200`}>
            {preferences.difficultyLevel}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-sm">Daily Study Time</span>
          <span className="text-black text-sm font-medium">
            {preferences.dailyStudyTime} min
          </span>
        </div>
        
        <div>
          <span className="text-gray-700 text-sm">Subjects</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {preferences.subjects.slice(0, 4).map((subject, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-black border-gray-200">
                {subject}
              </Badge>
            ))}
            {preferences.subjects.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-black border-gray-200">
                +{preferences.subjects.length - 4} more
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <span className="text-gray-700 text-sm">Learning Goals</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {preferences.learningGoals.slice(0, 2).map((goal, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-black/5 text-black border-gray-200">
                {goal}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Calendar Component
const Calendar = () => {
  const navigate = useNavigate();
  const [calendarData, setCalendarData] = useState<CalendarData>({
    tasks: [],
    todayTasks: [],
    upcomingTasks: [],
    streak: { currentStreak: 0, longestStreak: 0 },
    statistics: { 
      totalTasksCompleted: 0, 
      completionRate: 0, 
      totalStudyTime: 0, 
      averageDailyTasks: 0 
    },
    studyPreferences: {
      subjects: [],
      difficultyLevel: "beginner",
      dailyStudyTime: 60,
      learningGoals: [],
      preferredLearningStyles: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    date: new Date(),
    type: "study",
    category: "General",
    priority: "medium",
    estimatedDuration: 30,
    difficulty: "beginner",
  });

  const today = new Date();

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Refresh when navigating back to calendar
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCalendarData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const normalizeTask = (task: any): Task => {
    if (!task) return task;
    const identifier =
      task.taskId ||
      (task._id ? task._id.toString() : undefined) ||
      new Date().getTime().toString();

    const questions = Array.isArray(task.content?.questions)
      ? task.content.questions.map((question: any, index: number) => ({
          ...question,
          questionNumber:
            question?.questionNumber !== undefined
              ? question.questionNumber
              : index + 1,
        }))
      : undefined;

    return {
      ...task,
      taskId: identifier,
      content: {
        ...task.content,
        questions,
      },
    };
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/calendar", {
        withCredentials: true,
      });
      console.log("📅 Calendar data received:", res.data);
      console.log("📅 Today's tasks:", res.data.todayTasks);
      console.log("📅 All tasks:", res.data.tasks);
      
      // Ensure todayTasks is always an array
      const todayTasks = Array.isArray(res.data.todayTasks) ? res.data.todayTasks : [];
      
      // If no todayTasks but tasks exist, try to find today's task manually
      if (todayTasks.length === 0 && res.data.tasks && res.data.tasks.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTask = res.data.tasks.find((t: Task) => {
          const taskDate = new Date(t.date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
        if (todayTask) {
          console.log("✅ Found today's task in tasks array:", todayTask.title);
          res.data.todayTasks = [todayTask];
        }
      }
      
      setCalendarData({
        ...res.data,
        tasks: Array.isArray(res.data.tasks) ? res.data.tasks.map(normalizeTask) : [],
        todayTasks: Array.isArray(res.data.todayTasks)
          ? res.data.todayTasks.map(normalizeTask)
          : [],
      });
      
      // Show message if no task for today
      if (!res.data.todayTasks || res.data.todayTasks.length === 0) {
        console.warn("⚠️ No task found for today");
        // Auto-generate if no task
        setTimeout(async () => {
          try {
            await axios.post(
              "http://localhost:5000/api/calendar/regenerate-today",
              {},
              { withCredentials: true }
            );
            await fetchCalendarData();
          } catch (err) {
            console.error("Auto-generate failed:", err);
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error("❌ Calendar fetch error:", err);
      console.error("Error details:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompleting(taskId);
      const res = await axios.patch(
        `http://localhost:5000/api/calendar/complete/${taskId}`,
        {},
        { withCredentials: true }
      );
      
      await fetchCalendarData();
      const xpGained = res.data.xpGained || 0;
      toast.success(`${res.data.message} +${xpGained} XP earned! 🎉`);
    } catch (err: any) {
      console.error("Complete task error:", err);
      toast.error(err.response?.data?.message || "Failed to complete task");
    } finally {
      setCompleting(null);
    }
  };

  const handleRegenerateTask = async () => {
    try {
      setRegenerating(true);
      const res = await axios.post(
        "http://localhost:5000/api/calendar/regenerate-today",
        {},
        { withCredentials: true }
      );
      
      await fetchCalendarData();
      toast.success("Task regenerated with AI!");
    } catch (err: any) {
      console.error("Regenerate task error:", err);
      toast.error(err.response?.data?.message || "Failed to regenerate task");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    try {
      setCreating(true);
      const res = await axios.post(
        "http://localhost:5000/api/calendar/create-task",
        {
          ...taskForm,
          date: taskForm.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        },
        { withCredentials: true }
      );
      
      await fetchCalendarData();
      toast.success(res.data.message || "Custom task created successfully! 🎉");
      setIsCreateDialogOpen(false);
      setTaskForm({
        title: "",
        description: "",
        date: new Date(),
        type: "study",
        category: "General",
        priority: "medium",
        estimatedDuration: 30,
        difficulty: "beginner",
      });
    } catch (err: any) {
      console.error("Create task error:", err);
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const getColorForDay = (date: Date) => {
    const tasks = calendarData.tasks || [];
    const dayTasks = tasks.filter((t: Task) => {
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === date.getTime();
    });

    const completed = dayTasks.some((t: Task) => t.status === "completed");
    const hasTask = dayTasks.length > 0;

    if (completed) return "bg-green-500";
    if (hasTask) return "bg-black";
    return "bg-gray-100";
  };

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isCompleted = (date: Date) => {
    const tasks = calendarData.tasks || [];
    return tasks.some((t: Task) => {
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === date.getTime() && t.status === "completed";
    });
  };

  const isFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  const getTaskForDate = (date: Date): Task | null => {
    const tasks = calendarData.tasks || [];
    const task = tasks.find((t: Task) => {
      const taskDate = new Date(t.date);
      taskDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return taskDate.getTime() === date.getTime();
    });
    return task || null;
  };

  const hasTaskForDate = (date: Date): boolean => {
    return getTaskForDate(date) !== null;
  };

  const handleDayClick = (date: Date) => {
    const task = getTaskForDate(date);
    if (task && task.status !== "completed") {
      navigate(`/task/${task.taskId}`);
    }
  };

  const totalDays = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  if (loading) {
    return (
      <div className="p-8 bg-white min-h-screen text-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">AI is generating your daily task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen text-black space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2 text-black">
            <CalendarDays className="w-7 h-7" /> Daily Learning
          </h1>
          <p className="text-gray-400">
            Complete your AI-generated daily task or create your own to maintain your streak!
          </p>
        </div>

        {/* Create Task Button */}
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Task
        </Button>

        {/* Streak & Stats */}
        <div className="flex gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-black text-sm">
                <Flame className="w-4 h-4 text-orange-500" /> Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-black">
                {calendarData.streak.currentStreak} days
              </div>
              <div className="text-xs text-gray-600">
                Best: {calendarData.streak.longestStreak} days
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-black text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-black">
                {calendarData.statistics.totalTasksCompleted}
              </div>
              <div className="text-xs text-gray-600">
                Total tasks
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />{" "}
                {new Date().toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Week Headers */}
              <div className="grid grid-cols-7 text-center mb-4 text-gray-700 text-sm font-medium">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3 justify-items-center">
                {Array.from({ length: totalDays }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(today.getFullYear(), today.getMonth(), day);
                  const color = getColorForDay(date);
                  const hasTask = hasTaskForDate(date);
                  
                  return (
                    <ShapeCell
                      key={day}
                      day={day}
                      color={color}
                      isToday={isToday(date)}
                      isCompleted={isCompleted(date)}
                      isFuture={isFuture(date)}
                      hasTask={hasTask}
                      onClick={() => handleDayClick(date)}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-700">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black rounded"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 rounded border border-gray-200"></div>
                  <span className="text-gray-700">No Task</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Sidebar */}
        <div className="space-y-6">
          {/* Today's Task */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black text-sm">
                <Target className="w-4 h-4" /> Today's AI Task
                <Badge variant="secondary" className="ml-2 bg-gray-100 text-black border-gray-200">
                  {calendarData.todayTasks?.length || 0}/1
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {calendarData.todayTasks?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarDays className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    No task for today. Generating one now...
                  </p>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        setRegenerating(true);
                        await axios.post(
                          "http://localhost:5000/api/calendar/regenerate-today",
                          {},
                          { withCredentials: true }
                        );
                        await fetchCalendarData();
                        toast.success("Task generated successfully!");
                      } catch (err: any) {
                        console.error("Error generating task:", err);
                        toast.error(err.response?.data?.message || "Failed to generate task");
                      } finally {
                        setRegenerating(false);
                      }
                    }}
                    disabled={regenerating}
                    className="bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/20 hover:shadow-black/30"
                  >
                    {regenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate Task
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                calendarData.todayTasks.map((task) => (
                  <TaskItem
                    key={task.taskId}
                    task={task}
                    onComplete={handleCompleteTask}
                    onRegenerate={handleRegenerateTask}
                  />
                ))
              )}

              {/* Daily Progress */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Daily Progress</span>
                  <span className="text-black font-medium">
                    {calendarData.todayTasks?.some(t => t.status === "completed") ? "100%" : "0%"}
                  </span>
                </div>
                <Progress 
                  value={calendarData.todayTasks?.some(t => t.status === "completed") ? 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Study Preferences */}
          <StudyPreferencesCard preferences={calendarData.studyPreferences} />

          {/* Statistics */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black text-sm">
                <TrendingUp className="w-4 h-4" /> Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm">Completion Rate</span>
                <span className="text-green-600 font-semibold">
                  {calendarData.statistics.completionRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm">Total Study Time</span>
                <span className="text-black font-medium">
                  {Math.round(calendarData.statistics.totalStudyTime / 60)}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm">Tasks Completed</span>
                <span className="text-black font-medium">
                  {calendarData.statistics.totalTasksCompleted}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121214] border-gray-800 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-indigo-300">Create Custom Task</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create your own task and earn XP when you complete it!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Task Title *</Label>
              <Input
                id="title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g., Review JavaScript fundamentals"
                className="bg-[#1f1f22] border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description *</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Describe what you want to accomplish..."
                rows={4}
                className="bg-[#1f1f22] border-gray-700 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-300">Date *</Label>
                <Calendar
                  mode="single"
                  selected={taskForm.date}
                  onSelect={(date) => date && setTaskForm({ ...taskForm, date })}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="bg-[#1f1f22] border-gray-700 rounded-md"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-300">Task Type</Label>
                  <Select
                    value={taskForm.type}
                    onValueChange={(value) => setTaskForm({ ...taskForm, type: value })}
                  >
                    <SelectTrigger className="bg-[#1f1f22] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f22] border-gray-700">
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-gray-300">Difficulty</Label>
                  <Select
                    value={taskForm.difficulty}
                    onValueChange={(value) => setTaskForm({ ...taskForm, difficulty: value })}
                  >
                    <SelectTrigger className="bg-[#1f1f22] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f22] border-gray-700">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                  >
                    <SelectTrigger className="bg-[#1f1f22] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f22] border-gray-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={taskForm.estimatedDuration}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedDuration: parseInt(e.target.value) || 30 })}
                    className="bg-[#1f1f22] border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <Input
                    id="category"
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    placeholder="e.g., Programming, Math"
                    className="bg-[#1f1f22] border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={creating}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;