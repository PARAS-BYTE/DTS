import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "framer-motion";
import { Send, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ✅ Initialize Gemini client
const genAI = new GoogleGenerativeAI("AIzaSyBUEPkIZJIUKPpFOViYn8rMNS2KhUBuOQw");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface Message {
  role: "user" | "model";
  html: string;
}

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", html: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const safeInput = input.replace(/`/g, "\\`");

      // 🧠 Ask Gemini for pre-styled HTML content (dark theme ready)
      const prompt = `
You are NovaAI, an elegant and professional AI assistant.
Respond ONLY with fully formatted, styled HTML content (no markdown, no backticks).
The HTML you return should be visually appealing, compact, and designed for a dark theme UI.
Use TailwindCSS classes directly inside your HTML so it looks beautiful immediately.

Your goal:
- Return HTML that already includes headings, bullets, spacing, and styled code boxes.
- Code sections should appear in a compact, rounded dark box with monospace font.
- Paragraphs, lists, and headers should be nicely spaced, modern, and minimal.
- No full HTML document. Only the <div> or inner content part.

Example of your style:
<div class="space-y-3">
  <h2 class="text-xl font-semibold text-primary">Title</h2>
  <p class="text-gray-300">Some descriptive text.</p>
  <ul class="list-disc list-inside text-gray-300">
    <li>Point one</li>
    <li>Point two</li>
  </ul>
  <div class="bg-[#1a1a1a] rounded-lg p-4 font-mono text-gray-200 text-sm">
    <pre><code>console.log("Hello World")</code></pre>
  </div>
</div>

Now, respond to:
"${safeInput}"
`.trim();

      const result = await model.generateContent(prompt);
      let htmlResponse =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // 🧹 Clean up unwanted wrapping
      htmlResponse = htmlResponse
        .replace(/```|'''|<\/?html>|<\/?body>/g, "")
        .trim();

      const botMsg: Message = { role: "model", html: htmlResponse };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const botMsg: Message = {
        role: "model",
        html: `<p class="text-red-400">⚠️ Something went wrong. Please try again.</p>`,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-800 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <Bot className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-semibold text-gray-100">NovaAI Chat</h1>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-10 h-10 text-primary mb-3" />
            <p className="text-lg text-center">
              Start your conversation with{" "}
              <span className="text-primary font-medium">NovaAI</span>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex w-full ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-5 py-3 text-base leading-relaxed ${
                msg.role === "user"
                  ? "text-primary"
                  : "text-gray-200"
              }`}
              dangerouslySetInnerHTML={{ __html: msg.html }}
            />
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
            <Bot className="w-4 h-4 animate-pulse text-primary" />
            NovaAI is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-8 py-4 border-t border-gray-800 bg-[#0a0a0a]/95"
      >
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-gray-700 text-gray-200 rounded-full px-5 py-3 focus:ring-1 focus:ring-primary/40"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/80 rounded-full px-4 py-2 flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatBot;
