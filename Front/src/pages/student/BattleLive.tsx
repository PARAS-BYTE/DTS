import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Timer, Sword, ChevronRight, SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import axios from "axios";

const BattleGround = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const battleData = state?.battleData;
  const username = state?.username || localStorage.getItem("username");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionLocked, setQuestionLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null); // ⏱️ Start tracking

  const progressRef = useRef<HTMLDivElement | null>(null);
  const questions = battleData?.questions || [];
  const currentQuestion = questions[currentIndex];

  // ⏱️ Timer per question type
  const getTimeLimit = (type: string) => (type === "mcq" ? 60 : 150);

  // 🎞️ Animate progress bar
  const animateProgressBar = (duration: number) => {
    if (!progressRef.current) return;
    gsap.killTweensOf(progressRef.current);
    gsap.fromTo(
      progressRef.current,
      { width: "100%" },
      {
        width: "0%",
        duration,
        ease: "linear",
        onComplete: () => handleNext(true),
      }
    );
  };

  // 🕒 Timer countdown
  useEffect(() => {
    if (!currentQuestion) return;
    const duration = getTimeLimit(currentQuestion.questionType);
    setTimeLeft(duration);
    animateProgressBar(duration);
    setQuestionLocked(false);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // ⚙️ Initial load setup
  useEffect(() => {
    if (battleData && questions.length > 0) {
      localStorage.setItem("battleData", JSON.stringify(battleData));
      localStorage.setItem("username", username || "");
      setStartTime(Date.now()); // ✅ Start tracking time
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [battleData]);

  // 🚀 Move to next question
  const handleNext = (auto = false) => {
    if (questionLocked) return;
    const question = currentQuestion;
    if (!question) return;

    const newAnswer = {
      questionId: question._id,
      questionText: question.question,
      questionType: question.questionType,
      answer: auto ? "⏰ Time Up (No Response)" : selectedAnswer || "Skipped",
      timeTaken: getTimeLimit(question.questionType) - timeLeft,
      isAuto: auto,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setSelectedAnswer("");
    setQuestionLocked(true);

    if (currentIndex + 1 < questions.length) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 400);
    } else {
      handleSubmit([...answers, newAnswer]);
    }
  };

  // 🧾 Submit final answers to backend
  const handleSubmit = async (finalAnswers: any[]) => {
    setIsSubmitting(true);
    toast({ description: "Submitting your battle results..." });

    try {
      const endTime = Date.now();
      const completionTime = Math.floor((endTime - (startTime || endTime)) / 1000); // ⏱️ in seconds

      const payload = {
        battleId: battleData?.battleId, // ✅ send battle id
        username: username,
        answers: finalAnswers, // ✅ send all answers
        completionTime, // ✅ total time spent
      };

      const response = await axios.post("http://localhost:5000/api/battle/evaluate", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // ✅ include cookies/session
      });

      toast({ description: "✅ Battle evaluated successfully!" });
      localStorage.removeItem("battleData");

      navigate("/student/summary", {
        state: response.data
      });
    } catch (error: any) {
      console.error("❌ Evaluation error:", error);
      toast({
        description: "Failed to submit answers. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🧩 Render current question
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.questionType === "mcq") {
      return (
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
        >
          {currentQuestion.options?.map((opt: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center space-x-3 border p-3 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-accent/60 transition"
            >
              <RadioGroupItem value={opt} id={`opt-${i}`} />
              <Label htmlFor={`opt-${i}`}>{opt}</Label>
            </motion.div>
          ))}
        </RadioGroup>
      );
    } else if (currentQuestion.questionType === "paragraph") {
      return (
        <motion.textarea
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full p-4 border rounded-2xl bg-background/60 backdrop-blur-md focus:ring-2 focus:ring-primary text-sm min-h-[160px] resize-none shadow-sm"
          placeholder="Write your answer here..."
          value={selectedAnswer}
          onChange={(e) => setSelectedAnswer(e.target.value)}
        />
      );
    }
  };

  // 🧭 Navbar
  const renderNavbar = () => (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-primary text-white py-3 px-6 flex justify-between items-center shadow-md"
    >
      <div className="flex items-center space-x-2">
        <Sword className="w-6 h-6" />
        <span className="font-semibold text-lg">{battleData?.battleName}</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Timer className="w-5 h-5" />
          <span className="text-sm font-medium">
            {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <span className="text-sm">
          Q {currentIndex + 1}/{questions.length}
        </span>
      </div>
    </motion.nav>
  );

  // 🌀 Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-lg text-muted-foreground">Preparing your battle arena...</p>
      </div>
    );
  }

  // ⚠️ No Questions
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-muted-foreground">
        No questions found for this battle.
      </div>
    );
  }

  // 🧠 Main Render
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {renderNavbar()}

      {/* Progress Bar */}
      <div className="relative h-2 w-full bg-muted/30">
        <motion.div
          ref={progressRef}
          className="absolute top-0 left-0 h-full bg-primary rounded-r-full"
        />
      </div>

      {/* Question Section */}
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <motion.div
          key={currentQuestion?._id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-3xl"
        >
          <Card className="border-primary/40 shadow-xl bg-background/70 backdrop-blur-md">
            <CardHeader>
              <h2 className="text-xl font-semibold mb-2 leading-snug">
                {currentQuestion?.question}
              </h2>
            </CardHeader>

            <CardContent className="space-y-6">
              {renderQuestion()}

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => handleNext(false)}
                  disabled={questionLocked || isSubmitting}
                  className="flex items-center space-x-2"
                >
                  {currentIndex + 1 === questions.length ? (
                    <>
                      <SendHorizontal className="w-4 h-4" />
                      <span>{isSubmitting ? "Submitting..." : "Finish"}</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span>Next</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default BattleGround;
