const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async createUserHandler(request, h) {
    this._validator.validatePayload(request.payload);

    const userId = await this._service.createUser(request.payload);

    const response = h.response({
      status: 'success',
      message: 'User successfully added.',
      data: {
        userId,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
