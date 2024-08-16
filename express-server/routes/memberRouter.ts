import express from 'express';
import {
  getMemberByIdHandler,
  listMembersHandler,
  createMemberHandler,
  updateMemberHandler,
  deleteMemberHandler,
} from '../controllers/memberController';
import { handleRegister } from '../controllers/registerController';
import { handleLogin } from '../controllers/authController';
import {
  authorizeRoles,
  validateMemberDataMiddleware,
} from '../middleware/middleware';
import { handleLogout } from '../controllers/logoutController';
import { verifyJWT } from '../middleware/verifyJWT';
import { handleRefreshToken } from '../controllers/refreshTokenController';
const app = express();

export const memberRouter = express.Router();

memberRouter.post('/register', handleRegister);
memberRouter.post('/login', handleLogin);
memberRouter.get('/refresh', handleRefreshToken);
memberRouter.post('/logout', handleLogout);
memberRouter.use(verifyJWT);
memberRouter.get('/', authorizeRoles('admin'), listMembersHandler);
memberRouter.get('/:id', getMemberByIdHandler);
memberRouter.post(
  '/',
  authorizeRoles('admin'),
  validateMemberDataMiddleware,
  createMemberHandler
);
memberRouter.patch(
  '/:id',
  authorizeRoles('admin'),
  validateMemberDataMiddleware,
  updateMemberHandler
);
memberRouter.delete('/:id', authorizeRoles('admin'), deleteMemberHandler);

app.use(memberRouter);
