import React, { useState } from "react";
import axios from "axios";
import { Youtube, Layers, FileText, Library, GraduationCap } from "lucide-react";

const CreateCourseFromPlaylist = () => {
  const [formData, setFormData] = useState({
    playlistUrl: "",
    title: "",
    description: "",
    category: "Programming",
    level: "Beginner",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/courses/ytcr",
        formData
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to create course from playlist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex items-center gap-3 text-blue-500 mb-2">
          <Youtube className="w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Create Course from Playlist
          </h1>
        </div>
        <p className="text-gray-400 max-w-xl">
          Generate a structured course automatically from any public YouTube
          playlist.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800 w-full max-w-lg space-y-6"
      >
        {/* Playlist URL */}
        <div>
          <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
            <Youtube className="w-4 h-4 text-blue-400" /> Playlist URL *
          </label>
          <input
            type="text"
            name="playlistUrl"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={formData.playlistUrl}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
            <Layers className="w-4 h-4 text-green-400" /> Course Title
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Mastering React with YouTube"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
            <FileText className="w-4 h-4 text-yellow-400" /> Description
          </label>
          <textarea
            name="description"
            rows="3"
            placeholder="Briefly describe the course..."
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          ></textarea>
        </div>

        {/* Category & Level */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
              <Library className="w-4 h-4 text-purple-400" /> Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
              <GraduationCap className="w-4 h-4 text-pink-400" /> Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-2 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
          }`}
        >
          {loading ? "Creating Course..." : "Generate Course"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-10 w-full max-w-2xl bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" /> Course Created Successfully
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <strong>Title:</strong> {result.course.title}
            </p>
            <p>
              <strong>Modules:</strong> {result.totalModules}
            </p>
            <p>
              <strong>Total Videos:</strong> {result.totalVideos}
            </p>
            <p className="text-gray-500 text-sm pt-2">
              Course ID:{" "}
              <span className="text-gray-400">{result.course._id}</span>
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 mt-6 font-medium text-sm">{error}</p>
      )}
    </div>
  );
};

export default CreateCourseFromPlaylist;
