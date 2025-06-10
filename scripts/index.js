const axios = require('axios');

// Configuration
const HEALTH_ENDPOINT = process.env.HEALTH_ENDPOINT;
const PING_INTERVAL = process.env.PING_INTERVAL;

async function pingHealthEndpoint() {
    try {
        const response = await axios.get(HEALTH_ENDPOINT, {
            timeout: 30000, // 30 second timeout
            validateStatus: (status) => status < 500
        });
        
        console.log(`[${new Date().toISOString()}] Ping successful - Status: ${response.status}`);
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error(`[${new Date().toISOString()}] Ping timed out`);
        } else if (error.response) {
            console.error(`[${new Date().toISOString()}] Ping failed - Status: ${error.response.status}`);
        } else {
            console.error(`[${new Date().toISOString()}] Ping failed:`, error.message);
        }
    }
}

// Initial ping
console.log(`[${new Date().toISOString()}] Starting health check pinger...`);
console.log(`Pinging ${HEALTH_ENDPOINT} every 10 minutes`);
pingHealthEndpoint();

// Set up interval
const intervalId = setInterval(pingHealthEndpoint, PING_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n[${new Date().toISOString()}] Shutting down gracefully...`);
    clearInterval(intervalId);
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(`\n[${new Date().toISOString()}] Received SIGTERM, shutting down...`);
    clearInterval(intervalId);
    process.exit(0);
});