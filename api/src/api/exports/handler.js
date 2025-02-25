const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, validator, playlistService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;

    autoBind(this);
  }

  async exportPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    this._validator.validatePayload(request.payload);
    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistService.getPlaylistById(playlistId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
