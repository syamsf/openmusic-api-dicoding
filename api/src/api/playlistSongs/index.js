const Handler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    service,
    validator,
    songsService,
    playlistService,
    playlistSongActivitiesService,
  }) => {
    const playlistSongsHandler = new Handler(
      service,
      validator,
      songsService,
      playlistService,
      playlistSongActivitiesService,
    );

    server.route(routes(playlistSongsHandler));
  },
};
