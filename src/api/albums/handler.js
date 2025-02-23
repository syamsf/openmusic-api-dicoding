const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async createAlbumHandler(request, h) {
    this._validator.validateAlbumsPayload(request.payload);

    const albumId = await this._service.createAlbum(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album successfully added.',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAllAlbumsHandler(request) {
    await this._validator.validateQuery(request.query);

    const albums = await this._service.getAlbums(request.query);

    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async updateAlbumByIdHandler(request) {
    this._validator.validateAlbumsPayload(request.payload);
    const { id } = request.params;

    await this._service.updateAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album successfully updated.',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album successfully deleted.',
    };
  }
}

module.exports = AlbumsHandler;
