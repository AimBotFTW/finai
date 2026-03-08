export const AboutSection: React.FC = () => {
    return (
        <section id="about" className="py-24 px-6 relative" style={{ background: '#060814' }}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-6">About FinAI</h2>
                <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
                    FinAI is built with a mission to democratize financial intelligence. We believe that everyone deserves access to high-quality, personalized financial advice, regardless of their net worth. By combining deterministic financial models with the power of AI, FinAI acts as your unwavering wealth copilot — helping you plan out a secure and prosperous future.
                </p>
            </div>
        </section>
    );
};
