/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#080D1A',
                primary: '#2563EB',
                'primary-light': '#3B82F6',
                'card-bg': 'rgba(15, 23, 42, 0.8)',
                'glass': 'rgba(255, 255, 255, 0.04)',
                'glass-border': 'rgba(255, 255, 255, 0.08)',
                surface: '#111827',
                'surface-2': '#1E2D45',
                muted: '#64748B',
                success: '#10B981',
                danger: '#EF4444',
                warning: '#F59E0B',
                profit: '#22C55E',
                violet: {
                    400: '#A78BFA',
                    500: '#8B5CF6',
                    600: '#7C3AED',
                },
                cyan: {
                    400: '#22D3EE',
                },
                pink: {
                    400: '#F472B6',
                    500: '#EC4899',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glow-blue': '0 0 25px rgba(37, 99, 235, 0.35)',
                'glow-green': '0 0 25px rgba(16, 185, 129, 0.35)',
                'glow-red': '0 0 25px rgba(239, 68, 68, 0.35)',
                'glow-violet': '0 0 30px rgba(124, 58, 237, 0.4)',
                'card': '0 4px 24px rgba(0,0,0,0.4)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
                'counter': 'counter 1s ease-out forwards',
                'shimmer': 'shimmer 2.5s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(124,58,237,0.3), inset 0 0 15px rgba(124,58,237,0.05)' },
                    '50%': { boxShadow: '0 0 35px rgba(124,58,237,0.6), inset 0 0 25px rgba(124,58,237,0.1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            }
        },
    },
    plugins: [],
}
