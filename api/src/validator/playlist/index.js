const { PlaylistPostPayloadSchema, PlaylistUpdateSongPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistValidator = {
  validatePostPayload: (payload) => {
    const validationResult = PlaylistPostPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateModifySongPayload: (payload) => {
    const validationResult = PlaylistUpdateSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
