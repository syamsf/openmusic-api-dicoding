const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator, albumService) {
    this._service = service;
    this._validator = validator;
    this._albumService = albumService;

    autoBind(this);
  }

  async createSongHandler(request, h) {
    this._validator.validateSongsPayload(request.payload);

    if (request.payload.albumId) {
      await this._albumService.getAlbumById(request.payload.albumId);
    }

    const songId = await this._service.createSong(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Songs successfully added.',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  async getAllSongsHandler(request) {
    await this._validator.validateQuery(request.query);

    const songs = await this._service.getSongs(request.query);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: { song: song.data },
    });

    if (song.isCached) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async updateSongByIdHandler(request) {
    this._validator.validateSongsPayload(request.payload);
    const { id } = request.params;

    if (request.payload.albumId) {
      await this._albumService.getAlbumById(request.payload.albumId);
    }

    await this._service.updateSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Songs successfully updated.',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Songs successfully deleted',
    };
  }
}

module.exports = AlbumsHandler;
