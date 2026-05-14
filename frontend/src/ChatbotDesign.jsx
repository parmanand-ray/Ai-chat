import { useEffect, useRef, useState } from "react";

export default function ChatbotDesign() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! Main aapki kaise help kar sakta hoon?",
      time: getTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function getTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: input,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: data.message.replace(/\*\*/g, ""),
        time: getTime(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: error.message || "Server se connect nahi ho pa raha.",
        time: getTime(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[640px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-lg">
            AI
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold leading-tight">
               Chat Bot
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Online now
            </div>
          </div>

          <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-xl">
            ⋮
          </button>
        </div>

        {/* Chat Body */}
        <div
          ref={chatBodyRef}
          className="flex-1 bg-slate-50 px-4 py-5 overflow-y-auto space-y-4 scroll-smooth"
        >
          <div className="text-center">
            <span className="text-xs bg-slate-200 text-slate-500 px-3 py-1 rounded-full">
              Today
            </span>
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.type === "user"
                    ? "bg-slate-900 text-white rounded-br-sm"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
                <p
                  className={`text-[10px] mt-2 ${
                    message.type === "user"
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-3 py-2">
            <button className="w-9 h-9 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xl">
              +
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
