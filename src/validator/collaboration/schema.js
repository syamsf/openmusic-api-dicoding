const Joi = require('joi');

const PayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { PayloadSchema };
