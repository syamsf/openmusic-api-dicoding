const Joi = require('joi');

const PlaylistUpdateSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PlaylistUpdateSongPayloadSchema };
