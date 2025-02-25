const Joi = require('joi');

const PayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = { PayloadSchema };
