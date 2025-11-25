module.exports = {
  apps: [
    {
      name: 'bus-ticket-booking',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
