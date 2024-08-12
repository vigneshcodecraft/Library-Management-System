import http from 'node:http';
import { URL } from 'node:url';
import mysql from 'mysql2/promise';
import { AppEnvs } from '../read-env';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';

export interface CustomRequest extends http.IncomingMessage {
  [key: string]: any;
}

export type CustomResponse = http.ServerResponse;

export type NextMiddlewareExecutor = (error?: Error) => void;

type NextMiddlewareExecutorCreator = (
  req: CustomRequest,
  response: CustomResponse,
  next: number
) => NextMiddlewareExecutor;

export type AllowedHTTPMethods = 'POST' | 'PATCH' | 'DELETE' | 'GET' | 'PUT';

export type RequestProcessor = (
  request: CustomRequest,
  response: CustomResponse,
  next?: NextMiddlewareExecutor
) => void;

type URLPath = string;
type RequestProcessorPathMap = Record<URLPath, RequestProcessor[]>;

export class HTTPServer {
  private port: number;
  private server: ReturnType<typeof http.createServer>;

  private processorsMap: Record<AllowedHTTPMethods, RequestProcessorPathMap> = {
    GET: {},
    POST: {},
    PATCH: {},
    DELETE: {},
    PUT: {},
  };

  private globalProcessors: RequestProcessor[] = [];

  private dbConnection: MySql2Database<Record<string, never>> | undefined;

  constructor(port: number) {
    this.port = port;

    this.server = http.createServer(
      (request: http.IncomingMessage, response: CustomResponse) => {
        if (
          request.method !== 'GET' &&
          request.method !== 'POST' &&
          request.method !== 'PATCH' &&
          request.method !== 'DELETE'
        ) {
          response
            .writeHead(500)
            .end(`Sorry, currently not handling ${request.method}`);
          return;
        }
        this.handleRequest(request, response);
      }
    );

    this.server.listen(port, () => {
      console.log('listening at port: ', port);
    });

    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      const pool = mysql.createPool(AppEnvs.DATABASE_URL);
      const db: MySql2Database<Record<string, never>> = drizzle(pool);
      this.dbConnection = db;
      console.log('Database connected successfully.');
    } catch (error) {
      console.error('Database connection failed: ', error);
    }
  }

  public getDbConnection(): MySql2Database<Record<string, never>> {
    if (this.dbConnection) {
      return this.dbConnection;
    } else {
      throw new Error('Database connection failed');
    }
  }

  private handleRequest(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ) {
    if (request.method !== undefined) {
      const method = request.method as AllowedHTTPMethods;
      const baseUrl = `http://${request.headers.host}`;
      const url = new URL(request.url ?? '', baseUrl);
      const path = url.pathname;

      this.executeRequestMiddlewares(
        request,
        response,
        this.globalProcessors,
        0
      );

      const pathMap = this.processorsMap[method];

      if (pathMap[path]) {
        const middleware = pathMap[path];
        this.executeRequestMiddlewares(request, response, middleware, 0);
      } else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Not Found');
      }
    }
  }
  private nextFunctionCreator(
    request: CustomRequest,
    response: CustomResponse, //TODO: Also pass the middleware array too as an arg to this
    middleware: RequestProcessor[],
    nextIndex: number
  ): NextMiddlewareExecutor {
    return (error?: Error) => {
      // TODO: Think about coming up with custom error, say AppError, that can
      // have a proper http error code such as 400, 403, 500 etc
      // and a helpful message
      // response.end(error.code, error.message);
      if (error) {
        console.error(`Error: ${error.message}`);
        response
          .writeHead(500, { 'Content-Type': 'application/json' })
          .end(JSON.stringify({ error: error.message }));
      } else {
        const middlewaresCount = middleware.length;
        if (nextIndex < middlewaresCount) {
          this.executeRequestMiddlewares(
            request,
            response,
            middleware,
            nextIndex
          ); // pass the middleware array as another arg
        }
      }
    };
  }

  private executeRequestMiddlewares(
    request: CustomRequest,
    response: CustomResponse, // TODO: Add the middleware array arg here so that you can reuse the same functions for global as well as request specific middlewares
    middleware: RequestProcessor[],
    nextIndex: number
  ) {
    // const currentMiddleWare =
    //   this.middlewareMap[request.method! as AllowedHTTPMethods]?.[nextIndex];
    // currentMiddleWare?.(
    //   request,
    //   response,
    //   this.nextFunctionCreator(request, response, nextIndex)
    // );

    const currentMiddleWare = middleware[nextIndex];
    if (currentMiddleWare) {
      currentMiddleWare(
        request,
        response,
        this.nextFunctionCreator(request, response, middleware, nextIndex + 1)
      );
    }
  }

  // Methods to help register processors for respective methods and paths
  public get(path: string, ...middleware: RequestProcessor[]) {
    this.registerMethod('GET', path, middleware);
  }

  public post(path: string, ...middleware: RequestProcessor[]) {
    this.registerMethod('POST', path, middleware);
  }

  public put(path: string, ...middleware: RequestProcessor[]) {
    this.registerMethod('PUT', path, middleware);
  }

  public delete(path: string, ...middleware: RequestProcessor[]) {
    this.registerMethod('DELETE', path, middleware);
  }

  public patch(path: string, ...middleware: RequestProcessor[]) {
    this.registerMethod('PATCH', path, middleware);
  }

  public use(processor: RequestProcessor) {
    this.globalProcessors.push(processor);
  }

  public registerMethod(
    method: AllowedHTTPMethods,
    path: string,
    middleware: RequestProcessor[]
  ) {
    if (!this.processorsMap[method][path]) {
      this.processorsMap[method][path] = [];
    }
    if (Array.isArray(middleware)) {
      this.processorsMap[method][path].push(...middleware);
    } else {
      this.processorsMap[method][path].push(middleware);
    }
  }
}
