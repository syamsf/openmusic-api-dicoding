require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const config = require('./utils/config');

const ClientError = require('./exceptions/ClientError');

// albums
const albumsPlugin = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikeService');

// songs
const songsPlugin = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// users
const usersPlugin = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authenticationsPlugin = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

// playlist
const playlistPlugin = require('./api/playlist');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

// playlistSongs
const playlistSongsPlugin = require('./api/playlistSongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlistSongs');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistActivitiesService');

// collaboration
const collaborationPlugin = require('./api/collaboration');
const CollaborationService = require('./services/postgres/CollaborationService');
const CollaborationValidator = require('./validator/collaboration');

// exports
const exportsPlugin = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const StorageService = require('./services/storage/StoragesService');
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const songsService = new SongsService(new CacheService());
  const playlistService = new PlaylistService(new CacheService());

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
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
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.app.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.app.accessTokenAge,
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
        storageService: new StorageService(path.resolve(__dirname, 'api/uploads/file/images')),
        userAlbumLikeService: new UserAlbumLikesService(new CacheService()),
      },
    },
    {
      plugin: songsPlugin,
      options: {
        service: songsService,
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
        service: playlistService,
        validator: PlaylistValidator,
        playlistSongActivitiesService: new PlaylistSongActivitiesService(),
      },
    },
    {
      plugin: playlistSongsPlugin,
      options: {
        service: new PlaylistSongsService(new CacheService()),
        validator: PlaylistSongsValidator,
        songsService,
        playlistService,
        playlistSongActivitiesService: new PlaylistSongActivitiesService(),
      },
    },
    {
      plugin: collaborationPlugin,
      options: {
        service: new CollaborationService(new CacheService()),
        validator: CollaborationValidator,
        playlistService,
        usersService: new UsersService(),
      },
    },
    {
      plugin: exportsPlugin,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistService,
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
