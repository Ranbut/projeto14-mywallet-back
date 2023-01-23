import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import {usuariosCollection, sessoesCollection} from '../config/db.js';

export const Login = async (req, res) => {
  const loginDados = req.body;

  const user = await usuariosCollection.findOne({ email: loginDados.email });

  if (!user) return res.status(401).send('Email não cadastrado');

  const senhaCorresponde = await bcrypt.compare(loginDados.password, user.password);

  if (!senhaCorresponde) {
    return res.status(401).send('Senha incorreta');
  }

  const token = uuid();

  const sessionInfo = {
    userId: user._id,
    token
  };

  await sessoesCollection.insertOne(sessionInfo);

  return res.send({
    token,
    name: user.name
  });
}