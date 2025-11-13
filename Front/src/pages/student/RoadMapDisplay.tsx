import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function RoadMapDisplay() {
  const { state } = useLocation(); // state = roadmapId
  const roadmapId = state;
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/roadmap/${roadmapId}`, {
          withCredentials: true,
        });
        setRoadmap(res.data.roadmap);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [roadmapId]);

  if (loading) return <div className="text-white text-center mt-10">Loading roadmap...</div>;

  if (!roadmap) return <div className="text-white text-center mt-10">Roadmap not found.</div>;

  return (
    <div className="min-h-screen bg-black p-10 text-white flex justify-center">
      <Card className="max-w-4xl w-full bg-zinc-900 border-zinc-800 shadow-xl p-6">
        <CardContent>
          <h1 className="text-3xl font-bold text-center mb-10">{roadmap.title}</h1>

          {/* Vertical connected roadmap */}
          <div className="relative">

            <div className="absolute left-5 top-0 bottom-0 w-1 bg-zinc-700"></div>

            {roadmap.modules.map((module, mIndex) => (
              <div key={mIndex} className="relative mb-10 pl-12">
                
                {/* Dot */}
                <div className="absolute left-3.5 w-4 h-4 bg-blue-500 rounded-full"></div>

                {/* Module Title */}
                <h2 className="text-xl font-semibold mb-4">{module.name}</h2>

                {/* Topics */}
                <div className="ml-4 border-l border-zinc-700 pl-6">
                  {module.topics.map((topic, tIndex) => (
                    <div key={tIndex} className="mb-3 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <p className="text-md">{topic.name}</p>
                    </div>
                  ))}
                </div>

              </div>
            ))}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
