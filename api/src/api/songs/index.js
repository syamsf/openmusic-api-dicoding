const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator, albumService }) => {
    const songsHandler = new SongsHandler(service, validator, albumService);
    server.route(routes(songsHandler));
  },
};
