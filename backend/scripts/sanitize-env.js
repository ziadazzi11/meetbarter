const { execSync } = require('child_process');

/**
 * This script sanitizes the DATABASE_URL environment variable and then
 * executes the provided command.
 */
function run() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('❌ DATABASE_URL is not defined.');
        process.exit(1);
    }

    // Remove leading/trailing spaces and quotes
    const cleanUrl = url.trim().replace(/^["']|["']$/g, '');

    // Set the clean URL back into the environment for this process and its children
    process.env.DATABASE_URL = cleanUrl;

    const command = process.argv.slice(2).join(' ');
    if (!command) {
        console.log('✅ DATABASE_URL sanitized.');
        return;
    }

    console.log(`🛡️ Sanitized environment. Running: ${command}`);
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`❌ Command failed: ${command}`);
        process.exit(1);
    }
}

run();
