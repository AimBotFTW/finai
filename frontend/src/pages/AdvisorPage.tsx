import { useState } from 'react';
import { motion } from 'framer-motion';
import { AIAdvisorPanel } from '../components/AIAdvisorPanel';
import { Chatbot } from '../components/Chatbot';
import { AIAdvice, ChatMessage } from '../types';
import { Bot, MessageSquare } from 'lucide-react';

interface AdvisorPageProps {
    advice: AIAdvice[];
    chatMessages: ChatMessage[];
    onSendMessage: (msg: string) => void;
    isLoading: boolean;
    isChatLoading: boolean;
}

export const AdvisorPage: React.FC<AdvisorPageProps> = ({
    advice,
    chatMessages,
    onSendMessage,
    isLoading,
    isChatLoading,
}) => {
    const [tab, setTab] = useState<'advice' | 'chat'>('advice');

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div>
                    <h2 className="section-title">AI Financial Advisor</h2>
                    <p className="section-subtitle">Powered by Google Gemini AI</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
                <button
                    onClick={() => setTab('advice')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'advice' ? 'bg-primary text-white shadow-glow-blue' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Bot size={15} /> Recommendations
                </button>
                <button
                    onClick={() => setTab('chat')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'chat' ? 'bg-primary text-white shadow-glow-blue' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <MessageSquare size={15} /> Chat
                </button>
            </div>

            <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {tab === 'advice' ? (
                    <AIAdvisorPanel advice={advice} isLoading={isLoading} />
                ) : (
                    <div className="glass-card p-5" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <Chatbot messages={chatMessages} onSendMessage={onSendMessage} isLoading={isChatLoading} />
                    </div>
                )}
            </motion.div>
        </div>
    );
};
