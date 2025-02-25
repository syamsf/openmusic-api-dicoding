const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD ?? null,
  },
};

module.exports = config;
