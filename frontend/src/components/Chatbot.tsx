import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';

const SUGGESTED_QUESTIONS = [
    'How should I invest my savings?',
    'How to reduce my debt faster?',
    'Best SIP for beginners?',
    'How to build an emergency fund?',
];

interface ChatbotProps {
    messages: ChatMessage[];
    onSendMessage: (msg: string) => void;
    isLoading: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        onSendMessage(trimmed);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                    <h2 className="section-title">AI Financial Chat</h2>
                    <p className="section-subtitle">Ask anything about your finances</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30">
                    <Sparkles size={12} className="text-primary" />
                    <span className="text-xs text-primary font-semibold">Gemini AI</span>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="glass-card flex-1 overflow-y-auto p-4 space-y-3 mb-3" style={{ minHeight: 0, maxHeight: '450px' }}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-primary to-violet-600'
                                    : 'bg-gradient-to-br from-success/40 to-teal-600/40 border border-success/30'
                                }`}
                        >
                            {msg.role === 'user' ? (
                                <User size={13} className="text-white" />
                            ) : (
                                <Bot size={13} className="text-success" />
                            )}
                        </div>
                        <div
                            className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-sm'
                                    : 'bg-white/5 border border-white/8 text-slate-200 rounded-tl-sm'
                                }`}
                        >
                            {msg.content}
                            <p className="text-[10px] opacity-50 mt-1">
                                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-success/40 to-teal-600/40 border border-success/30 flex items-center justify-center flex-shrink-0">
                            <Bot size={13} className="text-success" />
                        </div>
                        <div className="bg-white/5 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm">
                            <div className="flex gap-1 items-center h-4">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={endRef} />
            </div>

            {/* Suggested Questions */}
            <div className="flex gap-2 mb-3 flex-wrap flex-shrink-0">
                {SUGGESTED_QUESTIONS.map(q => (
                    <button
                        key={q}
                        onClick={() => onSendMessage(q)}
                        disabled={isLoading}
                        className="text-xs text-slate-400 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-primary/40 transition-all px-3 py-1.5 rounded-full"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 flex-shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about investments, debt, savings..."
                    className="input-field flex-1"
                    disabled={isLoading}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="btn-primary px-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={16} />
                </motion.button>
            </div>
        </div>
    );
};
