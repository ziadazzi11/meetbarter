const crypto = require('crypto');
const fetch = require('node-fetch');

async function run() {
    const baseUrl = 'http://localhost:3001/handshake';
    console.log('1. Initiating Handshake...');

    try {
        const initRes = await fetch(`${baseUrl}/init`, { method: 'POST' });
        if (!initRes.ok) {
            const err = await initRes.text();
            throw new Error(`Init failed: ${initRes.status} ${err}`);
        }
        const initData = await initRes.json();
        console.log('Received Puzzle:', initData);

        const { sessionId, difficulty, salt } = initData;

        console.log('2. Solving Puzzle (POW)...');
        console.time('POW_SOLVE_TIME');
        let solution = 0;
        let solved = false;

        // Safety limit
        const limit = 10000000;

        while (solution < limit) {
            const hash = crypto.createHash('sha256')
                .update(salt + solution.toString())
                .digest('hex');

            if (hash.startsWith('0'.repeat(difficulty))) {
                console.log(`Solved! Solution: ${solution}, Hash: ${hash}`);
                solved = true;
                break;
            }
            solution++;
        }
        console.timeEnd('POW_SOLVE_TIME');

        if (!solved) throw new Error('Failed to solve puzzle within limit');

        console.log('3. Submitting Challenge...');
        const challengeRes = await fetch(`${baseUrl}/challenge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, solution: solution.toString() })
        });

        if (!challengeRes.ok) {
            const err = await challengeRes.text();
            throw new Error(`Challenge failed: ${challengeRes.status} ${err}`);
        }

        const { token } = await challengeRes.json();
        console.log('Received Token:', token);

        console.log('SUCCESS: Protocol Shaping Handshake Verified!');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

run();
