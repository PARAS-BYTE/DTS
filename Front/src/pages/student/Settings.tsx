import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Image,
  Settings,
  Save,
  BarChart2,
  Brain,
  CheckCircle2,
  Star,
  Award,
  Zap,
} from "lucide-react";

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/auth/getuserprofile",
        { withCredentials: true }
      );
      setUser(data);
      setEditData({
        username: data.username,
        name: data.name,
        avatarUrl: data.avatarUrl,
        learningPreferences: data.learningPreferences || {},
        email: data.email,
      });
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (key, value) => {
    setEditData({
      ...editData,
      learningPreferences: {
        ...editData.learningPreferences,
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/update",
        editData,
        { withCredentials: true }
      );
      setMessage(data.message);
      setUser(data.user);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="h-[80vh] flex justify-center items-center text-gray-400">
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="h-[80vh] flex justify-center items-center text-red-400">
        Failed to load profile.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-12 px-6">
      {/* ─── TOP XP SUMMARY ─────────────────────── */}
      <div className="w-full max-w-5xl bg-gray-900/80 border border-gray-800 rounded-2xl shadow-lg mb-8">
        <div className="grid md:grid-cols-3 text-center p-6 gap-4">
          {[
            { icon: Star, label: "Level", value: user.level },
            { icon: Zap, label: "XP", value: user.xp },
            { icon: Award, label: "Coins", value: user.coins },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-lg text-white">
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MAIN PROFILE SECTION ─────────────────────── */}
      <Card className="w-full max-w-5xl bg-gray-900/60 border border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
            <User className="w-6 h-6 text-blue-400" /> Profile Overview
          </CardTitle>
        </CardHeader>

        <CardContent className="grid lg:grid-cols-[1fr_2fr] gap-10 p-8">
          {/* ─── LEFT: AVATAR + INFO ─────────────── */}
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="relative">
              <img
                src={
                  editData.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Avatar"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-600 shadow-lg"
              />
            </div>
            <h2 className="text-xl font-semibold">{user.name || user.username}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>

            <div className="flex gap-3 text-center text-gray-300">
              <div>
                <p className="text-sm">Focus</p>
                <p className="text-lg font-bold text-blue-400">{user.focusScore}</p>
              </div>
              <div>
                <p className="text-sm">Accuracy</p>
                <p className="text-lg font-bold text-green-400">
                  {user.accuracyScore}
                </p>
              </div>
              <div>
                <p className="text-sm">Mastery</p>
                <p className="text-lg font-bold text-yellow-400">
                  {user.masteryScore}
                </p>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: EDIT FORM ─────────────── */}
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-blue-400" /> Username
              </label>
              <Input
                name="username"
                value={editData.username || ""}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-green-400" /> Email
              </label>
              <Input
                name="email"
                value={editData.email || ""}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Image className="w-4 h-4 text-purple-400" /> Avatar URL
              </label>
              <Input
                name="avatarUrl"
                value={editData.avatarUrl || ""}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>

            {/* Preferences */}
            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-400 mb-3">
                <Settings className="w-4 h-4" /> Learning Preferences
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Pace</label>
                  <select
                    value={editData.learningPreferences?.pace || "moderate"}
                    onChange={(e) =>
                      handlePreferenceChange("pace", e.target.value)
                    }
                    className="w-full bg-gray-800 text-gray-100 border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <option value="slow">Slow</option>
                    <option value="moderate">Moderate</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Preferred Topics
                  </label>
                  <Input
                    value={(editData.learningPreferences?.preferredTopics || []).join(", ")}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "preferredTopics",
                        e.target.value.split(",").map((v) => v.trim())
                      )
                    }
                    className="bg-gray-800 border-gray-700 text-gray-100"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-sm text-gray-400 mb-1 block">
                  Weak Areas
                </label>
                <Input
                  value={(editData.learningPreferences?.weakAreas || []).join(", ")}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "weakAreas",
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <div className="flex justify-center pb-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 mt-4 flex items-center gap-2 ${
              saving
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {message && (
          <p className="text-center text-green-400 pb-4">{message}</p>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;
