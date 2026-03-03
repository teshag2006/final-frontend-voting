/**
 * PM2 Cluster Configuration for VoteChain Backend
 * 
 * This configuration enables running multiple instances of the NestJS application
 * across all available CPU cores for maximum throughput.
 * 
 * Usage:
 *   npm install -g pm2
 *   pm2 start ecosystem.config.js
 *   pm2 list                    # View running processes
 *   pm2 logs                    # View logs
 *   pm2 stop all                # Stop all processes
 *   pm2 restart all             # Restart all processes
 */
module.exports = {
  apps: [
    {
      name: 'votechain-api',
      script: 'dist/main.js',
      cwd: './',
      instances: 'max', // Spawn one instance per CPU core
      exec_mode: 'cluster', // Enable cluster mode
      watch: false,
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      // Health check configuration
      health_check_grace_period: 3000,
      health_check_interval: 5000,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Logging
      out_file: 'logs/cluster-out.log',
      error_file: 'logs/cluster-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Security
      node_args: '--max-old-space-size=1024',
    },
  ],
};
