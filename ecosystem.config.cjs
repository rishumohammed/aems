module.exports = {
  apps: [
    {
      name: "aems-backend",
      script: "src/app.js",
      cwd: "./backend",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    },
    {
      name: "aems-frontend",
      script: ".output/server/index.mjs",
      cwd: "./frontend",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
