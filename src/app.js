import express from 'express';
import joi from 'joi';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

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

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});