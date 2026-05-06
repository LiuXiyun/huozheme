module.exports = {
  apps: [
    {
      name: "huozheme",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "4173",
      },
      max_memory_restart: "384M",
      time: true,
    },
  ],
};
