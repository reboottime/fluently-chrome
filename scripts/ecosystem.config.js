module.exports = {
    apps: [{
        name: 'render-pinger',
        script: 'index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '100M',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        merge_logs: true,
        max_restarts: 10,
        min_uptime: '10s'
    }]
};