module.exports = {
  apps: [
    {
      name: 'trz_pems',
      script: './server.js',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
