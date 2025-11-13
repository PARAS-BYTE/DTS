import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

export default function CreateRoadmap() {
  const [title, setTitle] = useState("");
  const [modules, setModules] = useState([{ name: "", topics: [{ name: "" }] }]);

  const handleModuleChange = (index, value) => {
    const newModules = [...modules];
    newModules[index].name = value;
    setModules(newModules);
  };

  const handleTopicChange = (moduleIndex, topicIndex, value) => {
    const newModules = [...modules];
    newModules[moduleIndex].topics[topicIndex].name = value;
    setModules(newModules);
  };

  const addModule = () => {
    setModules([...modules, { name: "", topics: [{ name: "" }] }]);
  };

  const removeModule = (moduleIndex) => {
    const newModules = modules.filter((_, i) => i !== moduleIndex);
    setModules(newModules);
  };

  const addTopic = (moduleIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].topics.push({ name: "" });
    setModules(newModules);
  };

  const removeTopic = (moduleIndex, topicIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].topics = newModules[moduleIndex].topics.filter((_, i) => i !== topicIndex);
    setModules(newModules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token") || document.cookie.replace("jwt=", "");

      await axios.post(
        "http://localhost:5000/api/roadmap/create",
        { title, modules },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      alert("Roadmap created successfully!");

      setTitle("");
      setModules([{ name: "", topics: [{ name: "" }] }]);
    } catch (error) {
      alert(error.response?.data?.message || "Error creating roadmap");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-10">
      <Card className="w-full max-w-3xl bg-zinc-900 text-white shadow-xl border border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create Roadmap</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm">Roadmap Title</label>
              <Input
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="Enter roadmap title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Modules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Modules</h3>

              {modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="p-4 border border-zinc-700 rounded-xl bg-zinc-800">
                  <div className="flex items-center gap-2">
                    <Input
                      className="bg-zinc-900 border-zinc-700 text-white"
                      placeholder={`Module ${moduleIndex + 1} Name`}
                      value={module.name}
                      onChange={(e) => handleModuleChange(moduleIndex, e.target.value)}
                      required
                    />
                    {modules.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeModule(moduleIndex)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Topics */}
                  <div className="mt-4 space-y-3">
                    <h4 className="text-md font-medium">Topics</h4>

                    {module.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center gap-2">
                        <Input
                          className="bg-zinc-900 border-zinc-700 text-white"
                          placeholder={`Topic ${topicIndex + 1}`}
                          value={topic.name}
                          onChange={(e) => handleTopicChange(moduleIndex, topicIndex, e.target.value)}
                          required
                        />
                        {module.topics.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeTopic(moduleIndex, topicIndex)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      className="mt-2 bg-zinc-700 hover:bg-zinc-600"
                      onClick={() => addTopic(moduleIndex)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Topic
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                className="w-full bg-zinc-700 hover:bg-zinc-600"
                onClick={addModule}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Module
              </Button>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2">
              Create Roadmap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}