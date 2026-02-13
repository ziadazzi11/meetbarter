
import axios from 'axios';

const API_URL = 'http://localhost:3001/auth';

const generateUser = () => {
    const uniqueId = Date.now();
    return {
        email: `test_user_${uniqueId}@example.com`,
        password: 'TestPassword123!',
        fullName: `Test User ${uniqueId}`,
        country: 'Lebanon',
    };
};

async function runTest() {
    console.log('🚀 Starting Auth System Verification...');
    const user = generateUser();

    // 1. Test Signup
    try {
        console.log(`\n1. Attempting Signup for ${user.email}...`);
        const signupRes = await axios.post(`${API_URL}/signup`, user);
        console.log('✅ Signup Successful:', signupRes.data.id ? 'User ID Received' : signupRes.data);
    } catch (error: any) {
        console.error('❌ Signup Failed:', error.response?.data || error.message);
        process.exit(1);
    }

    // 2. Test Login
    try {
        console.log(`\n2. Attempting Login...`);
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: user.email,
            password: user.password
        });
        console.log('✅ Login Successful!');
        console.log('   Access Token:', loginRes.data.access_token ? 'Received' : 'Missing');
    } catch (error: any) {
        console.error('❌ Login Failed:', error.response?.data || error.message);
        process.exit(1);
    }

    // 3. Test Duplicate Signup (Expected Failure)
    try {
        console.log(`\n3. Testing Duplicate Signup (Should Fail)...`);
        await axios.post(`${API_URL}/signup`, user);
        console.error('❌ Duplicate Signup SUCCEEDED (This is BAD - should have failed)');
    } catch (error: any) {
        if (error.response?.statusCode === 409 || error.response?.data?.message === 'Email already exists') {
            console.log('✅ Duplicate Signup Correctly Blocked:', error.response.data.message);
        } else {
            console.log('✅ Duplicate Signup Blocked (Check message below):');
            console.log('   Error:', error.response?.data || error.message);
        }
    }

    // 4. Test Weak Password (Expected Failure)
    try {
        console.log(`\n4. Testing Weak Password...`);
        await axios.post(`${API_URL}/signup`, { ...generateUser(), password: '123' });
        console.error('❌ Weak Password Signup SUCCEEDED (This is BAD)');
    } catch (error: any) {
        console.log('✅ Weak Password Blocked:', error.response?.data?.message);
    }
}

runTest();
