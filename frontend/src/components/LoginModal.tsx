"use client";

import { useState } from "react";

interface LoginModalProps {
    onLogin: (userId: string) => void;
}

export default function LoginModal({ onLogin }: LoginModalProps) {
    const [loading, setLoading] = useState(false);

    const handleSocialLogin = async (provider: string) => {
        setLoading(true);
        // Simulate OAuth Popup & Latency
        setTimeout(async () => {
            // Randomize user for demo or use fixed profiles per provider
            let email = "";
            let name = "";
            let photoUrl = "";

            switch (provider) {
                case "GOOGLE":
                    email = "ziad.azzi@gmail.com";
                    name = "Ziad Azzi";
                    photoUrl = "https://lh3.googleusercontent.com/a/default-user";
                    break;
                case "OUTLOOK":
                    email = "ziad.azzi@outlook.com";
                    name = "Ziad Azzi (Office)";
                    break;
                case "FACEBOOK":
                    email = "ziad.fb@example.com";
                    name = "Ziad Azzi FB";
                    break;
                case "INSTAGRAM":
                    email = "ziad_insta";
                    name = "Ziad Insta";
                    break;
            }

            try {
                const res = await fetch("http://localhost:3001/users/social-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, name, provider, photoUrl })
                });
                const user = await res.json();
                localStorage.setItem("meetbarter_uid", user.id);
                onLogin(user.id);
            } catch (e) {
                alert("Login Failed");
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in text-center">
                <img src="/assets/logo-full.png" alt="MeetBarter" className="h-12 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-500 mb-8">Sign in to continue your compassionate trading journey.</p>

                <div className="space-y-3">
                    <button
                        onClick={() => handleSocialLogin("GOOGLE")}
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-medium text-gray-700"
                    >
                        <span className="text-red-500 font-bold">G</span> Continue with Google
                    </button>

                    <button
                        onClick={() => handleSocialLogin("OUTLOOK")}
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-[#0078D4] text-white flex items-center justify-center gap-3 hover:opacity-90 transition-all font-medium"
                    >
                        <span>📧</span> Continue with Outlook
                    </button>

                    <button
                        onClick={() => handleSocialLogin("FACEBOOK")}
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-[#1877F2] text-white flex items-center justify-center gap-3 hover:opacity-90 transition-all font-medium"
                    >
                        <span>f</span> Continue with Facebook
                    </button>

                    <button
                        onClick={() => handleSocialLogin("INSTAGRAM")}
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center gap-3 hover:opacity-90 transition-all font-medium"
                    >
                        <span>📸</span> Continue with Instagram
                    </button>

                    {loading && <p className="text-sm text-gray-400 mt-4 animate-pulse">Connecting to provider...</p>}
                </div>

                <p className="mt-8 text-xs text-gray-400">
                    By continuing, you agree to our Terms of Service and Compassionate Economy Protocol.
                </p>
            </div>
        </div>
    );
}
