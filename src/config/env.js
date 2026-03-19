const Joi = require("joi");
require("dotenv").config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default("7d"),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRE: Joi.string().default("30d"),
  CORS_ORIGIN: Joi.string().default("*"),
}).unknown(true); // allow other env vars

const { error, value: env } = envSchema.validate(process.env);

if (error) {
  console.error(`[ENV] Validation failed: ${error.message}`);
  process.exit(1);
}

module.exports = env;
