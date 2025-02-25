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

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid(
    'image/apng',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ).required(),
}).unknown();

module.exports = { AlbumPayloadSchema, AlbumQuerySchema, ImageHeadersSchema };
