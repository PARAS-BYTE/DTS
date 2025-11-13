import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
    Trophy,
    ArrowLeft,
    Users,
    BarChart3,
    Target,
    List,
    Info,
} from "lucide-react";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Tooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

const BattleShow = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const battleId = state?.battleId;

    const [loading, setLoading] = useState(true);
    const [battle, setBattle] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [performance, setPerformance] = useState(null);

    // ─────────────────────────────────────────────
    // Fetch battle analysis
    // ─────────────────────────────────────────────
    useEffect(() => {
        if (!battleId) return;

        const fetchAnalysis = async () => {
            try {
                const res = await axios.post(
                    `http://localhost:5000/api/battle/analysis`,
                    { battleId },
                    { withCredentials: true }
                );

                setBattle(res.data.battle);
                setLeaderboard(res.data.leaderboard);
                setPerformance(res.data.performance);
            } catch (err) {
                console.error("❌ Battle Analysis Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [battleId]);

    if (!battleId) {
        return (
            <div className="p-10 text-center">
                <p className="text-lg text-red-500">❌ No Battle ID Provided.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-10 text-center text-muted-foreground">
                Loading battle analysis...
            </div>
        );
    }

    if (!battle) {
        return (
            <div className="p-10 text-center text-red-500">
                Failed to load battle data.
            </div>
        );
    }

    // Pie chart from leaderboard accuracy
    const accuracyPie = leaderboard.map((p, i) => ({
        name: p.username,
        value: Number(p.accuracy),
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen p-6 space-y-8 text-white bg-[#0b0b0b]"
        >
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <Trophy className="text-yellow-400 w-8 h-8" />
                        {battle.battleName}
                    </h1>
                    <p className="text-muted-foreground">
                        Battle Code: <b>{battle.battleCode}</b>
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="border-gray-600 text-gray-300"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
            </div>

            {/* TAGS */}
            <Card className="bg-[#111]/80 border-gray-800 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Tags</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {battle.tags.map((t, i) => (
                        <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-indigo-600/30 text-indigo-300 text-sm"
                        >
                            #{t}
                        </span>
                    ))}
                </CardContent>
            </Card>

            {/* STATS ROW */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-[#111]/80 border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="text-purple-400" /> Players
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-4xl font-bold">
                        {performance.totalPlayers}
                    </CardContent>
                </Card>

                <Card className="bg-[#111]/80 border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="text-blue-400" /> Highest Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-4xl text-blue-400 font-bold">
                        {performance.highestScore}
                    </CardContent>
                </Card>

                <Card className="bg-[#111]/80 border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="text-green-400" /> Average Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-4xl text-green-400 font-bold">
                        {performance.averageScore.toFixed(1)}
                    </CardContent>
                </Card>
            </div>

            {/* LEADERBOARD CHART */}
            <Card className="bg-[#111]/80 border-gray-800">
                <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer>
                        <BarChart data={leaderboard}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="username" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="score" fill="#4f46e5" />
                            <Bar dataKey="accuracy" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* ACCURACY PIE */}
            <Card className="bg-[#111]/80 border-gray-800">
                <CardHeader>
                    <CardTitle>Accuracy Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={accuracyPie}
                                outerRadius={110}
                                dataKey="value"
                                label
                            >
                                {accuracyPie.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* QUESTIONS USED */}
            <Card className="bg-[#111]/80 border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <List /> Questions Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {battle.questions.map((q, idx) => (
                        <div
                            key={idx}
                            className="p-4 bg-[#0d0d0d] rounded-lg border border-gray-800"
                        >
                            <p className="font-semibold">
                                <span className="text-indigo-400 mr-2">Q{idx + 1}:</span>
                                {q.question}
                            </p>

                            {q.questionType === "mcq" && (
                                <ul className="mt-2 text-gray-300 space-y-1">
                                    {q.options.map((op, i) => (
                                        <li key={i}>• {op}</li>
                                    ))}
                                </ul>
                            )}

                            {q.questionType === "paragraph" && (
                                <p className="mt-2 text-gray-400 italic">
                                    (Paragraph Response)
                                </p>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default BattleShow;
