import express from 'express';
import joi from 'joi';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';

dotenv.config();
const server = express();
server.use(express.json());
server.use(cors());

const PORT = 5000;

const cadastroSchema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email({ tlds: { allow: false } }),
  password: joi.string().required()
});

const loginSchema = joi.object({
  email: joi.string().required().email({ tlds: { allow: false } }),
  password: joi.string().required()
});

const transacaoSchema = joi.object({
  value: joi.number().min(0).required(),
  description: joi.string().required(),
  type: joi.valid('entrada', 'saida').required()
});

const mongoClient = new MongoClient(process.env.DATABASE_URL);

let db;

try{
    await mongoClient.connect()
    db = mongoClient.db();
    console.log("Banco de dados MongoDB conectado!");
}catch(err){
    console.log(`Erro ao conectar ao MongoDB: ${err}`);
};

const usuariosCollection = db.collection("usuarios");
const sessoesCollection = db.collection("sessoes");

server.post("/sign-up", async (req, res)=>{
  const { name, email, password } = req.body;

  const validacao = cadastroSchema.validate({name, email, password}, { abortEarly: false });

  if(validacao.error){
    const erros = validacao.error.details.map((detail) => detail.message);
    res.status(422).send(erros);
    return;
};

  const emailExiste = !!(await usuariosCollection.findOne({ email: email }));

  if (emailExiste) return res.status(409).send('Email já cadastrado');

  const hashPassword = await bcrypt.hash(password, 10);

  try{
    const user = {
      name: name,
      email: email,
      password: hashPassword,
      transactions: [],
    };
  
    await usuariosCollection.insertOne(user);
    res.sendStatus(201);

  }catch(err){
      res.status(500).send(err);
  }
});

server.post("/login", async (req, res)=>{
  const {email, password} = req.body;

  const validacao = loginSchema.validate({email, password}, { abortEarly: false });

  if(validacao.error){
    const erros = validacao.error.details.map((detail) => detail.message);
    res.status(422).send(erros);
    return;
};

  const userEmail = await usuariosCollection.findOne({ email: email });

  if (!userEmail) return res.status(401).send('Email não cadastrado');

  const verifiqueSenha = await bcrypt.compare(password, userEmail.password);

  if (!verifiqueSenha) {
    return res.status(401).send('Senha incorreta');
  }

  const token = uuid();

  const sessaoData = {
    userId: userEmail._id,
    token
  };

  await sessoesCollection.insertOne(sessaoData);

  return res.send({
    token,
    name: userEmail.name
  });
});


server.get('/transaction', async (req, res) => {
  const autorizacaoData = req.headers.authorization;

  if (!autorizacaoData) return res.status(401).send('Coloque o token de autorização');

  const token = autorizacaoData.replace('Bearer ', '');

  const sessao = await sessoesCollection.findOne({ token });

  if (!sessao) return res.sendStatus(401);

  const user = await usuariosCollection.findOne({ _id: sessao.userId });

  if (!user) return res.sendStatus(404);

  res.send(user.transactions);
});

server.post('/transaction', async (req, res) => {
  const autorizacaoData = req.headers.authorization;
  const {value, description, type} = req.body;

  if (!autorizacaoData) return res.status(401).send('Informe o token de autorização');

  const token = autorizacaoData.replace('Bearer ', '');

  const sessao = await sessoesCollection.findOne({ token });

  if (!sessao) return res.sendStatus(401);

  const validacao = transacaoSchema.validate({value, description, type}, { abortEarly: false });

  if(validacao.error){
    const erros = validacao.error.details.map((detail) => detail.message);
    res.status(422).send(erros);
    return;
};

  const user = await usuariosCollection.findOne({ _id: sessao.userId });

  if (!user) return res.sendStatus(401);

  const novaTransacao = { ...validacao, date: dayjs().format('DD/MM') };

  await usuariosCollection.updateOne({
    _id: sessao.userId
  },
    {
      $set: { transactions: [...user.transactions, novaTransacao] }
    });

  res.sendStatus(201);
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});