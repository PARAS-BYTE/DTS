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
import BackButton from "@/components/BackButton";

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
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="mb-6">
          <BackButton to="/student/courses" label="Back to Courses" />
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">Roadmaps</h1>

          <div className="flex gap-4">
            {/* Create Roadmap Button */}
            <Link
              to="/student/createroadmap"
              className="px-4 py-2 bg-black hover:bg-gray-800 rounded-md text-white shadow-lg shadow-black/20 hover:shadow-black/30 transition-all"
            >
              Create Roadmap
            </Link>

            {/* AI Create Button */}
            <Dialog>
              <DialogTrigger>
                <Button className="bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/20 hover:shadow-black/30">
                  Create With AI
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-white text-black border border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-black">Create Roadmap With AI</DialogTitle>
                </DialogHeader>

                {/* AI form */}
                <form onSubmit={handleAI} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-700">Topic *</label>
                    <Input
                      className="bg-white border-gray-300 text-black mt-1 focus:border-black focus:ring-black/20"
                      placeholder="Enter topic e.g. MERN, DSA, ML..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Level *</label>
                    <Input
                      className="bg-white border-gray-300 text-black mt-1 focus:border-black focus:ring-black/20"
                      placeholder="Beginner / Intermediate / Advanced"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/20 hover:shadow-black/30"
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
