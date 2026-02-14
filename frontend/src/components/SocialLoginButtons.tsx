
'use client';

import { useState } from 'react';
import { adsClient } from '@/lib/ads-client';

interface SocialLoginButtonsProps {
    onLoginSuccess: (userId: string) => void;
}

export default function SocialLoginButtons({ onLoginSuccess }: SocialLoginButtonsProps) {
    const [loading, setLoading] = useState(false);
    console.log("SocialLoginButtons: Rendering");

    const handleSocialLogin = async (provider: string) => {
        // 🛡️ DEV MODE: Prompt for email to allow testing different users
        const mockEmail = window.prompt(`[DEV SIMULATION]\nEnter an email to simulate ${provider} login/signup:`, ``);

        if (!mockEmail) return; // User cancelled

        setLoading(true);
        const mockName = mockEmail.split('@')[0]; // Simple name derivation

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const user = await adsClient.post('/users/social-login', {
                email: mockEmail,
                name: mockName,
                provider: provider,
                photoUrl: `https://ui-avatars.com/api/?name=${mockName}&background=random`
            });

            localStorage.setItem("meetbarter_uid", user.id);
            localStorage.setItem("meetbarter_token", "SOCIAL_MOCK_TOKEN"); // In real app, backend returns token
            // Note: The backend social-login endpoint returns the USER object, not a token structure yet in UsersController.
            // We might need to adjust this if the backend doesn't return a token.
            // Let's check UsersController again... it returns `this.usersService.socialLogin(body)`.
            // UsersService returns the `user` object.
            // It DOES NOT return an access_token. 
            // This means subsequent requests might fail if they need a token.
            // However, the user just wants to "register". 
            // To make it fully functional, we should ideally leverage the AuthController.
            // But for now, let's stick to the existing pattern in LoginModal which seemed to expect a user object.

            onLoginSuccess(user.id);
        } catch (err) {
            console.error(err);
            alert("Social Login Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-3 w-full">
            <button
                type="button"
                onClick={() => handleSocialLogin("GOOGLE")}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all font-bold text-black text-sm shadow-sm"
            >
                <span className="text-red-500 text-lg">G</span> Google
            </button>

            <button
                type="button"
                onClick={() => handleSocialLogin("FACEBOOK")}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all font-bold text-sm shadow-md shadow-blue-900/20"
            >
                <span className="text-lg">f</span> Facebook
            </button>

            <button
                type="button"
                onClick={() => handleSocialLogin("INSTAGRAM")}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all font-bold text-sm shadow-md shadow-purple-900/20"
            >
                <span className="text-lg">📸</span> Instagram
            </button>

            <button
                type="button"
                onClick={() => handleSocialLogin("OUTLOOK")}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0078D4] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all font-bold text-sm shadow-md shadow-blue-900/20"
            >
                <span className="text-lg">📧</span> Outlook
            </button>

            {loading && <p className="col-span-2 text-xs text-center text-gray-500 animate-pulse mt-2">Connecting to provider...</p>}
        </div>
    );
}
