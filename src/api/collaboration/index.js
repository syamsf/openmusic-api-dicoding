const Handler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaboration',
  version: '1.0.0',
  register: async (server, {
    service, validator, playlistService, usersService,
  }) => {
    const collaborationHandler = new Handler(service, validator, playlistService, usersService);
    server.route(routes(collaborationHandler));
  },
};
