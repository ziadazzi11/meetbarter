export default function SafetyNotice() {
    return (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r shadow-sm my-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-bold text-orange-800">
                        ⚠️ Cash Settlement Risk
                    </h3>
                    <div className="mt-2 text-xs text-orange-700 space-y-2">
                        <p>
                            If you agree to a cash difference (&quot;top-up&quot;), you settle this <strong>directly with the other party</strong>.
                        </p>
                        <p className="font-semibold">
                            MeetBarter does NOT process cash and cannot recover lost money.
                        </p>
                        <ul className="list-disc list-inside ml-1">
                            <li>Meet in a public, safe location.</li>
                            <li>Do not send money online before meeting.</li>
                            <li>Verify the item before handing over cash.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
