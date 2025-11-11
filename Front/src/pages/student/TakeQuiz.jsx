import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, RefreshCw, XCircle } from "lucide-react";

const TakeQuiz = () => {
  const { state: quizId } = useLocation();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);

  // ─── Fetch Quiz Data ───────────────────────────────
  async function fetchQuiz() {
    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:5000/api/quiz/single",
        { id: quizId },
        { withCredentials: true }
      );
      setQuiz(data);
      setTimeLeft(data.timeLimit * 60);
      setStartTime(Date.now());
    } catch (err) {
      console.error("❌ Fetch Quiz Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuiz();
  }, []);

  // ─── Timer Logic ───────────────────────────────
  useEffect(() => {
    if (!timeLeft || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // ─── Handle Option Select ─────────────────────
  const handleOptionSelect = (qId, optionIndex) => {
    if (submitted) return;
    setError("");
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex + 1, // store as 1-based index
    }));
  };

  // ─── Submit Quiz ──────────────────────────────
  const handleSubmit = async(auto = false) => {
    if (!quiz || submitted) return;

    const totalQuestions = quiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions && !auto) {
      setError(`⚠️ Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    // ─── Calculate Time Taken ─────────────────────
    const endTime = Date.now();
    const diffSec = Math.round((endTime - startTime) / 1000);
    const formattedTime = `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;

    // ─── Prepare Submission Data ─────────────────
    const selectedArray = quiz.questions.map((q) =>
      answers[q.id] ? answers[q.id] : null
    );

    const submission = {
      selected: selectedArray,
      timeTaken: formattedTime,
      quizId :quizId,
    };

    console.log("🧾 Final Submission Object:", submission);

    //  Final submmision 
    try{
        let some=await axios.post("http://localhost:5000/api/quiz/evaluate",submission,{withCredentials:true})
        // console.log(some)
        navigate("/student/quizresult",{state:some.data})
    }catch(err){
        console.log(err)
    }






    setSubmissionData(submission);
    setSubmitted(true);
  };

  // ─── Retake Quiz ──────────────────────────────
  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setSubmitted(false);
    setError("");
    setTimeLeft(quiz.timeLimit * 60);
    setStartTime(Date.now());
    setSubmissionData(null);
  };

  // ─── Format Timer ─────────────────────────────
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ─── Loading ───────────────────────────
  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-muted-foreground">
        Loading quiz...
      </div>
    );

  if (!quiz)
    return (
      <div className="flex justify-center items-center h-[80vh] text-destructive">
        Quiz not found.
      </div>
    );

  // ─── After Submission ────────────────────────
  if (submitted)
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-3xl font-bold">Quiz Submitted!</h2>
        <p className="text-muted-foreground">
          Time taken: <strong>{submissionData?.timeTaken}</strong>
        </p>

        <div className="bg-muted/20 p-4 rounded-lg w-full max-w-md text-left">
          <h3 className="font-semibold mb-2 text-primary">Submitted Answers:</h3>
          <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto">
            {JSON.stringify(submissionData, null, 2)}
          </pre>
        </div>

        <Button onClick={handleRetake} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retake Quiz
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/student/quizzes")}
          className="mt-2"
        >
          Back to Quizzes
        </Button>
      </div>
    );

  // ─── Active Quiz ─────────────────────────────
  const q = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Clock className="w-5 h-5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <XCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Question */}
      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">{q.questionText}</p>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <Button
                  key={i}
                  variant={answers[q.id] === i + 1 ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleOptionSelect(q.id, i)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <Button onClick={() => handleSubmit(false)} className="bg-green-500 text-white">
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            className="bg-primary text-white"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
