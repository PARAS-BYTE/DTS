import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  CalendarDays,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  Target,
  ListTodo,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

// ─── Custom Shape Wrapper ───────────────────────────────
const ShapeCell = ({ day, shape, color, onAddTask, isPast }) => {
  const shapeClass = {
    circle: "rounded-full",
    square: "rounded-md",
    diamond: "clip-diamond",
    triangle: "clip-triangle",
    hexagon: "clip-hexagon",
  }[shape];

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className={`relative group w-12 h-12 flex items-center justify-center ${color} ${shapeClass} text-sm text-gray-200 font-semibold transition-all`}
    >
      <span className="z-10">{day}</span>

      {!isPast && (
        <button
          onClick={onAddTask}
          className="absolute bottom-0 right-0 p-[3px] bg-indigo-600 hover:bg-indigo-700 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        >
          <Plus className="w-3 h-3 text-white" />
        </button>
      )}
    </motion.div>
  );
};

// ─── Main Calendar Component ───────────────────────────────
const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
  });
  const [streak, setStreak] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);

  const today = new Date();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/calendar", {
          withCredentials: true,
        });
        setTasks(res.data.calendarData || []);
      } catch (err) {
        console.error("Calendar fetch error:", err);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title) return alert("Enter task title");
    try {
      setAdding(true);
      await axios.post(
        "http://localhost:5000/api/calendar/add",
        { ...newTask, date: selectedDate },
        { withCredentials: true }
      );
      setShowDialog(false);
    } catch (err) {
      console.error("Add task error:", err);
    } finally {
      setAdding(false);
    }
  };

  const isPastDate = (date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
  };

  // ─── Shape & Color Logic ───────────────────────────────
  const shapes = ["circle", "triangle", "square", "diamond", "hexagon"];
  const colors = [
    "bg-[#1f1f22]",
    "bg-indigo-900/70",
    "bg-indigo-700/70",
    "bg-indigo-600/70",
    "bg-indigo-500/70",
  ];

  const getShapeForWeek = (weekIndex) => shapes[weekIndex % shapes.length];

  const getColorForDay = (date) => {
    const completedCount = tasks.filter(
      (t) =>
        new Date(t.date).toDateString() === date.toDateString() &&
        t.status === "completed"
    ).length;
    if (completedCount >= 3) return "bg-indigo-500/80";
    if (completedCount === 2) return "bg-indigo-700/70";
    if (completedCount === 1) return "bg-indigo-900/70";
    return "bg-[#1f1f22]";
  };

  const totalDays = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  // ─── UI Rendering ───────────────────────────────
  return (
    <div className="p-8 bg-[#0b0b0d] min-h-screen text-gray-200 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2 text-indigo-300">
            <CalendarDays className="w-7 h-7" /> Study Calendar
          </h1>
          <p className="text-gray-400">
            Visualize your progress with weekly shape tracking
          </p>
        </div>

        {/* Streak Tracker */}
        <Card className="bg-gradient-to-r from-indigo-900/50 to-indigo-600/40 border-indigo-700 shadow-md w-full md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-indigo-200">
              <Flame className="w-5 h-5 text-orange-400" /> Study Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-orange-400 to-indigo-400 h-2"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((streak / Math.max(personalBest, 1)) * 100, 100)}%`,
                }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>{streak} Days</span>
              <span>Best: {personalBest}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <Card className="bg-[#121214] border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-indigo-300 text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />{" "}
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Week Headers */}
          <div className="grid grid-cols-7 text-center mb-3 text-gray-400 text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4 justify-items-center">
            {Array.from({ length: totalDays }, (_, i) => {
              const day = i + 1;
              const date = new Date(today.getFullYear(), today.getMonth(), day);
              const weekIndex = Math.floor(i / 7);
              const shape = getShapeForWeek(weekIndex);
              const color = getColorForDay(date);
              return (
                <ShapeCell
                  key={day}
                  day={day}
                  shape={shape}
                  color={color}
                  isPast={isPastDate(date)}
                  onAddTask={() => {
                    setSelectedDate(date);
                    setShowDialog(true);
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Summary Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#121214] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <Target className="w-5 h-5" /> Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Track and complete your daily goals.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#121214] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-5 h-5" /> Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 text-sm">
            Your scheduled study sessions will appear here.
          </CardContent>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#1a1a1d] text-gray-200 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Task for {selectedDate && selectedDate.toDateString()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="bg-[#101014] border-gray-700"
            />
            <Textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="bg-[#101014] border-gray-700"
            />
            <Select
              value={newTask.priority}
              onValueChange={(val) =>
                setNewTask({ ...newTask, priority: val })
              }
            >
              <SelectTrigger className="bg-[#101014] border-gray-700">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1d] border-gray-700">
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAddTask}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 🟢 Custom CSS Shapes
const style = document.createElement("style");
style.innerHTML = `
.clip-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
.clip-hexagon { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
.clip-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
`;
document.head.appendChild(style);

export default Calendar;
