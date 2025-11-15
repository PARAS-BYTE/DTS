// Revamped UI for NovaAI ChatBot
// Modern, clean layout with better spacing, smoother card structure, and improved message bubbles.
// (Modify as needed — functionality unchanged.)

import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, X, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const palette = {
  bg: "#F7F5FF",
  card: "#FFFFFF",
  cardHover: "#F1ECFF",

  text: "#3B2F5D",
  text2: "#6B5E85",

  accent: "#A78BFA",
  accentSoft: "#DDD5FF",
  accentDeep: "#7C5BDA",

  border: "#E5E1F7",

  chartLine: "#A78BFA",
  chartFill: "rgba(167,139,250,0.18)",
  chartGrid: "#E5E1F7",

  progressTrack: "#EDE8FF",
  progressFill: "#A78BFA"
};

const genAI = new GoogleGenerativeAI("AIzaSyDC6HWxmBj68kwblUM0hfFdizoqcBQ5Lw4");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const cleanHTML = (html) => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  temp.querySelectorAll("script, iframe, style").forEach((el) => el.remove());
  return temp.innerHTML;
};

const extractText = (html) => {
  const t = document.createElement("div");
  t.innerHTML = html;
  return t.textContent;
};

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      role: "user",
      html: `<p>${input}</p>`,
      id: Date.now(),
      time: new Date(),
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const prompt = `You are NovaAI. Reply using pure HTML tags only.`;
      const res = await model.generateContent(prompt + input);
      let out = res.response.candidates?.[0]?.content?.parts?.[0]?.text || "Error.";
      out = cleanHTML(out);

      setMessages((p) => [...p, { role: "model", html: out, id: Date.now(), time: new Date() }]);
    } catch (err) {
      setMessages((p) => [...p, { role: "model", html: "<p>Something went wrong.</p>", id: Date.now(), time: new Date() }]);
    }

    setLoading(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-screen" style={{ background: palette.bg, color: palette.text }}>

      {/* HEADER */}
      <header className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: palette.border, background: palette.surface }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: palette.accent }}>
            <Bot className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">NovaAI</h1>
            <p className="text-xs" style={{ color: palette.textSoft }}>Smart AI Assistant</p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button onClick={clearChat} className="rounded-lg px-3 py-2" variant="ghost">
            <X />
          </Button>
        )}
      </header>

      {/* MESSAGES */}
      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>

              <div className="max-w-[75%]">
                <div
                  className="p-4 rounded-2xl shadow-sm border"
                  style={{
                    background: m.role === "user" ? palette.accent : palette.surface,
                    color: m.role === "user" ? "white" : palette.text,
                    borderColor: palette.border,
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: m.html }} className="prose text-sm max-w-none" />
                  <div className="text-[10px] mt-2 opacity-70">{m.time.toLocaleTimeString()}</div>
                </div>

                {/* COPY */}
                {m.role === "model" && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(extractText(m.html));
                      setCopiedId(m.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    className="mt-1 text-xs flex items-center gap-1 opacity-60 hover:opacity-100"
                  >
                    {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />} Copy
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center gap-3 opacity-70"><Loader2 className="animate-spin" /> Thinking...</div>
        )}

        <div ref={endRef} />
      </main>

      {/* INPUT */}
      <footer className="p-4 border-t" style={{ borderColor: palette.border, background: palette.surface }}>
        <form onSubmit={sendMsg} className="flex gap-3 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl"
          />
          <Button type="submit" className="rounded-xl px-4" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </footer>

    </div>
  );
}
