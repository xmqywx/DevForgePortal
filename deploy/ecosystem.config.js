module.exports = {
  apps: [
    {
      name: "devforge-portal",
      script: "npm",
      args: "start",
      cwd: "/opt/devforge-portal",
      env: {
        NODE_ENV: "production",
        PORT: 3104,
      },
    },
    {
      name: "devforge-ws",
      script: "ws-server.js",
      cwd: "/opt/devforge-portal",
      env: {
        WS_PORT: 3105,
      },
    },
  ],
};
