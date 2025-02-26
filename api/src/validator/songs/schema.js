const Joi = require('joi');

const currentYear = new Date().getFullYear();

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear)
    .required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().min(1).optional(),
  albumId: Joi.string().optional(),
});

const SongQuerySchema = Joi.object({
  title: Joi.string().empty(''),
  year: Joi.number().integer().min(1900).max(currentYear)
    .empty(0),
  genre: Joi.string().empty(''),
  performer: Joi.string().empty(''),
  duration: Joi.number().integer().min(1).empty(0),
  albumId: Joi.string().empty(''),
});

module.exports = { SongPayloadSchema, SongQuerySchema };
