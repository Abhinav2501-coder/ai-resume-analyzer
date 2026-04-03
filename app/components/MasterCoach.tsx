import { useState, useRef, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";

interface MasterCoachProps {
    resumeContext: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
}

const SYSTEM_PROMPT = `You are "CareerPath AI", a Senior Technical Recruiter and Career Mentor.
Your mission is to guide users through their career journey by improving their resume AND their skills.
You have access to the user's resume analysis below. Use it to personalize every answer.

RULES:
1. Focus ONLY on resume improvement, career advice, course suggestions, and project ideas.
2. When suggesting courses, name specific platforms (Coursera, Udemy, freeCodeCamp, LinkedIn Learning, etc.) and specific course names when possible.
3. When suggesting projects, tailor them to the technologies listed in the resume.
4. Format your response using these sections when appropriate:
   📈 Resume Tweaks — for resume improvement suggestions
   🎓 Recommended Learning — for courses and certifications
   🛠️ Project Ideas — for portfolio project suggestions
5. If asked about how to use the application or unrelated topics, reply: "I'm here to help with your career and resume. For app help, check the README!"
6. Always provide actionable, bulleted suggestions.
7. Be encouraging but honest. If something needs improvement, say so constructively.
8. Use the STAR method (Situation, Task, Action, Result) when helping rewrite bullet points.`;

const QUICK_ACTIONS = [
    {
        label: "📈 Resume Tweaks",
        prompt: "Analyze my resume and suggest specific improvements for ATS optimization, impact, and formatting. Focus on action verbs, quantifiable achievements, and keyword optimization.",
    },
    {
        label: "🎓 Course List",
        prompt: "Based on the skills in my resume and current market trends, suggest online courses and certifications I should take to become more competitive for my target role.",
    },
    {
        label: "🛠️ Project Ideas",
        prompt: "Suggest 2-3 portfolio projects I can build based on the technologies in my resume to fill skill gaps and strengthen my profile for recruiters.",
    },
];

const SparklesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        <path d="M5 3v4" />
        <path d="M3 5h4" />
        <path d="M19 17v4" />
        <path d="M17 19h4" />
    </svg>
);

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
    </svg>
);

const MasterCoach = ({ resumeContext }: MasterCoachProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { ai } = usePuterStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMessage: Message = { role: "user", content: text };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const chatMessages: ChatMessage[] = [
                {
                    role: "system",
                    content: `${SYSTEM_PROMPT}\n\n--- USER'S RESUME DATA ---\n${resumeContext}\n--- END RESUME DATA ---`,
                },
                ...messages.map((m) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                })),
                { role: "user", content: text },
            ];

            const response = await ai.chat(chatMessages);

            if (!response) {
                throw new Error("No response received");
            }

            const responseText =
                typeof response.message.content === "string"
                    ? response.message.content
                    : response.message.content[0].text;

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: responseText },
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I couldn't process that request. Please try again.",
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleQuickAction = (prompt: string) => {
        sendMessage(prompt);
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full primary-gradient text-white shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer group"
                    title="CareerPath AI"
                >
                    <span className="group-hover:rotate-12 transition-transform duration-300">
                        <SparklesIcon />
                    </span>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-6 right-6 z-50 w-[400px] max-sm:w-[calc(100vw-2rem)] max-sm:right-4 max-sm:bottom-4 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
                    style={{
                        height: "520px",
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(20px)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-5 py-3.5 text-white shrink-0"
                        style={{ background: "linear-gradient(to right, #8e98ff, #606beb)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <SparklesIcon />
                            <div>
                                <h3 className="font-bold text-sm leading-none">CareerPath AI</h3>
                                <p className="text-[11px] opacity-80 mt-0.5">Your Resume & Career Mentor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <button
                                    onClick={handleClearChat}
                                    className="text-[11px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer bg-white/15 rounded-full px-2.5 py-1"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.length === 0 && !isTyping && (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                                    style={{ background: "linear-gradient(to bottom, #8e98ff, #606beb)" }}
                                >
                                    <SparklesIcon />
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                    Hi! I'm your Career Coach 👋
                                </p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    I can help you improve your resume, suggest courses to upskill, and recommend projects to build. Try one of the quick actions below!
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
                                        msg.role === "user"
                                            ? "bg-gradient-to-br from-[#8e98ff] to-[#606beb] text-white rounded-br-md"
                                            : "bg-gray-100 text-gray-800 rounded-bl-md"
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                    {msg.role === "assistant" && (
                                        <button
                                            onClick={() => navigator.clipboard.writeText(msg.content)}
                                            className="mt-1.5 text-[10px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                        >
                                            📋 Copy
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl rounded-bl-md text-sm flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-1.5 px-4 pb-2 shrink-0 flex-wrap">
                        {QUICK_ACTIONS.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action.prompt)}
                                disabled={isTyping}
                                className="text-[11px] px-2.5 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-[#8e98ff] hover:text-[#606beb] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 shrink-0 bg-white"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your resume..."
                            disabled={isTyping}
                            className="flex-1 !p-2.5 text-sm !rounded-xl bg-gray-50 border-none !shadow-none placeholder:text-gray-400 text-black"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            style={{ background: "linear-gradient(to bottom, #8e98ff, #606beb)" }}
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default MasterCoach;
