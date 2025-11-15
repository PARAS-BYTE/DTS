import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Coins, RefreshCw, Star } from "lucide-react";
import { palette } from "@/theme/palette";

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
      <div className="h-[80vh] flex justify-center items-center" style={{ color: palette.text2 }}>
        Loading store...
      </div>
    );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 flex flex-col items-center" style={{ background: palette.bg, color: palette.text }}>
      {/* ─── HEADER ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl text-center mb-8 sm:mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold flex justify-center items-center gap-3 tracking-tight" style={{ color: palette.text }}>
          <Gift className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: palette.text }} /> Nova XP Store
        </h1>
        <p className="mt-1 text-sm sm:text-base" style={{ color: palette.text2 }}>
          Redeem your XP for exclusive digital & physical rewards.
        </p>
      </motion.div>

      {/* ─── XP BAR ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-8 py-4 mb-6 sm:mb-8"
        style={{ background: palette.card, border: `1px solid ${palette.border}` }}
      >
        <div className="flex items-center gap-3 text-base sm:text-lg font-semibold">
          <Coins className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: palette.text }} />
          <span style={{ color: palette.text2 }}>Your XP:</span>
          <span className="font-extrabold" style={{ color: palette.text }}>{xp}</span>
        </div>
        <Button
          onClick={fetchStore}
          className="flex items-center gap-2 w-full sm:w-auto shadow-lg"
          style={{ background: palette.accentDeep, color: palette.card }}
          onMouseEnter={(e) => e.currentTarget.style.background = palette.accent}
          onMouseLeave={(e) => e.currentTarget.style.background = palette.accentDeep}
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
            <Card className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ background: palette.card, border: `1px solid ${palette.border}` }}>
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
                <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: palette.accentDeep, color: palette.card }}>
                  {item.category}
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="p-4 space-y-2 flex flex-col justify-between h-[140px]">
                <div>
                  <CardTitle className="text-base font-semibold truncate" style={{ color: palette.text }}>
                    {item.name}
                  </CardTitle>
                  <p className="text-xs line-clamp-2 mt-1" style={{ color: palette.text2 }}>
                    {item.description}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-sm flex items-center gap-1" style={{ color: palette.text }}>
                    <Coins className="w-4 h-4" /> {item.cost} XP
                  </span>
                  <Button
                    size="sm"
                    disabled={
                      xp < item.cost || item.stock <= 0 || redeeming === item._id
                    }
                    onClick={() => handleRedeem(item._id)}
                    className="text-sm px-3 py-1"
                    style={
                      xp < item.cost || item.stock <= 0
                        ? { background: palette.border, color: palette.text2, cursor: 'not-allowed' }
                        : { background: palette.accentDeep, color: palette.card }
                    }
                    onMouseEnter={(e) => {
                      if (!(xp < item.cost || item.stock <= 0)) {
                        e.currentTarget.style.background = palette.accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(xp < item.cost || item.stock <= 0)) {
                        e.currentTarget.style.background = palette.accentDeep;
                      }
                    }}
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
        <div className="mt-8 text-center" style={{ color: palette.text2 }}>
          No items available yet. Check back later!
        </div>
      )}

      {/* ─── FOOTER ─────────────────────────── */}
      <div className="text-xs mt-12" style={{ color: palette.text2 }}>
        <Star className="inline-block w-4 h-4 mr-1" style={{ color: palette.text }} />
        Earn XP through learning & challenges to unlock these rewards.
      </div>
    </div>
  );
};

export default StorePage;
