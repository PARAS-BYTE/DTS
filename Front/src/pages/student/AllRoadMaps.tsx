import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AllRoadMaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/roadmap", {
          withCredentials: true,
        });
        setRoadmaps(res.data.roadmaps);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Roadmaps...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">All Roadmaps</h1>

      {roadmaps.length === 0 ? (
        <p className="text-center text-zinc-400">No roadmaps found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((r) => (
            <Card
              key={r._id}
              className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-900/20 transition cursor-pointer"
              onClick={() => navigate("/student/viewroadmap", { state: r._id })}
            >
              <CardHeader>
                <CardTitle className="text-xl">{r.title}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-zinc-400 mb-1">
                  Modules: {r.modules.length}
                </p>
                <p className="text-sm text-zinc-500">
                  Created: {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
