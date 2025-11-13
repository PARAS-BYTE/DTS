import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, X, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyDUoNpxYQrAsVn9IR-QsomMOXv8C64dLfI");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface Message {
  role: "user" | "model";
  html: string;
  timestamp: Date;
  id: string;
}

// ✅ Enhanced HTML cleaning with code detection
const cleanHTML = (html: string) => {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Remove harmful elements
  temp.querySelectorAll("script, iframe, style").forEach((el) => el.remove());

  return temp.innerHTML;
};

// ✅ Extract plain text from HTML for copying
const extractTextContent = (html: string): string => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
};

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Copy to clipboard
  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // ✅ Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      html: `<div class="user-message">${input}</div>`,
      timestamp: new Date(),
      id: `user-${Date.now()}`,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const safeInput = input.replace(/`/g, "");

      const prompt = `
      You are NovaAI - a helpful AI assistant. Format your responses professionally.
      
      Guidelines:
      - Use proper HTML structure with semantic elements
      - For code: wrap in <pre><code class="language-appropriate">code here</code></pre>
      - For explanations: use clear paragraphs with <p> tags
      - Use headings <h3>, <h4> for sections
      - Use <ul> and <li> for lists
      - Add classes for styling: "code-block", "explanation", "tip", "warning"
      - NEVER use markdown or backticks
      
      User query: "${safeInput}"
      `;

      const result = await model.generateContent(prompt);

      let response =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response.";

      // ✅ Clean and format response
      response = response
        .replace(/```html|```|'''/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .trim();

      // ✅ Sanitize HTML
      response = cleanHTML(response);

      const botMsg: Message = {
        role: "model",
        html: response,
        timestamp: new Date(),
        id: `bot-${Date.now()}`,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const botMsg: Message = {
        role: "model",
        html: `<div class="text-red-400 font-semibold">Connection Error</div>
               <div class="text-red-300">Please try again in a moment.</div>`,
        timestamp: new Date(),
        id: `error-${Date.now()}`,
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-gray-100">

      {/* ✅ Enhanced Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NovaAI
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Advanced AI Assistant
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            onClick={clearChat}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ✅ Enhanced Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-gradient-to-b from-gray-900 to-gray-900/80">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "model" && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-400/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-purple-300" />
                </div>
              )}

              <div
                className={`relative group max-w-[80%] ${msg.role === "user" ? "order-2" : ""}`}
              >
                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-800/80 border border-gray-700/50 backdrop-blur-sm shadow-lg"
                  }`}
                >
                  {/* ✅ Render Sanitized HTML with Tailwind Prose */}
                  <div 
                    className={`
                      max-w-none 
                      ${msg.role === "model" ? `
                        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-200 [&_h1]:mt-4 [&_h1]:mb-2
                        [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-200 [&_h2]:mt-4 [&_h2]:mb-2
                        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-200 [&_h3]:mt-3 [&_h3]:mb-2
                        [&_p]:text-gray-300 [&_p]:my-2
                        [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-2
                        [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:my-2
                        [&_li]:text-gray-300 [&_li]:my-1
                        [&_pre]:bg-gray-900 [&_pre]:border [&_pre]:border-gray-700 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-2 [&_pre]:overflow-x-auto
                        [&_code]:text-purple-300 [&_code]:text-sm
                        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none
                        [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400
                        [&_a]:text-blue-400 [&_a]:hover:text-blue-300 [&_a]:underline
                      ` : ""}
                    `}
                    dangerouslySetInnerHTML={{ __html: msg.html }}
                  />
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-100/70" : "text-gray-500"}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>

                {/* Copy Button for ALL AI responses */}
                {msg.role === "model" && (
                  <Button
                    onClick={() => handleCopy(msg.id, extractTextContent(msg.html))}
                    variant="ghost"
                    size="sm"
                    className={`absolute -top-2 -right-2 h-8 w-8 p-0 bg-gray-900 border border-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg ${
                      copiedMessageId === msg.id 
                        ? "text-green-400 opacity-100 bg-green-900/20 border-green-500/50" 
                        : "text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-500"
                    }`}
                    title="Copy response"
                  >
                    {copiedMessageId === msg.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 text-gray-300 items-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-400/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-300" />
            </div>
            <div className="flex items-center gap-3 bg-gray-800/80 border border-gray-700/50 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-gray-300">NovaAI is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ✅ Enhanced Input Area */}
      <div className="border-t border-gray-800/50 p-4 bg-gray-900/95 backdrop-blur-sm">
        <form
          onSubmit={handleSend}
          className="flex gap-3 max-w-4xl mx-auto"
        >
          <Input
            placeholder="Message NovaAI... (Ask for code, explanations, or help)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-gray-800/80 border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />

          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/25"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        
        {/* Quick Tips */}
        <div className="text-xs text-gray-500 text-center mt-3">
          Try: "Show me a React component" or "Explain JavaScript closures"
        </div>
      </div>
    </div>
  );
};

export default ChatBot;