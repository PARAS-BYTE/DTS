import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sword,
  BookOpen,
  Clock,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUIZ_API = "http://localhost:5000/api/quiz/getquizattempts";
const BATTLE_API = "http://localhost:5000/api/battle/battlehist";

const PerformanceHistory = () => {
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const [quizRes, battleRes] = await Promise.all([
          axios.get(QUIZ_API, { withCredentials: true }),
          axios.get(BATTLE_API, { withCredentials: true }),
        ]);
        setQuizAttempts(quizRes.data.attempts || []);
        // backend returns cleaned history as "battles"
        setBattles(battleRes.data.battles || []);
      } catch (err) {
        console.error("❌ History Fetch Error:", err);
        setError("Failed to load your history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filterBySearch = (name) =>
    (name || "").toLowerCase().includes(searchQuery.toLowerCase());

  const filteredQuizzes = quizAttempts.filter((a) =>
    filterBySearch(a.quizTitle || a.resultData?.quizTitle)
  );
  const filteredBattles = battles.filter((b) =>
    filterBySearch(b.battleName)
  );

  const openQuizAnalysis = (resultData) =>
    navigate("/student/quizresult", { state: resultData });

  const openBattleAnalysis = (battle) => {
    // Build the exact state expected by Summary.jsx (new format)
    const analytics = {
      rank: battle.rank ?? battle.performance?.rank ?? null,
      totalPlayers: battle.totalPlayers ?? battle.performance?.totalPlayers ?? (battle.performance ? (battle.performance.totalPlayers || 0) : 0),
      highestScore: battle.performance?.highestScore ?? 0,
      lowestScore: battle.performance?.lowestScore ?? 0,
      averageScore: battle.performance?.averageScore ?? 0,
      totalQuestions: battle.totalQuestions ?? battle.completedQuestions ?? (battle.performance?.totalQuestions ?? 0),
      tagWisePerformance: battle.tagWisePerformance ?? battle.performance?.tagWisePerformance ?? [],
    };

    const userPerformance = {
      totalScore: battle.totalScore ?? battle.performance?.userScore ?? 0,
      correctCount: battle.correctCount ?? battle.performance?.correctCount ?? 0,
      incorrectCount: battle.incorrectCount ?? battle.performance?.incorrectCount ?? 0,
      completedQuestions: battle.completedQuestions ?? battle.performance?.completedQuestions ?? 0,
      accuracy: Number(((battle.accuracy ?? battle.performance?.accuracy ?? 0)).toFixed(1)),
      timeline: battle.timeline ?? battle.performance?.timeline ?? [],
      tagWisePerformance: battle.tagWisePerformance ?? battle.performance?.tagWisePerformance ?? [],
      paragraphFeedback: battle.paragraphFeedback ?? battle.performance?.paragraphFeedback ?? [],
    };

    const players = (battle.players || battle.performance?.leaderboard || []).map((p) => ({
      username: p.username || p.user || "Unknown",
      score: p.score ?? p.points ?? 0,
      accuracy: Number((p.accuracy ?? 0)),
    }));

    navigate("/student/summary", {
      state: {
        analytics,
        userPerformance,
        players,
      },
    });
  };

  // Small card helpers
  const safeNumber = (v) => (v === undefined || v === null ? "N/A" : v);

  return (
    <div className="p-8 min-h-screen" style={{ background: "#0f0f11" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-1 text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-500" />
              Performance History
            </h1>
            <p className="text-sm text-gray-400">
              Review your performance in quizzes and battles
            </p>
          </div>

          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="pl-10 bg-[#141414] text-gray-200 border-gray-700"
              />
            </div>
          </div>
        </div>

        {loading && (
          <p className="text-center text-gray-400">Loading your history...</p>
        )}
        {error && <p className="text-center text-red-400">{error}</p>}

        {!loading && filteredQuizzes.length === 0 && filteredBattles.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <Info className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p>No history found yet.</p>
          </div>
        )}

        {/* Quiz History (UNCHANGED) */}
        {filteredQuizzes.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-10 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-indigo-500" />
                <h2 className="text-2xl font-bold text-white">Quiz History</h2>
              </div>
              <p className="text-sm text-gray-400">
                You’ve attempted {filteredQuizzes.length} quizzes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((attempt, index) => {
                const result = attempt.resultData || {};
                const isDetailed = !!result.totalQuestions;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                  >
                    <Card
                      className="h-full transform hover:scale-[1.02] transition-transform"
                      style={{ background: "#1a1a1c", borderColor: "rgba(99,102,241,0.08)" }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-500" />
                          {attempt.quizTitle || result.quizTitle || "Untitled Quiz"}
                        </CardTitle>
                        <p className="text-sm text-gray-400">
                          {new Date(attempt.attemptedOn || attempt.attemptDate).toLocaleString()}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-3 text-sm text-gray-300">
                        {isDetailed ? (
                          <div className="space-y-1">
                            <p className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              Correct: <b>{result.correctCount}</b> |{" "}
                              <XCircle className="w-4 h-4 text-red-400" /> Wrong: <b>{result.wrongCount}</b>
                            </p>
                            <p className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-400" />
                              Accuracy: <b>{result.accuracy}%</b>
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-400" />
                              Time: <b>{result.timeTaken ? `${result.timeTaken} mins` : "N/A"}</b>
                            </p>
                          </div>
                        ) : (
                          <p className="italic text-gray-400 flex items-center gap-2 mt-2">
                            <Info className="w-4 h-4" />
                            Old attempt — no detailed analysis
                          </p>
                        )}

                        <div className="pt-3">
                          <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => openQuizAnalysis(result)}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" /> View Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Battle History */}
        {filteredBattles.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-10 mb-3">
              <div className="flex items-center gap-2">
                <Sword className="w-7 h-7 text-indigo-500" />
                <h2 className="text-2xl font-bold text-white">Battle History</h2>
              </div>
              <p className="text-sm text-gray-400">
                You’ve fought {filteredBattles.length} battles
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBattles.map((battle, index) => {
                // normalize fields safely
                const performance = battle.performance || {};
                const totalScore = battle.totalScore ?? performance.userScore ?? 0;
                const accuracy = Number((battle.accuracy ?? performance.accuracy ?? 0).toFixed(1));
                const totalQuestions = battle.totalQuestions ?? battle.completedQuestions ?? performance.totalQuestions ?? 0;
                const totalPlayers = battle.totalPlayers ?? performance.totalPlayers ?? (performance.leaderboard ? performance.leaderboard.length : "N/A");
                const avgScore = performance.averageScore ?? 0;
                const highest = performance.highestScore ?? 0;
                const lowest = performance.lowestScore ?? 0;
                const date = battle.date ? new Date(battle.date).toLocaleString() : "Unknown";

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                  >
                    <Card
                      className="h-full transform hover:scale-[1.02] transition-transform"
                      style={{ background: "#1a1a1c", borderColor: "rgba(99,102,241,0.08)" }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-indigo-500" />
                          {battle.battleName || "Untitled Battle"}
                        </CardTitle>
                        <p className="text-sm text-gray-400">{date}</p>
                      </CardHeader>

                      <CardContent className="space-y-3 text-sm text-gray-300">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Score: <b>{safeNumber(totalScore)}</b> / <b>{safeNumber(highest)}</b>
                          </p>
                          <p className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-400" />
                            Accuracy: <b>{safeNumber(accuracy)}%</b>
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            Total Questions: <b>{safeNumber(totalQuestions)}</b>
                          </p>
                          <p className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            Total Players: <b>{safeNumber(totalPlayers)}</b>
                          </p>
                        </div>

                        <div className="mt-2 text-gray-400 text-sm italic">
                          Avg Score: {avgScore ? Number(avgScore).toFixed(1) : "N/A"} | High: {highest || "N/A"} | Low: {lowest || "N/A"}
                        </div>

                        <div className="pt-3">
                          <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => openBattleAnalysis(battle)}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" /> View Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceHistory;
