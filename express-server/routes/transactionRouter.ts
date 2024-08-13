import express from 'express';
import {
  getTransactionByIdHandler,
  listTransactionsHandler,
  issueBookHandler,
  returnBookHandler,
} from '../controllers/transactionController';
import { validateTransactionDataMiddleware } from '../middleware/middleware';

const transactionRouter = express.Router();

transactionRouter.get('/', listTransactionsHandler);
transactionRouter.get('/:id', getTransactionByIdHandler);
transactionRouter.post(
  '/',
  validateTransactionDataMiddleware,
  issueBookHandler
);
transactionRouter.patch('/:id', returnBookHandler);

export default transactionRouter;
