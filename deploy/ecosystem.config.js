module.exports = {
  apps: [
    {
      name: 'website-evginler',
      cwd: './Website-Evginler',
      script: 'app.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'admin-evginler',
      cwd: './Admin-Evginler',
      script: 'admin.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
