const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(service, validator, songsService, playlistService, playlistSongActivitiesService) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService;
    this._playlistService = playlistService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;

    autoBind(this);
  }

  async getAllPlaylistsWithSongsHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId, true);
    const playlist = await this._service.getPlaylistByIdWithSongs(id);

    const response = h.response({
      status: 'success',
      data: { playlist: playlist.data },
    });

    if (playlist.isCached) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async addSongToPlaylistSongsHandler(request, h) {
    this._validator.validateModifySongPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId, true);
    await this._songsService.getSongById(songId);
    await this._service.addSongToPlaylist(id, songId);
    await this._playlistSongActivitiesService.createPlaylistActivities({
      playlistId: id,
      songId,
      userId: credentialId,
      action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Successfully added song to playlist.',
    });

    response.code(201);
    return response;
  }

  async deleteSongFromPlaylistSongsHandler(request) {
    this._validator.validateModifySongPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId, true);
    await this._songsService.getSongById(songId);
    await this._service.deleteSongFromPlaylist(id, songId);
    await this._playlistSongActivitiesService.createPlaylistActivities({
      playlistId: id,
      songId,
      userId: credentialId,
      action: 'delete',
    });

    return {
      status: 'success',
      message: 'Successfully deleted song from playlist.',
    };
  }
}

module.exports = PlaylistSongsHandler;
