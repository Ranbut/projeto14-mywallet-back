import {usuariosCollection} from '../config/db.js';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

export const CriarTransacao = async (req, res) =>{
  const transacaoDados = req.body;

  const { session: sessao } = res.locals;

  const user = await usuariosCollection.findOne({ _id: sessao.userId });

  if (!user) return res.sendStatus(401);

  const newTransaction = { ...transacaoDados, date: dayjs().format('DD/MM'), id: uuid() };

  await usuariosCollection.updateOne({
    _id: sessao.userId
  },
    {
      $set: { transactions: [...user.transactions, newTransaction] }
    });

  res.sendStatus(201);

}