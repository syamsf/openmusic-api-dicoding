const { PayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const Collaboration = {
  validatePayload: (payload) => {
    const validationResult = PayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = Collaboration;
