import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Meetbarter',
    description: 'Privacy policy for Meetbarter barter platform',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <p className="text-sm text-gray-600 mb-4">Last Updated: January 27, 2026</p>
                <div className="bg-gray-100 p-3 rounded text-xs text-gray-500 mb-8 border border-gray-200">
                    This policy is issued by MeetBarter Foundation (NGO Registration: [PENDING_REGISTRATION_NUMBER]).
                </div>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p>We collect the following information to operate the platform:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li><strong>Account Information:</strong> Email, password (hashed), full name, phone number</li>
                            <li><strong>Listing Information:</strong> Item descriptions, photos, location, country</li>
                            <li><strong>Trade Information:</strong> Barter history, Value Points, trust scores</li>
                            <li><strong>Technical Data:</strong> IP address, device information, browser type</li>
                            <li><strong>Succession Data:</strong> Heir names and authentication keys (encrypted)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Facilitate barter trades and coordinate exchanges</li>
                            <li>Calculate trust scores and enforce community standards</li>
                            <li>Prevent fraud, scams, and illegal activity</li>
                            <li>Moderate content and enforce Terms of Service</li>
                            <li>Enable succession and account recovery</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Content Moderation & Safety</h2>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                            <p className="font-semibold text-yellow-800">
                                We use automated systems to detect prohibited content.
                            </p>
                            <p className="text-yellow-700 mt-2">
                                Your listings are scanned for keywords related to illegal items (drugs, weapons, stolen goods).
                                Flagged listings are reviewed by administrators.
                            </p>
                        </div>
                        <p className="mt-2">
                            <strong>Data collected for safety:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>IP addresses of users who violate Terms of Service</li>
                            <li>Device fingerprints of banned users</li>
                            <li>Listing content flagged by automated systems or user reports</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
                        <p>We <strong>do not sell</strong> your personal information. We may share data:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li><strong>With other users:</strong> Your first name, trust score, and location (city/country) are visible to facilitate trades</li>
                            <li><strong>With law enforcement:</strong> If required by law or if we detect illegal activity (drugs, weapons, fraud)</li>
                            <li><strong>With service providers:</strong> Hosting, analytics, and security services (subject to strict data protection agreements)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Law Enforcement Cooperation</h2>
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
                            <p className="font-semibold text-red-800">
                                We cooperate fully with law enforcement.
                            </p>
                            <p className="text-red-700 mt-2">
                                If we detect illegal items (drugs, weapons, stolen property), we will:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-red-700">
                                <li>Immediately ban the user</li>
                                <li>Preserve all data related to the violation</li>
                                <li>Provide user information (email, IP address, device info, listing details) to authorities</li>
                                <li>Comply with subpoenas and legal requests</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
                        <p>We retain your data:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li><strong>Active accounts:</strong> As long as your account is active</li>
                            <li><strong>Deleted accounts:</strong> 90 days after deletion (for fraud prevention)</li>
                            <li><strong>Banned users:</strong> Indefinitely (to prevent re-registration)</li>
                            <li><strong>Illegal activity records:</strong> Indefinitely (for legal compliance)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Access your data</li>
                            <li>Correct inaccurate information</li>
                            <li>Delete your account (subject to fraud prevention checks)</li>
                            <li>Export your trade history</li>
                            <li>Designate heirs for account recovery</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Security</h2>
                        <p>We protect your data with:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Encrypted passwords (bcrypt hashing)</li>
                            <li>Encrypted heir authentication keys</li>
                            <li>HTTPS/TLS encryption for data in transit</li>
                            <li>Triple-lock security for admin actions</li>
                            <li>Regular security audits</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Cookies & Tracking</h2>
                        <p>We use:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li><strong>Essential cookies:</strong> For login and session management</li>
                            <li><strong>Analytics cookies:</strong> To improve platform performance (optional, you can opt out)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
                        <p>
                            We may update this policy. Continued use after changes constitutes acceptance.
                            We will notify users of significant changes via email.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Contact</h2>
                        <p>
                            For privacy questions or data requests:{' '}
                            <a href="mailto:privacy@meetbarter.com" className="text-blue-600 hover:underline">
                                privacy@meetbarter.com
                            </a>
                        </p>
                        <p className="mt-4 text-sm">
                            MeetBarter Foundation<br />
                            [PHYSICAL_ADDRESS_IF_APPLICABLE]<br />
                            Beirut, Lebanon
                        </p>
                    </section>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600">
                        By using Meetbarter, you acknowledge that you have read and understood this Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
