const { sendError } = require("../utils/response");

/**
 * validate(schema) — validates req.body against a Joi schema
 *
 * Usage:
 *   router.post("/register", validate(registerSchema), register);
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message.replace(/"/g, ""));
    return sendError(res, 422, "Validation failed", errors);
  }
  next();
};

module.exports = validate;
