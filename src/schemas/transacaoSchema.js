import joi from 'joi';

export const transacaoSchema = joi.object({
    value: joi.number().min(0).required(),
    description: joi.string().required(),
    type: joi.valid('entrada', 'saida').required()
  });