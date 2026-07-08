module.exports = {
  apps: [{
    name: 'dashboard.morsebiz.com',
    script: 'npm',
    args: 'start',
    cwd: '/home/azureuser/projects/dashboard.morsebiz.com',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/home/azureuser/logs/dashboard-err.log',
    out_file: '/home/azureuser/logs/dashboard-out.log',
    log_file: '/home/azureuser/logs/dashboard-combined.log',
    time: true
  }]
};