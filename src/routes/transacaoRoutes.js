import { Router } from "express";
import { PegarTransacao } from '../controllers/pegarTransacao.js';
import { CriarTransacao } from '../controllers/criarTransacao.js';
import { validateAuth } from "../middlewares/authMiddleware.js";
import { validateSchema } from "../middlewares/schemaMiddleware.js";
import { transacaoSchema } from "../schemas/transacaoSchema.js";

const router = Router();

router.use(validateAuth);
router.get('/transaction', PegarTransacao);
router.post('/transaction', validateSchema(transacaoSchema), CriarTransacao);

export default router;