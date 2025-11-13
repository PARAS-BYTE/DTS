import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Coins, RefreshCw, Star } from "lucide-react";

const StorePage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const fetchStore = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/store", {
        withCredentials: true,
      });
      setItems(data.items);
      setXp(data.userXP);
    } catch (err) {
      console.error("Store fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (itemId: string) => {
    try {
      setRedeeming(itemId);
      const { data } = await axios.post(
        "http://localhost:5000/api/store/redeem",
        { itemId },
        { withCredentials: true }
      );
      alert(data.message);
      setXp(data.remainingXP);
      fetchStore();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Redeem failed.");
    } finally {
      setRedeeming(null);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  if (loading)
    return (
      <div className="h-[80vh] flex justify-center items-center text-gray-600">
        Loading store...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black py-12 px-6 flex flex-col items-center">
      {/* ─── HEADER ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold flex justify-center items-center gap-3 text-black tracking-tight">
          <Gift className="w-8 h-8 text-black" /> Nova XP Store
        </h1>
        <p className="text-gray-700 mt-1 text-base">
          Redeem your XP for exclusive digital & physical rewards.
        </p>
      </motion.div>

      {/* ─── XP BAR ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow-sm flex justify-between items-center px-8 py-4 mb-8"
      >
        <div className="flex items-center gap-3 text-lg font-semibold">
          <Coins className="w-6 h-6 text-black" />
          <span className="text-gray-700">Your XP:</span>
          <span className="text-black font-extrabold">{xp}</span>
        </div>
        <Button
          onClick={fetchStore}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/10"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </motion.div>

      {/* ─── STORE GRID ───────────────────────── */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {items.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {/* Image */}
              <CardHeader className="p-0 relative">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/300x200?text=Item+Image"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="absolute top-3 right-3 bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.category}
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="p-4 space-y-2 flex flex-col justify-between h-[140px]">
                <div>
                  <CardTitle className="text-base font-semibold text-black truncate">
                    {item.name}
                  </CardTitle>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-black font-bold text-sm flex items-center gap-1">
                    <Coins className="w-4 h-4" /> {item.cost} XP
                  </span>
                  <Button
                    size="sm"
                    disabled={
                      xp < item.cost || item.stock <= 0 || redeeming === item._id
                    }
                    onClick={() => handleRedeem(item._id)}
                    className={`text-sm px-3 py-1 ${
                      xp < item.cost || item.stock <= 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/10"
                    }`}
                  >
                    {redeeming === item._id ? "..." : "Redeem"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── EMPTY STATE ─────────────────────── */}
      {items.length === 0 && (
        <div className="text-gray-600 mt-8 text-center">
          No items available yet. Check back later!
        </div>
      )}

      {/* ─── FOOTER ─────────────────────────── */}
      <div className="text-gray-600 text-xs mt-12">
        <Star className="inline-block w-4 h-4 text-black mr-1" />
        Earn XP through learning & challenges to unlock these rewards.
      </div>
    </div>
  );
};

export default StorePage;
