module.exports = {
  apps: [
    {
      name: 'real-estate-posts',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/real-estate-auto-post',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/www/real-estate-auto-post/logs/error.log',
      out_file: '/var/www/real-estate-auto-post/logs/output.log',
      log_file: '/var/www/real-estate-auto-post/logs/combined.log',
      time: true,
    },
  ],
};
