"use client";

import { faqs } from "@/data/faqs";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  from: "bot" | "user";
  text: string;
};

const GREETING: Message = {
  id: "greeting",
  from: "bot",
  text: "Hi! I'm the BazarHost assistant. Pick a question below or type your own.",
};

const FALLBACK =
  "I don't have an answer for that yet. Try the WhatsApp button below to chat with our team directly.";

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  const match = faqs.find((faq) =>
    faq.keywords.some((keyword) => lower.includes(keyword)),
  );
  return match ? match.answer : FALLBACK;
}

export default function FaqChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  function ask(text: string) {
    if (!text.trim()) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      from: "user",
      text,
    };
    const botMessage: Message = {
      id: crypto.randomUUID(),
      from: "bot",
      text: findAnswer(text),
    };
    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[26rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-card border border-ink/10 bg-white shadow-xl shadow-ink/15">
          <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">BazarHost Assistant</p>
              <p className="text-xs text-white/60">Usually replies instantly</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    message.from === "user"
                      ? "rounded-br-sm bg-orange text-white"
                      : "rounded-bl-sm border border-ink/10 bg-white text-ink"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <div className="scrollbar-hide flex gap-2 overflow-x-auto border-t border-ink/10 px-3 py-2.5">
            {faqs.map((faq) => (
              <button
                key={faq.id}
                type="button"
                onClick={() => ask(faq.question)}
                className="shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-orange hover:text-orange"
              >
                {faq.question}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-ink/10 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="w-full rounded-full border border-ink/15 px-4 py-2 text-sm text-ink placeholder:text-slate-muted focus:border-orange focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-white transition-colors hover:bg-orange-dark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12h16M14 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close FAQ chat" : "Open FAQ chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-lg shadow-ink/20 transition-transform hover:scale-105"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.1-3.5A7.96 7.96 0 0 1 4 12z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
