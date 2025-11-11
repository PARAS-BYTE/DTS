import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  Clock,
  Target,
  Brain,
  CheckCircle,
  XCircle,
  Info,
  Search,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const History = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/quiz/getquizattempts";

  // ─── Fetch Quiz Attempts ─────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(API_URL, {
          withCredentials: true,
        });
        setAttempts(data.attempts || []);
      } catch (err) {
        console.error("❌ History Fetch Error:", err);
        setError("Failed to load quiz history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // ─── Filtered by search ─────────────────────────────────────────────
  const filteredAttempts = attempts.filter((a) =>
    (a.quizTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Navigate to analysis page ─────────────────────────────────────
  const openAnalysis = (resultData) => {
    navigate("/student/quizresult", { state: resultData });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Quiz History
        </h1>
        <p className="text-muted-foreground text-lg">
          Review your previous quiz performances
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search quiz titles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading & Error States */}
      {loading && (
        <p className="text-center text-muted-foreground">Loading your history...</p>
      )}
      {error && <p className="text-center text-destructive">{error}</p>}

      {/* No data */}
      {!loading && filteredAttempts.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No quiz attempts found yet.</p>
        </div>
      )}

      {/* History Cards */}
      {!loading && filteredAttempts.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttempts.map((attempt, index) => {
            const result = attempt.resultData || {};
            const isDetailed = !!result.totalQuestions;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:scale-105 transition-transform hover:glow-primary border-primary/20 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      {attempt.quizTitle || result.quizTitle || "Untitled Quiz"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        attempt.attemptedOn || attempt.attemptDate
                      ).toLocaleString()}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <p>
                        <strong>Category:</strong> {attempt.category || "N/A"}
                      </p>
                      <p>
                        <strong>Level:</strong> {attempt.level || "N/A"}
                      </p>
                    </div>

                    {isDetailed ? (
                      <div className="mt-2 space-y-1 text-gray-700">
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Correct: <b>{result.correctCount}</b> |{" "}
                          <XCircle className="w-4 h-4 text-red-600" /> Wrong:{" "}
                          <b>{result.wrongCount}</b>
                        </p>
                        <p className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          Accuracy: <b>{result.accuracy}%</b> |{" "}
                          <Brain className="w-4 h-4 text-purple-500" /> XP:{" "}
                          <b>{result.xpGained}</b>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" /> Time:{" "}
                          <b>
                            {result.timeTaken
                              ? `${result.timeTaken} mins`
                              : "N/A"}
                          </b>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm italic text-gray-500 flex items-center gap-2 mt-2">
                        <Info className="w-4 h-4" />
                        Old attempt — no detailed analysis
                      </p>
                    )}

                    {/* Button */}
                    <div className="pt-4">
                      <Button
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => openAnalysis(result)}
                      >
                        <BarChart3 className="w-4 h-4" /> View Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
