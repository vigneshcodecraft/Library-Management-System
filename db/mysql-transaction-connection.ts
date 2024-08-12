import mysql, { QueryResult } from 'mysql2/promise';
export interface IConnection<QR> {
  initialize(): Promise<void>;
  query: <T extends QR>(sql: string, values: any) => Promise<T>;
}

export interface IConnectionFactory<QR> {
  acquirePoolConnection(): Promise<PoolConnection<QR>>;
  acquireTransactionPoolConnection(): Promise<TransactionPoolConnection<QR>>;
  acquireStandaloneConnection(): Promise<StandaloneConnection<QR>>;
  acquireTransactionConnection(): Promise<TransactionConnection<QR>>;
}

export abstract class StandaloneConnection<QR> implements IConnection<QR> {
  abstract initialize(): Promise<void>;
  abstract query<T extends QR>(sql: string, values: any): Promise<T>;
  abstract close(): Promise<void>;
}

export abstract class PoolConnection<QR> implements IConnection<QR> {
  abstract initialize(): Promise<void>;
  abstract query<T extends QR>(sql: string, values: any): Promise<T>;
  abstract release(): Promise<void>;
}

export abstract class TransactionConnection<QR> implements IConnection<QR> {
  abstract initialize(): Promise<void>;
  abstract query<T extends QR>(sql: string, values: any): Promise<T>;
  abstract close(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
}

export abstract class TransactionPoolConnection<QR> implements IConnection<QR> {
  abstract initialize(): Promise<void>;
  abstract query<T extends QR>(sql: string, values: any): Promise<T>;
  abstract release(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
}

// -----XXXXX-----

export class MySqlStandaloneConnection extends StandaloneConnection<QueryResult> {
  private connection: mysql.Connection | undefined;
  constructor(private readonly connectionString: string) {
    super();
  }

  async initialize() {
    if (this.connection) return;
    this.connection = await mysql.createConnection(this.connectionString);
  }
  async query<T extends QueryResult>(sql: string, values: any): Promise<T> {
    if (!this.connection) {
      await this.initialize();
    }
    const [result] = await this.connection!.query<T>(sql, values);
    return result;
  }
  async close(): Promise<void> {
    if (!this.connection) return;
    return this.connection.end();
  }
}

export class MySQLPoolConnection extends PoolConnection<QueryResult> {
  //private pool: mysql.Pool;
  private connection: mysql.PoolConnection | undefined;

  constructor(private readonly pool: mysql.Pool) {
    super();
  }

  async initialize(): Promise<void> {
    if (this.connection) return;
    this.connection = await this.pool.getConnection();
  }

  async query<T extends mysql.QueryResult>(
    sql: string,
    values: any
  ): Promise<T> {
    if (!this.connection) {
      await this.initialize();
    }
    const [result] = await this.connection!.query<T>(sql, values);
    return result;
  }

  async release(): Promise<void> {
    if (!this.connection) return;
    this.pool.releaseConnection(this.connection);
  }

  async shutdown(): Promise<void> {
    this.pool.end();
  }
}

export class MySQLTransactionConnection extends TransactionConnection<QueryResult> {
  private connection: mysql.Connection | undefined;
  constructor(private readonly connectionString: string) {
    super();
  }
  async initialize(): Promise<void> {
    if (this.connection) return;
    this.connection = await mysql.createConnection(this.connectionString);
    await this.connection.beginTransaction();
  }
  async query<T extends mysql.QueryResult>(
    sql: string,
    values: any
  ): Promise<T> {
    if (!this.connection) {
      await this.initialize();
    }
    const [result] = await this.connection!.query<T>(sql, values);
    return result;
  }
  async close(): Promise<void> {
    if (!this.connection) return;
    return this.connection.end();
  }
  async commit(): Promise<void> {
    if (!this.connection) return;
    this.connection.commit();
  }
  async rollback(): Promise<void> {
    if (!this.connection) return;
    this.connection.rollback();
  }
}

export class MySQLTransactionPoolConnection extends TransactionPoolConnection<QueryResult> {
  // private pool: mysql.Pool;
  private connection: mysql.PoolConnection | undefined;

  constructor(private readonly pool: mysql.Pool) {
    super();
  }

  async initialize(): Promise<void> {
    if (this.connection) return;
    this.connection = await this.pool.getConnection();
    await this.connection.beginTransaction();
  }
  async query<T extends mysql.QueryResult>(
    sql: string,
    values: any
  ): Promise<T> {
    if (!this.connection) {
      await this.initialize();
    }
    const [result] = await this.connection!.query<T>(sql, values);
    return result;
  }
  async release(): Promise<void> {
    if (!this.connection) return;
    this.pool.releaseConnection(this.connection);
  }
  async commit(): Promise<void> {
    if (!this.connection) return;
    this.connection.commit();
  }
  async rollback(): Promise<void> {
    if (!this.connection) return;
    this.connection.rollback();
  }
  async shutdown() {
    this.pool.end();
  }
}

interface DBConfig {
  /** The complete url to the dbms along with protocol, port , user name and password  */
  DbURL: string;
}

export class PoolConnectionFactory implements IConnectionFactory<QueryResult> {
  private pool: mysql.Pool;
  constructor(private readonly config: DBConfig) {
    this.pool = mysql.createPool(this.config.DbURL);
  }
  async acquireStandaloneConnection(): Promise<
    StandaloneConnection<mysql.QueryResult>
  > {
    const connection = new MySqlStandaloneConnection(this.config.DbURL);
    await connection.initialize();
    return connection;
  }
  async acquireTransactionConnection(): Promise<
    TransactionConnection<mysql.QueryResult>
  > {
    const connection = new MySQLTransactionConnection(this.config.DbURL);
    await connection.initialize();
    return connection;
  }
  async acquirePoolConnection(): Promise<PoolConnection<QueryResult>> {
    const connection = new MySQLPoolConnection(this.pool);
    await connection.initialize();
    return connection;
  }
  
  async acquireTransactionPoolConnection(): Promise<
    TransactionPoolConnection<QueryResult>
  > {
    const connection = new MySQLTransactionPoolConnection(this.pool);
    await connection.initialize();
    return connection;
  }

  async shutdown() {
    this.pool.end();
  }
}
