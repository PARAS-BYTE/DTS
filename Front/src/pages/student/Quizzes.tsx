import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileQuestion,
  Clock,
  Zap,
  Target,
  Brain,
  Sparkles,
  Trophy,
  Loader2,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const QUIZZES_PER_PAGE = 6;

  // ─── Fetch Existing Quizzes ───────────────────────────────
  async function fetchQuizzes() {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/quiz/", {
        withCredentials: true,
      });
      if (data?.quizzes) {
        setQuizzes(data.quizzes);
        setFeatured(data.quizzes.slice(0, 3));
        setFiltered(data.quizzes);
      }
    } catch (err) {
      console.error("⚠️ Fetch Quizzes Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // ─── Handle Navigation ───────────────────────────────
  const handleNavigate = (id) => navigate("/student/takequiz", { state: id });

  // ─── Search Filter ───────────────────────────────
  useEffect(() => {
    const results = quizzes.filter((quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFiltered(results);
    setPage(1); // reset page when searching
  }, [searchQuery, quizzes]);

  // ─── Random Quiz ───────────────────────────────
  const handleRandomQuiz = () => {
    if (!quizzes.length) return alert("No quizzes available.");
    const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    navigate("/student/takequiz", { state: randomQuiz._id });
  };

  // ─── Generate AI Quiz ───────────────────────────────
  async function generateAIQuiz() {
    if (!topic.trim()) return alert("Please enter a topic.");
    setAiLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/quiz/genai",
        { topic, difficulty, numberOfQuestions: numQuestions },
        { withCredentials: true }
      );

      if (data?.quizId) {
        setShowAIDialog(false);
        navigate("/student/takequiz", { state: data.quizId });
      } else {
        alert("Something went wrong while generating quiz.");
      }
    } catch (err) {
      console.error("⚠️ AI Quiz Generation Error:", err);
      alert("Failed to generate quiz.");
    } finally {
      setAiLoading(false);
    }
  }

  // ─── Paginated Data ───────────────────────────────
  const startIndex = (page - 1) * QUIZZES_PER_PAGE;
  const endIndex = startIndex + QUIZZES_PER_PAGE;
  const displayedQuizzes = filtered.slice(startIndex, endIndex);

  const hasNext = endIndex < filtered.length;
  const hasPrev = page > 1;

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-muted-foreground">
        Loading quizzes...
      </div>
    );

  return (
    <div className="p-8 space-y-10">
      {/* ─── Header ─────────────────────────────── */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient">
          Quizzes & Assessments
        </h1>
        <p className="text-muted-foreground text-lg">
          Test your skills and boost your XP
        </p>
      </div>

      {/* ─── Search ─────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search quizzes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* ─── Quiz Modes ─────────────────────────── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Random Quiz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 hover:scale-105 transition-transform cursor-pointer glow-accent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-secondary" />
                Random Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Start a random quiz instantly from the available ones.
              </p>
              <Button
                variant="outline"
                className="w-full hover:bg-secondary/10"
                onClick={handleRandomQuiz}
              >
                Surprise Me
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Quiz Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-yellow-200/20 to-yellow-50 border-yellow-300/40 hover:scale-105 transition-transform cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-yellow-600" />
                    AI Quiz Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Instantly create a new quiz using AI on your chosen topic.
                  </p>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                    Generate Quiz
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>

            {/* Dialog */}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-yellow-600" />
                  Generate AI Quiz
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Topic</label>
                  <input
                    className="w-full border p-2 rounded-md mt-1"
                    placeholder="e.g., Data Structures"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <select
                    className="w-full border p-2 rounded-md mt-1"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded-md mt-1"
                    min="5"
                    max="20"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAIDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center gap-2"
                    onClick={generateAIQuiz}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      "Generate Quiz"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {/* ─── Featured Quizzes ─────────────────────── */}
      {featured.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" /> Featured Quizzes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((quiz, i) => (
              <motion.div
                key={quiz._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card
                  className="border-primary/30 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => handleNavigate(quiz._id)}
                >
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {quiz.category} • {quiz.level}
                    </p>
                  </CardHeader>
                  <CardContent className="flex justify-between text-sm text-muted-foreground">
                    <span>{quiz.totalMarks} Marks</span>
                    <span>{quiz.timeLimit} min</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Paginated Quizzes ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">All Quizzes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <Card
                className="hover:scale-105 transition-transform cursor-pointer hover:border-primary/50"
                onClick={() => handleNavigate(quiz._id)}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                    <FileQuestion className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {quiz.course?.title || quiz.category}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="w-4 h-4" />
                      <span>{quiz.totalMarks} Marks</span>
                    </div>
                  </div>
                  <Button className="w-full glow-primary">Start Quiz</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-8">
          {hasPrev && (
            <Button variant="outline" onClick={() => setPage(page - 1)}>
              Previous
            </Button>
          )}
          {hasNext && (
            <Button variant="outline" onClick={() => setPage(page + 1)}>
              Next
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Quizzes;
