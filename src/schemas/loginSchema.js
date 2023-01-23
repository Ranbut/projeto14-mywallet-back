import joi from 'joi';

export const loginSchema = joi.object({
    email: joi.string().required().email({ tlds: { allow: false } }),
    password: joi.string().required()
  });