const { execSync } = require('child_process');

/**
 * This script sanitizes the DATABASE_URL environment variable and then
 * executes the provided command.
 */
function run() {
    let url = process.env.DATABASE_URL;
    if (!url) {
        console.error('❌ DATABASE_URL is not defined.');
        process.exit(1);
    }

    // Debug: Log the first 20 characters as hex to see hidden symbols
    const buffer = Buffer.from(url.substring(0, 30));
    console.log(`🔍 URL Debug (Hex): ${buffer.toString('hex')}`);
    console.log(`🔍 URL Debug (Text): "${url.substring(0, 30)}..."`);

    // Extremely aggressive sanitization
    let cleanUrl = url
        .replace(/^[\uFEFF\xA0]+|[\uFEFF\xA0]+$/g, '') // BOM and non-breaking space
        .trim()
        // Remove "DATABASE_URL=" or "DATABASE=" if it was accidentally pasted into the value
        .replace(/^(DATABASE_URL|DATABASE_URL=|DATABASE=)/i, '')
        .trim()
        .replace(/^["']|["']$/g, '');

    // If it still doesn't start with postgres, try to find where postgres starts
    if (!cleanUrl.startsWith('postgres') && cleanUrl.includes('postgres')) {
        console.log('⚠️ URL does not start with postgres. Attempting to locate protocol start...');
        const index = cleanUrl.indexOf('postgres');
        cleanUrl = cleanUrl.substring(index);
    }

    if (url !== cleanUrl) {
        console.log(`🛡️ Sanitized DATABASE_URL!`);
        console.log(`📍 New Prefix: "${cleanUrl.substring(0, 20)}..."`);
        process.env.DATABASE_URL = cleanUrl;
    } else {
        console.log('✅ DATABASE_URL appears clean.');
    }

    const command = process.argv.slice(2).join(' ');
    if (!command) return;

    console.log(`🚀 Running: ${command}`);
    try {
        execSync(command, {
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: cleanUrl }
        });
    } catch (error) {
        console.error(`❌ Command failed: ${command}`);
        process.exit(1);
    }
}

run();
