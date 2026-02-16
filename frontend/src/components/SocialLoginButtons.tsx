import { API_BASE_URL } from '@/config/api';

interface SocialLoginButtonsProps {
    onLoginSuccess?: (userId: string) => void;
}

export default function SocialLoginButtons({ onLoginSuccess }: SocialLoginButtonsProps) {

    const handleSocialLogin = (provider: string) => {
        // Redirect to backend OAuth endpoint which handles the handshake
        if (provider === 'GOOGLE') {
            window.location.href = `${API_BASE_URL}/auth/google`;
        } else if (provider === 'FACEBOOK') {
            window.location.href = `${API_BASE_URL}/auth/facebook`;
        } else {
            alert("This provider is coming soon!");
        }
    };

    return (
        <div className="grid grid-cols-2 gap-3 w-full">
            <button
                type="button"
                onClick={() => handleSocialLogin("GOOGLE")}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all font-bold text-black text-sm shadow-sm"
            >
                <span className="text-red-500 text-lg">G</span> Google
            </button>

            <button
                type="button"
                onClick={() => handleSocialLogin("FACEBOOK")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all font-bold text-sm shadow-md shadow-blue-900/20"
            >
                <span className="text-lg">f</span> Facebook
            </button>

            <button
                type="button"
                onClick={() => handleSocialLogin("INSTAGRAM")}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all font-bold text-sm shadow-md shadow-purple-900/20"
            >
                <span className="text-lg">📸</span> Instagram
            </button>

            <button
                type="button"
                onClick={() => handleSocialLogin("OUTLOOK")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0078D4] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all font-bold text-sm shadow-md shadow-blue-900/20"
            >
                <span className="text-lg">📧</span> Outlook
            </button>
        </div>
    );
}
