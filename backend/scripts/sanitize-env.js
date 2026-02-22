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

    console.log(`🔍 Inspecting DATABASE_URL (length: ${url.length})...`);

    // Log the first few chars to see if they are correct (non-sensitive)
    const prefix = url.substring(0, 15);
    console.log(`📍 URL Prefix: "${prefix}..."`);

    // Aggressively sanitize:
    // 1. Remove Byte Order Mark (BOM)
    // 2. Remove any non-printable characters (ASCII < 32)
    // 3. Trim spaces
    // 4. Strip leading/trailing quotes
    const cleanUrl = url
        .replace(/^[\uFEFF\xA0]+|[\uFEFF\xA0]+$/g, '') // BOM and non-breaking space
        .replace(/[^\x20-\x7E]/g, '')                // Remove all non-printable ASCII
        .trim()
        .replace(/^["']|["']$/g, '');

    if (url !== cleanUrl) {
        console.log(`🛡️ Sanitized DATABASE_URL! Length changed: ${url.length} -> ${cleanUrl.length}`);
        process.env.DATABASE_URL = cleanUrl;
    } else {
        console.log('✅ DATABASE_URL appears clean according to sanitization rules.');
    }

    const command = process.argv.slice(2).join(' ');
    if (!command) {
        console.log('✅ DATABASE_URL sanitized.');
        return;
    }

    console.log(`🚀 Running: ${command}`);
    try {
        // Explicitly pass process.env
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
