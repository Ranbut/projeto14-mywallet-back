import {sessoesCollection} from "../config/db.js";

export const validateAuth = async (req, res, next) => {
  const authorizacao = req.headers.authorization;

  if (!authorizacao) return res.status(401).send('Informe o token de autorização');

  const token = authorizacao.replace('Bearer ', '');

  const sessao = await sessoesCollection.findOne({ token });

  if (!sessao) return res.sendStatus(401);

  res.locals.session = sessao;

  next();
};