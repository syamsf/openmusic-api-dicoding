const autoBind = require('auto-bind');

class CollaborationHandler {
  constructor(service, validator, playlistService, usersService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;
    this._usersService = usersService;

    autoBind(this);
  }

  async createCollaborationHandler(request, h) {
    this._validator.validatePayload(request.payload);
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(request.payload.playlistId, credentialId);
    await this._usersService.getUserById(request.payload.userId);

    const collaborationId = await this._service.createCollaboration(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Collaborator successfully added.',
      data: {
        collaborationId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validatePayload(request.payload);
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(request.payload.playlistId, credentialId);
    await this._service.deleteCollaboration(request.payload);

    return {
      status: 'success',
      message: 'Collaborator successfully deleted.',
    };
  }
}

module.exports = CollaborationHandler;
