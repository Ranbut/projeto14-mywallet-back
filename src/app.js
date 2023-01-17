import express from 'express';
import joi from 'joi';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const server = express();
server.use(express.json());
server.use(cors());

const PORT = 5000;

const usuarioSchema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email({ tlds: { allow: false } }),
  password: joi.string().min(6).required()
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

server.post("/sign-up", async (req, res)=>{
  const {name, email, password} = req.body;

  const usuarioExiste = await usuariosCollection.findOne({name, email});

  const validacao = usuarioSchema.validate({name, email, password}, { abortEarly: false });

  if(validacao.error){
      const erros = validacao.error.details.map((detail) => detail.message);
      res.status(422).send(erros);
      return;
  };

  if(usuarioExiste){
      res.sendStatus(409);
      return;
  }

  try{
     await usuariosCollection.insertOne({
      name,
      email,
      password
     });
     res.sendStatus(201);
  }catch(err){
      res.status(500).send(err);
  }
});

server.get("/login", async (req, res)=>{

});

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});