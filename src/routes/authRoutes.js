import { Router } from 'express';
import { Login } from '../controllers/login.js';
import { Cadastro } from '../controllers/cadastro.js';
import { validateSchema } from '../middlewares/schemaMiddleware.js';
import { loginSchema } from '../schemas/loginSchema.js';
import { cadastroSchema } from '../schemas/cadastroSchema.js';

const router = Router();

router.post('/login', validateSchema(loginSchema), Login);
router.post('/sign-up', validateSchema(cadastroSchema), Cadastro);

export default router;