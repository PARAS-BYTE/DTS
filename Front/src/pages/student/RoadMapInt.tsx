import React, { useState } from "react";
import { Link } from "react-router-dom";
import AllRoadMaps from "./AllRoadMaps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function RoadMapInt() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  const handleAI = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token") || document.cookie.replace("jwt=", "");

      await axios.post(
        "http://localhost:5000/api/roadmap/createwithai",
        { topic, level },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      alert("AI Roadmap Created Successfully!");
      setReload(!reload);
      setTopic("");
      setLevel("");
    } catch (err) {
      console.error(err);
      alert("AI Roadmap generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Roadmaps</h1>

          <div className="flex gap-4">
            {/* Create Roadmap Button */}
            <Link
              to="/student/createroadmap"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white"
            >
              Create Roadmap
            </Link>

            {/* AI Create Button */}
            <Dialog>
              <DialogTrigger>
                <Button className="bg-green-600 hover:bg-green-500 text-white">
                  Create With AI
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-zinc-900 text-white border border-zinc-700">
                <DialogHeader>
                  <DialogTitle>Create Roadmap With AI</DialogTitle>
                </DialogHeader>

                {/* AI form */}
                <form onSubmit={handleAI} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm">Topic *</label>
                    <Input
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      placeholder="Enter topic e.g. MERN, DSA, ML..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm">Level *</label>
                    <Input
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      placeholder="Beginner / Intermediate / Advanced"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Roadmap"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* All Roadmaps Section */}
        <AllRoadMaps key={reload} />
      </div>
    </div>
  );
}
