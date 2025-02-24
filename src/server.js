const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('./exceptions/ClientError');

// albums
const albumsPlugin = require('./api/albums/index');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums/index');

// songs
const songsPlugin = require('./api/songs/index');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs/index');

// users
const usersPlugin = require('./api/users/index');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users/index');

// authentications
const authenticationsPlugin = require('./api/authentications/index');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications/index');
const TokenManager = require('./tokenize/TokenManager');

// playlist
const playlistPlugin = require('./api/playlist/index');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlist/index');

// playlistSongs
const playlistSongsPlugin = require('./api/playlistSongs/index');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlistSongs/index');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistActivitiesService');

// collaboration
const collaborationPlugin = require('./api/collaboration/index');
const CollaborationService = require('./services/postgres/CollaborationService');
const CollaborationValidator = require('./validator/collaboration/index');

require('dotenv').config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albumsPlugin,
      options: {
        service: new AlbumsService(),
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songsPlugin,
      options: {
        service: new SongsService(),
        validator: SongsValidator,
        albumService: new AlbumsService(),
      },
    },
    {
      plugin: usersPlugin,
      options: {
        service: new UsersService(),
        validator: UsersValidator,
      },
    },
    {
      plugin: authenticationsPlugin,
      options: {
        authenticationsService: new AuthenticationsService(),
        usersService: new UsersService(),
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlistPlugin,
      options: {
        service: new PlaylistService(),
        validator: PlaylistValidator,
        playlistSongActivitiesService: new PlaylistSongActivitiesService(),
      },
    },
    {
      plugin: playlistSongsPlugin,
      options: {
        service: new PlaylistSongsService(),
        validator: PlaylistSongsValidator,
        songsService: new SongsService(),
        playlistService: new PlaylistService(),
        playlistSongActivitiesService: new PlaylistSongActivitiesService(),
      },
    },
    {
      plugin: collaborationPlugin,
      options: {
        service: new CollaborationService(),
        validator: CollaborationValidator,
        playlistService: new PlaylistService(),
        usersService: new UsersService(),
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'There is internal error in our server.',
      });
      newResponse.code(500);
      console.error(`Error: ${response.message}`);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
