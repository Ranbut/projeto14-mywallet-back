import express from 'express';
import cors from 'cors';
import authRoute from './routes/authRoutes.js';
import transacaoRoutes from './routes/transacaoRoutes.js';

const server = express();
server.use(express.json());
server.use(cors());

server.use([authRoute, transacaoRoutes]);

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});

export default server;