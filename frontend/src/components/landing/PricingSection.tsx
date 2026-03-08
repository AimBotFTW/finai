export const PricingSection: React.FC = () => {
    return (
        <section id="pricing" className="py-24 px-6 relative" style={{ background: '#03040E' }}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Pricing Plans</h2>
                <p className="text-slate-400 mb-12">Choose the plan that fits your financial journey.</p>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-8 border rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                        <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
                        <p className="text-3xl font-black text-white mb-6">Free</p>
                        <ul className="text-slate-400 text-sm space-y-3 mb-8 text-left px-4">
                            <li>✓ Basic Wealth Tracking</li>
                            <li>✓ Budget Analysis</li>
                            <li>✓ Standard Support</li>
                        </ul>
                        <button className="w-full py-3 rounded-full text-white font-semibold transition" style={{ background: 'rgba(255,255,255,0.1)' }}>Get Started</button>
                    </div>
                    <div className="p-8 border rounded-2xl relative" style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}>
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                        <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                        <p className="text-3xl font-black text-white mb-6">₹499<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                        <ul className="text-slate-400 text-sm space-y-3 mb-8 text-left px-4">
                            <li>✓ AI Financial Advisor</li>
                            <li>✓ Tax Optimization Engine</li>
                            <li>✓ What-If Simulator</li>
                            <li>✓ Priority Support</li>
                        </ul>
                        <button className="w-full py-3 rounded-full bg-violet-600 text-white font-semibold transition hover:bg-violet-500">Upgrade to Pro</button>
                    </div>
                </div>
            </div>
        </section>
    );
};
