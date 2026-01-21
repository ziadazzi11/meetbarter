
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001';

async function main() {
    console.log('🚀 Starting Stress Test Simulation...');

    // 1. Create Sybil Ring (3 Malicious Users)
    console.log('\n--- 1. Creating Sybil Ring (3 Users) ---');
    console.log('⚠️ Simulator: Assuming Users Exist (Simulating traffic with Demo User for now due to auth limits)');

    const DEMO_USER_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6"; // "Demo User"

    // 2. Simulate "Fast Trading" (Spamming Trades)
    console.log('\n--- 2. Attempting Trade Spam (Validation Check) ---');
    try {
        const listingsRes = await fetch(`${API_URL}/listings`);
        const listings = await listingsRes.json();
        if (listings.length === 0) throw new Error("No listings found");
        const targetListing = listings[0];

        console.log(`[ATTACK] Trying to buy "${targetListing.title}"...`);

        const res1 = await createTrade(targetListing.id, DEMO_USER_ID, 100);
        console.log(`[ATTACK] Trade Result: ${res1.status}`);

    } catch (e) {
        console.error("Test Failed:", e.message);
    }

    // 3. KILL SWITCH VERIFICATION
    console.log('\n--- 3. Verifying Kill Switch ---');

    console.log('[ADMIN] Activating Kill Switch...');
    const freezeRes = await fetch(`${API_URL}/admin/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frozen: true, code1: 'ALPHA', code2: 'OMEGA' })
    });
    if (freezeRes.ok) console.log('✅ System Frozen Successfully');
    else {
        console.error('❌ Failed to Freeze. Status:', freezeRes.status);
        console.error('Response:', await freezeRes.text());
    }

    console.log('[ATTACK] Attempting Trade while FROZEN...');
    const listingsRes = await fetch(`${API_URL}/listings`);
    const listings = await listingsRes.json();
    if (listings.length > 0) {
        const resFrozen = await createTrade(listings[0].id, DEMO_USER_ID, 100);
        const resText = await resFrozen.text();

        if (resText.includes("frozen") || resText.includes("maintenance")) {
            console.log('✅ Trade BLOCKED correctly (Kill Switch Active)');
        } else {
            console.error(`❌ Trade Failed for WRONG reason or Succeeded? Status: ${resFrozen.status}`);
            console.log('Response:', resText);
        }
    }

    console.log('[ADMIN] Deactivating Kill Switch...');
    await fetch(`${API_URL}/admin/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frozen: false, code1: 'ALPHA', code2: 'OMEGA' })
    });
    console.log('✅ System Restored');

    console.log('\n✅ Stress Test Complete.');
}

async function createTrade(listingId, buyerId, offerVP) {
    const res = await fetch(`${API_URL}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, buyerId, offerVP })
    });
    return res;
}

main();
