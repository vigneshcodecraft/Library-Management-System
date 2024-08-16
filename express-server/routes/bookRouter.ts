import express from 'express';
import {
  getBookByIdHandler,
  listBooksHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
} from '../controllers/bookController';
import {
  authorizeRoles,
  validateBookDataMiddleware,
} from '../middleware/middleware';
import { verifyJWT } from '../middleware/verifyJWT';

const bookRouter = express.Router();
bookRouter.use(verifyJWT);
bookRouter.get('/', listBooksHandler);
bookRouter.get('/:id', getBookByIdHandler);
bookRouter.post(
  '/',
  authorizeRoles('admin'),
  validateBookDataMiddleware,
  createBookHandler
);
bookRouter.patch(
  '/:id',
  authorizeRoles('admin'),
  validateBookDataMiddleware,
  updateBookHandler
);
bookRouter.delete('/:id', authorizeRoles('admin'), deleteBookHandler);

export default bookRouter;
