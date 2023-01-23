import {sessoesCollection, usuariosCollection} from '../config/db.js';

export const PegarTransacao = async (req, res) =>{
  const autorizacaoData = req.headers.authorization;
  
  if (!autorizacaoData) return res.status(401).send('Coloque o token de autorização');
  
  const token = autorizacaoData.replace('Bearer ', '');
  
  const sessao = await sessoesCollection.findOne({ token });
  
  if (!sessao) return res.sendStatus(401);
  
  const user = await usuariosCollection.findOne({ _id: sessao.userId });
  
  if (!user) return res.sendStatus(404);
  
  res.send(user.transactions);
}