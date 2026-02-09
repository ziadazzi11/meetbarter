
const BASE_URL = 'http://localhost:3000';

async function measure(name: string, fn: () => Promise<any>) {
    const start = performance.now();
    try {
        await fn();
        const end = performance.now();
        const duration = end - start;
        console.log(`✅ [${name}] Success: ${duration.toFixed(2)}ms`);
        return duration;
    } catch (e) {
        console.error(`❌ [${name}] Failed: ${(e as Error).message}`);
        return null;
    }
}

async function run() {
    console.log('🚀 Starting Performance Benchmarks (Ultra-Performance Protocol)...');

    // 1. Cold Start / Health Check
    await measure('Health Check (GET /)', () => fetch(BASE_URL));

    // 2. Public Market Data
    await measure('Get Listings (GET /listings)', () => fetch(`${BASE_URL}/listings`));

    // 3. System Config
    await measure('Get Config (GET /system-state/config)', () => fetch(`${BASE_URL}/system-state/config`));

    // 4. City Pulse
    await measure('City Pulse (GET /city-pulse)', () => fetch(`${BASE_URL}/city-pulse`));

    console.log('🏁 Benchmarks Complete.');
}

run();
