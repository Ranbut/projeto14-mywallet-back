import joi from 'joi';

export const cadastroSchema = joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().email({ tlds: { allow: false } }),
    password: joi.string().required()
  });