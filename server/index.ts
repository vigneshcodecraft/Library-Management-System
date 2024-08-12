import {
  CustomRequest,
  CustomResponse,
  HTTPServer,
  RequestProcessor,
} from './server';
import { BookRepository } from '../article-management/book.repository';
import { IBook } from '../article-management/models/book.model';

const server = new HTTPServer(3000);
const db = server.getDbConnection();
const bookRepo = new BookRepository(db);

// const validateBookInputMiddleware: RequestProcessor = async (
//   request,
//   response,
//   next
// ) => {
//   if (request.method === 'POST' || request.method === 'PATCH') {
//     try {
//       const body: Omit<IBook, 'id'> = await request.body;
//       if (
//         !body ||
//         typeof body.title !== 'string' ||
//         typeof body.author !== 'string' ||
//         typeof body.publisher !== 'string' ||
//         typeof body.genre !== 'string' ||
//         typeof body.isbnNo !== 'string' ||
//         typeof body.pages !== 'number' ||
//         typeof body.totalCopies !== 'number' ||
//         typeof body.availableCopies !== 'number'
//       ) {
//         response.writeHead(400, { 'Content-Type': 'application/json' });
//         response.end(JSON.stringify({ error: 'Invalid input data' }));
//         return;
//       }
//     } catch (error) {
//       response.writeHead(400, { 'Content-Type': 'application/json' });
//       response.end(JSON.stringify({ error: 'Invalid JSON body' }));
//     }
//     if (next) {
//       console.log('next ');
//       next();
//     }
//   } else {
//     if (next) next();
//   }
// };
const validateBookDataMiddleware: RequestProcessor = async (
  request,
  response,
  next
) => {
  if (request.method === 'POST' || request.method === 'PATCH') {
    const body = await request.body;
    console.log(body);
    try {
      const isValidBook = (data: any): data is Omit<IBook, 'id'> => {
        return (
          typeof data.title === 'string' &&
          typeof data.author === 'string' &&
          typeof data.publisher === 'string' &&
          typeof data.genre === 'string' &&
          typeof data.isbnNo === 'string' &&
          typeof data.pages === 'number' &&
          typeof data.totalCopies === 'number' &&
          typeof data.availableCopies === 'number'
        );
      };
      if (!isValidBook(body)) {
        
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Invalid book data format' }));
      }
    } catch (error) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Invalid JSON body' }));
    }
    if (next) {
      next();
    }
  }
};

const parseJsonMiddleware = async (
  request: CustomRequest,
  response: CustomResponse,
  next: any
) => {
  if (request.method === 'POST' || request.method === 'PATCH') {
    request.body = new Promise((resolve, reject) => {
      let bodyData = '';
      request.on('data', (chunk) => {
        bodyData += chunk.toString();
      });

      request.on('end', async () => {
        try {
          const json = JSON.parse(bodyData);
          resolve(json);
        } catch (error) {
          response.writeHead(400);
          reject(new Error('Invalid JSON body'));
        }
      });
    });
  }
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  next();
};

const getBookByIdHandler = async (
  request: CustomRequest,
  response: CustomResponse
) => {
  const baseUrl = `http://${request.headers.host}`;
  const url = new URL(request.url ?? '', baseUrl);
  const bookId = url.searchParams.get('id');

  if (!bookId) {
    response.writeHead(400);
    response.end(JSON.stringify({ error: 'Book ID is required' }));
    return;
  }

  try {
    const book = await bookRepo.getById(Number(bookId));
    if (book) {
      response.writeHead(200);
      response.end(JSON.stringify(book));
    } else {
      response.writeHead(404);
      response.end(JSON.stringify({ error: 'Book not found' }));
    }
  } catch (error) {
    console.error('Error handling book request:', error);
    response.writeHead(500);
    response.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};

const listBooksHandler = async (
  request: CustomRequest,
  response: CustomResponse
) => {
  const baseUrl = `http://${request.headers.host}`;
  const url = new URL(request.url ?? '', baseUrl);
  const search = url.searchParams.get('search') ?? '';
  const limit = Number(url.searchParams.get('limit'));
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const books = await bookRepo.list({
      search: search,
      limit: limit,
      offset: offset,
    });
    if (books) {
      response.writeHead(200);
      response.end(JSON.stringify(books));
    } else {
      response.writeHead(404);
      response.end(JSON.stringify({ error: 'Books not found' }));
    }
  } catch (error) {
    console.error('Error handling book request:', error);
    response.writeHead(500);
    response.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};

const createBookHandler = async (
  request: CustomRequest,
  response: CustomResponse
) => {
  console.log('create');
  if (!request.body) {
    response.writeHead(400);
    response.end(JSON.stringify({ error: 'No body provided' }));
    return;
  }
  try {
    const book: IBook = await request.body;
    const result = await bookRepo.create(book);

    response.writeHead(200);
    response.end(JSON.stringify({ message: 'Book Created', result }));
  } catch (error) {
    console.error('Error inserting book:', error);
    response.writeHead(500);
    response.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};

const updateBookHandler = async (
  request: CustomRequest,
  response: CustomResponse
) => {
  if (!request.body) {
    response.writeHead(400);
    response.end(JSON.stringify({ error: 'No body provided' }));
    return;
  }
  try {
    const baseUrl = `http://${request.headers.host}`;
    const url = new URL(request.url ?? '', baseUrl);
    const bookId = Number(url.searchParams.get('id'));
    const book: IBook = await request.body;
    const result = await bookRepo.update(bookId, book);
    if (result) {
      response.writeHead(200);
      response.end(JSON.stringify({ message: 'Book Updated' }));
    } else {
      response.writeHead(404);
      response.end(JSON.stringify({ error: 'Book not found' }));
    }
  } catch (error) {
    console.error('Error updating book:', error);
    response.writeHead(500);
    response.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};

const deleteBookHandler = async (
  request: CustomRequest,
  response: CustomResponse
) => {
  try {
    const baseUrl = `http://${request.headers.host}`;
    const url = new URL(request.url ?? '', baseUrl);
    const bookId = Number(url.searchParams.get('id'));

    const result = await bookRepo.delete(bookId);
    if (result) {
      response.writeHead(200);
      response.end(JSON.stringify({ message: 'Book Deleted' }));
    } else {
      response.writeHead(404);
      response.end(JSON.stringify({ error: 'Book not found' }));
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    response.writeHead(500);
    response.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};

server.use(parseJsonMiddleware);
server.get('/books', listBooksHandler);
server.get('/book', getBookByIdHandler);
server.post('/books', validateBookDataMiddleware, createBookHandler);
server.patch('/books', validateBookDataMiddleware, updateBookHandler);
server.delete('/books', deleteBookHandler);
