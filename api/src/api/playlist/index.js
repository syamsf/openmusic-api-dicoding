const Handler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, { service, validator, playlistSongActivitiesService }) => {
    const playlistHandler = new Handler(service, validator, playlistSongActivitiesService);
    server.route(routes(playlistHandler));
  },
};
