const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(
    service,
    validator,
    storageService,
    userAlbumLikeService,
  ) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._userAlbumLikeService = userAlbumLikeService;

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

  async uploadCoverImageHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    await this._service.updateAlbumCoverById(id, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async likeAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(id);
    await this._userAlbumLikeService.isAlreadyLikedAnAlbum(id, credentialId);
    await this._userAlbumLikeService.likeAlbum(id, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Successfully liked the album',
    });
    response.code(201);
    return response;
  }

  async unlikeAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(id);
    await this._userAlbumLikeService.unlikeAlbum(id, credentialId);

    return {
      status: 'success',
      message: 'Successfully disliked the album',
    };
  }

  async getTotalLikesHandler(request, h) {
    const { id } = request.params;

    await this._service.getAlbumById(id);
    const totalLikes = await this._userAlbumLikeService.getLikesCount(id);

    const response = h.response({
      status: 'success',
      data: { likes: totalLikes.total },
    });

    if (totalLikes.isCached) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = AlbumsHandler;
