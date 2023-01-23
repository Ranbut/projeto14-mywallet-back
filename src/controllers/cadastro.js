import bcrypt from 'bcrypt';
import {usuariosCollection} from '../config/db.js';

export const Cadastro = async (req, res) => {
  const cadastroDados = req.body;

  const emailEmUso = !!(await usuariosCollection.findOne({ email: cadastroDados.email }));

  if (emailEmUso) return res.status(409).send('Email já cadastrado');

  const password = await bcrypt.hash(cadastroDados.password, 10);

  const user = {
    name: cadastroDados.name,
    email: cadastroDados.email,
    password: password,
    transactions: [],
  };

  await usuariosCollection.insertOne(user);
  res.sendStatus(201);
}