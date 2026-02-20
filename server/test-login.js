const axios = require('axios');

async function testLogin() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test User';

    try {
        console.log('--- Registering ---');
        const regRes = await axios.post('http://localhost:3000/api/auth/register', { email, password, name });
        console.log('Registration success:', regRes.data.user.email);

        console.log('--- Logging in ---');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', { email, password });
        console.log('Login success:', loginRes.data.user.email);
    } catch (err) {
        console.error('Error status:', err.response?.status);
        console.log('Error data:', JSON.stringify(err.response?.data, null, 2));
    }
}

testLogin();
