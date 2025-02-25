const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
    });
    this._client.on('error', (error) => {
      console.error(error);
    });
    this._client.connect();
  }

  async set(key, value, expirationInSecond = 3600) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    return this._client.get(key);
  }

  delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
