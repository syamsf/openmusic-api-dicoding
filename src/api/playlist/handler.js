const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(service, validator, playlistActivitiesService) {
    this._service = service;
    this._validator = validator;
    this._playlistActivitiesService = playlistActivitiesService;

    autoBind(this);
  }

  async createPlaylistHandler(request, h) {
    this._validator.validatePostPayload(request.payload);

    const { id: ownerId } = request.auth.credentials;
    const { name } = request.payload;

    const playlistId = await this._service.createPlaylist({ name, ownerId });

    const response = h.response({
      status: 'success',
      message: 'Playlists successfully added.',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getAllPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._service.getPlaylist(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId, true);
    const playlists = await this._playlistActivitiesService.getPlaylistActivities(id);

    return {
      status: 'success',
      data: playlists,
    };
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylist(id);

    return {
      status: 'success',
      message: 'Successfully deleted song from playlist.',
    };
  }
}

module.exports = PlaylistHandler;
