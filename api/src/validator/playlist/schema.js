const Joi = require('joi');

const PlaylistPostPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistUpdateSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PlaylistPostPayloadSchema, PlaylistUpdateSongPayloadSchema };
