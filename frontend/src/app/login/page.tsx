'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from "@/config/api";
import SocialLoginButtons from '@/components/SocialLoginButtons';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        const uid = searchParams.get('uid');

        if (token && uid) {
            localStorage.setItem('meetbarter_token', token);
            localStorage.setItem('meetbarter_uid', uid);
            // We might want to fetch user details using the token if not provided
            // For now, redirect to dashboard
            window.location.href = '/dashboard';
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('meetbarter_token', data.access_token);
                localStorage.setItem('meetbarter_uid', data.user.id);
                localStorage.setItem('meetbarter_user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                const errData = await res.json();
                setError(errData.message || 'Invalid credentials');
            }
        } catch {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl overflow-hidden">
            {/* Ambient Background Glow inside card */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

            <div className="text-center mb-10">
                <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 mb-6 shadow-inner">
                    <span className="text-4xl">🔐</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
                <p className="text-gray-400 text-sm">Enter your credentials to access the vault</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}



            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white/[0.07]"
                        placeholder="name@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                        <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                            Forgot?
                        </Link>
                    </div>
                    <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white/[0.07]"
                        placeholder="••••••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Authenticating...
                        </span>
                    ) : 'Access Account'}
                </button>
            </form>

            <div className="mt-8">
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className="px-2 bg-[#0a0a0b] text-gray-500 font-bold">Or enter via</span>
                    </div>
                </div>

                <SocialLoginButtons />
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                    New to MeetBarter?{' '}
                    <Link href="/signup" className="text-white font-bold hover:text-indigo-400 transition-colors ml-1">
                        Create Validation Profile
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#050505]">
            {/* Animated Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>

            <Suspense fallback={<div className="text-white/50">Loading interface...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
