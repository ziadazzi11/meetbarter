import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Meetbarter',
    description: 'Terms of service and user agreement for Meetbarter barter platform',
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                <p className="text-sm text-gray-600 mb-4">Last Updated: January 27, 2026</p>
                <div className="bg-gray-100 p-3 rounded text-xs text-gray-500 mb-8 border border-gray-200">
                    MeetBarter™ is a trademark of MeetBarter Foundation (NGO Registration: [PENDING_REGISTRATION_NUMBER]).
                </div>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By creating an account or using Meetbarter, you agree to these Terms of Service.
                            If you do not agree, do not use the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Platform Purpose</h2>
                        <p>
                            Meetbarter is a <strong>barter coordination platform</strong> that facilitates the exchange of
                            goods and services using non-convertible Value Points. We do not process payments,
                            hold money, or participate in transactions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Prohibited Items (Region-Specific)</h2>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                            <p className="font-semibold text-blue-800 mb-2">
                                ⚖️ Local Laws Apply
                            </p>
                            <p className="text-blue-700">
                                Prohibited items are determined by <strong>your country's laws</strong>.
                                What is legal in one country may be illegal in another. You are responsible
                                for knowing and following your local laws.
                            </p>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
                            <p className="font-semibold text-red-800 mb-2">
                                Globally Prohibited (Illegal Everywhere):
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-red-700">
                                <li>Stolen property or items without proof of ownership</li>
                                <li>Counterfeit goods, replicas, or unauthorized copies</li>
                                <li>Prescription medications without proper authorization</li>
                                <li>Adult services or explicit content</li>
                                <li>Items that violate international law</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                            <p className="font-semibold text-yellow-800 mb-2">
                                Region-Specific Restrictions:
                            </p>
                            <p className="text-yellow-700">
                                Items such as cannabis, alcohol, tobacco, knives, and firearms are subject to
                                local laws. Our system automatically checks your listing location and enforces
                                applicable restrictions.
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-yellow-700 mt-2">
                                <li><strong>Lebanon/UAE:</strong> Strict prohibition on cannabis, alcohol, weapons</li>
                                <li><strong>USA/Canada:</strong> Cannabis legal in some states/provinces</li>
                                <li><strong>Europe:</strong> Moderate restrictions, varies by country</li>
                            </ul>
                        </div>

                        <p className="font-semibold text-gray-900 mt-4">
                            Violation of your local laws will result in immediate account suspension,
                            content removal, and potential reporting to authorities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. User Responsibility</h2>
                        <p>
                            <strong>You are solely responsible for items you list and trades you complete.</strong>
                            Meetbarter is not a party to your transactions. We provide a platform for coordination only.
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>You must own or have the right to trade items you list</li>
                            <li>You must accurately describe item condition and value</li>
                            <li>You must meet trade obligations in good faith</li>
                            <li>You assume all risk in person-to-person exchanges</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Safety Guidelines</h2>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                            <p className="font-semibold text-yellow-800 mb-2">
                                ⚠️ Meeting Safety (Your Responsibility)
                            </p>
                            <p className="text-yellow-700 mb-3">
                                <strong>MeetBarter is not responsible for your safety during in-person trades.</strong>
                                You are solely responsible for choosing safe meeting locations and protecting yourself.
                            </p>
                            <p className="font-semibold text-yellow-800 mb-2">Recommended Safety Practices:</p>
                            <ul className="list-disc list-inside space-y-1 text-yellow-700">
                                <li><strong>Always meet in public places</strong> (cafes, malls, police station parking lots)</li>
                                <li>Meet during daylight hours when possible</li>
                                <li>Tell a friend or family member where you're going</li>
                                <li>Inspect items thoroughly before completing the trade</li>
                                <li>Trust your instincts - cancel if something feels wrong</li>
                                <li>Never share personal information (home address, financial details) until meeting</li>
                            </ul>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            These are recommendations only. MeetBarter does not enforce meeting locations and
                            is not liable for any incidents, injuries, or losses during in-person exchanges.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Content Moderation</h2>
                        <p>
                            We reserve the right to:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Review, flag, or remove any listing at our discretion</li>
                            <li>Ban users who violate these terms</li>
                            <li>Use automated systems to detect prohibited content</li>
                            <li>Refuse service to anyone for any reason</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Cooperation with Law Enforcement</h2>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                            <p className="font-semibold text-yellow-800">
                                We will cooperate fully with law enforcement and report illegal activity.
                            </p>
                            <p className="text-yellow-700 mt-2">
                                If we detect or receive reports of illegal items (drugs, weapons, stolen goods),
                                we will provide user information, IP addresses, and transaction records to authorities.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Value Points</h2>
                        <p>
                            Value Points are <strong>non-convertible internal units</strong> used to facilitate
                            fair barter exchanges. They have no cash value and cannot be redeemed for money.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Dispute Resolution</h2>
                        <p>
                            Users can report issues through our dispute system. Final decisions rest with
                            platform administrators. We are not liable for trade disputes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Account Termination</h2>
                        <p>
                            We may suspend or terminate your account for:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Listing prohibited items (immediate ban)</li>
                            <li>Fraudulent activity or scams</li>
                            <li>Harassment or abuse of other users</li>
                            <li>Violation of any term in this agreement</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
                        <p>
                            Meetbarter is provided "as is" without warranties. We are not liable for:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>User conduct or trade outcomes</li>
                            <li>Item quality, condition, or legality</li>
                            <li>Losses from scams or fraud</li>
                            <li>Platform downtime or data loss</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
                        <p>
                            We may update these terms at any time. Continued use after changes constitutes acceptance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Contact</h2>
                        <p>
                            For questions, reports, or legal requests, contact:{' '}
                            <a href="mailto:legal@meetbarter.com" className="text-blue-600 hover:underline">
                                legal@meetbarter.com
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
                        By using Meetbarter, you acknowledge that you have read, understood, and agree to these Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
}
