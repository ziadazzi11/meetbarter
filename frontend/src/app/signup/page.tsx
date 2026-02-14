'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from "@/config/api";
import SocialLoginButtons from '@/components/SocialLoginButtons';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        country: 'Lebanon',
        termsAccepted: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password || !formData.fullName) return setError('All fields are required');
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
        if (formData.password.length < 8) return setError('Password must be at least 8 characters');
        if (!formData.termsAccepted) return setError('Please accept the Terms of Service');

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    country: formData.country,
                }),
            });

            if (response.ok) {
                // Auto-login
                const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, password: formData.password }),
                });

                if (loginRes.ok) {
                    const data = await loginRes.json();
                    localStorage.setItem('meetbarter_token', data.access_token);
                    localStorage.setItem('meetbarter_uid', data.user.id);
                    localStorage.setItem('meetbarter_user', JSON.stringify(data.user));
                    window.location.href = '/dashboard';
                } else {
                    router.push('/login?signup=success');
                }
            } else {
                const data = await response.json();
                // Handle NestJS array of errors
                const errorMessage = Array.isArray(data.message)
                    ? data.message.join(', ')
                    : (data.message || 'Registration failed. Please check your details.');
                setError(errorMessage);
            }
        } catch (err) {
            console.error('Signup Error:', err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#050505]">
            {/* Animated Backgrounds */}
            <div className="absolute top-[-20%] right-[30%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full blur-[130px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-500"></div>

            <div className="relative w-full max-w-lg bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500"></div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Join the Network</h1>
                    <p className="text-gray-400">Establish your secure validation profile</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
                        {error}
                    </div>
                )}



                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Identity</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Country</label>
                        <div className="relative">
                            <select
                                name="country"
                                id="country"
                                aria-label="Select Country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="Lebanon" className="bg-[#0a0a0b]">Lebanon</option>
                                <option value="USA" className="bg-[#0a0a0b]">USA</option>
                                <option value="UAE" className="bg-[#0a0a0b]">UAE</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 p-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                            />
                            <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                            I accept the <span className="text-emerald-400 font-medium hover:underline">Protocol Terms</span>
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Validating Identity...' : 'Initiate Membership'}
                    </button>
                </form>
                <div className="mt-8">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="px-2 bg-[#0a0a0b] text-gray-500 font-bold">Or join with</span>
                        </div>
                    </div>

                    <SocialLoginButtons onLoginSuccess={(_userId) => {
                        window.location.href = '/dashboard';
                    }} />
                </div>
            </div>
        </div>
    );
}
