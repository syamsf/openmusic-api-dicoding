const ClientError = require('./ClientError');

class AuthorizationError extends ClientError {
  constructor(message = 'You are not authorized to do this action.') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

module.exports = AuthorizationError;
