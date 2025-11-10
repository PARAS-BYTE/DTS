import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, CheckCircle2, Clock } from "lucide-react";
import axios from "axios";

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "border-destructive bg-destructive/10 text-destructive";
      case "medium": return "border-warning bg-warning/10 text-warning";
      case "low": return "border-success bg-success/10 text-success";
      default: return "border-border bg-muted/30";
    }
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [tasksRes, summaryRes] = await Promise.all([
        axios.get("http://localhost:5000/api/calendar", { withCredentials: true }),
        axios.get("http://localhost:5000/api/calendar/summary", { withCredentials: true }),
      ]);
      setTasks(tasksRes.data.calendarData || []);
      setSummary({
        total: summaryRes.data.totalTasks,
        completed: summaryRes.data.completedTasks,
        pending: summaryRes.data.pendingTasks,
      });
    } catch (err) {
      console.error("Failed to fetch calendar data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendarData(); }, []);

  const handleAddTask = async () => {
    const title = prompt("Enter task title:");
    if (!title) return;
    const dueDate = prompt("Enter due date (YYYY-MM-DD):") || new Date().toISOString().split("T")[0];
    const description = prompt("Enter description:");
    const priority = prompt("Priority? (high / medium / low):", "medium");

    try {
      setAdding(true);
      await axios.post(
        "http://localhost:5000/api/calendar/add",
        { title, description, dueDate, priority },
        { withCredentials: true }
      );
      await fetchCalendarData();
    } catch (err) {
      console.error("Failed to add task", err);
    } finally {
      setAdding(false);
    }
  };

  const toggleComplete = async (taskId, status) => {
    if (status === "completed") return;
    try {
      await axios.patch(`http://localhost:5000/api/calendar/complete/${taskId}`, {}, { withCredentials: true });
      await fetchCalendarData();
    } catch (err) {
      console.error("Failed to mark task complete", err);
    }
  };

  const upcomingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  if (loading) return <p className="text-center py-20 text-muted-foreground">Loading calendar...</p>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Study Calendar</h1>
          <p className="text-muted-foreground text-lg">Plan and track your learning tasks</p>
        </div>
        <Button size="lg" className="glow-primary" onClick={handleAddTask} disabled={adding}>
          <Plus className="w-5 h-5 mr-2" />
          {adding ? "Adding..." : "Add Task"}
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const today = new Date().getDate();
                  const completed = tasks.some(t => new Date(t.date).getDate() === day && t.status === "completed");
                  return (
                    <button key={day}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm transition-all
                      ${day === today ? "bg-primary text-primary-foreground font-bold glow-primary"
                        : completed ? "bg-success/30 text-success font-medium"
                        : "hover:bg-muted"}`}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
            <CardHeader><CardTitle className="text-lg">Today's Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Tasks</span><span className="text-2xl font-bold text-primary">{summary.total}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="text-2xl font-bold text-success">{summary.completed}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="text-2xl font-bold text-warning">{summary.pending}</span></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Task Lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-warning" />Upcoming Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length === 0
              ? <p className="text-muted-foreground text-center py-8">No upcoming tasks</p>
              : upcomingTasks.map((task) => (
                <div key={task.taskId}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${getPriorityColor(task.priority)}`}
                  onClick={() => toggleComplete(task.taskId, task.status)}>
                  <h4 className="font-semibold">{task.title}</h4>
                  <p className="text-sm opacity-90 mb-2">{task.description}</p>
                  <div className="flex justify-between text-xs opacity-80">
                    <span>{task.category}</span>
                    <span>Due: {new Date(task.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" />Completed Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {completedTasks.length === 0
              ? <p className="text-muted-foreground text-center py-8">No completed tasks</p>
              : completedTasks.map((task) => (
                <div key={task.taskId} className="p-4 rounded-xl bg-success/10 border-2 border-success/30 hover:bg-success/20 transition-all">
                  <h4 className="font-semibold line-through opacity-60">{task.title}</h4>
                  <p className="text-sm opacity-60">{task.description}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
