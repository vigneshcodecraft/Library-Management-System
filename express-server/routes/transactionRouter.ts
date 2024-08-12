import express from 'express';
import {
  getTransactionByIdHandler,
  listTransactionsHandler,
  issueBookHandler,
  returnBookHandler,
} from '../controllers/transactionController';

const transactionRouter = express.Router();

transactionRouter.get('/', listTransactionsHandler);
transactionRouter.get('/:id', getTransactionByIdHandler);
transactionRouter.post('/', issueBookHandler);
transactionRouter.patch('/:id', returnBookHandler);

export default transactionRouter;
