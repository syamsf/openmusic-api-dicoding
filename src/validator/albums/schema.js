const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(3000)
    .required(),
});

const AlbumQuerySchema = Joi.object({
  name: Joi.string().empty(''),
  year: Joi.number().integer().min(1900).max(3000)
    .empty(0),
});

module.exports = { AlbumPayloadSchema, AlbumQuerySchema };
