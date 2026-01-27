module.exports = {
  apps : [{
    name: "pk2-sistema",
    script: "./server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "development",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    },
    ignore_watch: ["node_modules", "public/images", "logs"],
    time: true
  }]
};
