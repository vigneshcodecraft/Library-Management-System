import express from 'express';
import {
  getBookByIdHandler,
  listBooksHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
} from '../controllers/bookController';
import { validateBookDataMiddleware } from '../middleware/middleware';

const bookRouter = express.Router();

bookRouter.get('/', listBooksHandler);
bookRouter.get('/:id', getBookByIdHandler);
bookRouter.post('/', validateBookDataMiddleware, createBookHandler);
bookRouter.patch('/:id', validateBookDataMiddleware, updateBookHandler);
bookRouter.delete('/:id', deleteBookHandler);

export default bookRouter;
