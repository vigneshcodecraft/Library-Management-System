import express from 'express';
import {
  getMemberByIdHandler,
  listMembersHandler,
  createMemberHandler,
  updateMemberHandler,
  deleteMemberHandler,
} from '../controllers/memberController';
import { handleRegister } from '../controllers/reqisterController';
import { handleLogin } from '../controllers/authController';
import { validateMemberDataMiddleware } from '../middleware/middleware';
import { handleLogout } from '../controllers/logoutController';
import { verifyJWT } from '../middleware/verifyJWT';
const app = express();

export const memberRouter = express.Router();

memberRouter.post('/register', handleRegister);
memberRouter.post('/login', handleLogin);
memberRouter.post('/logout', handleLogout);
memberRouter.get('/', verifyJWT,listMembersHandler);
memberRouter.get('/:id', verifyJWT,getMemberByIdHandler);
memberRouter.post('/', verifyJWT,validateMemberDataMiddleware, createMemberHandler);
memberRouter.patch('/:id',verifyJWT, validateMemberDataMiddleware, updateMemberHandler);
memberRouter.delete('/:id',verifyJWT, deleteMemberHandler);

app.use(memberRouter);
