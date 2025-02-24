const { PlaylistUpdateSongPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistSongsValidator = {
  validateModifySongPayload: (payload) => {
    const validationResult = PlaylistUpdateSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistSongsValidator;
