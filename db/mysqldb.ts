// SQL DB layer must facilitate a mechanism
// to connect with required data base server
// this will require url, post, username, password.
// it should be provide an API to execute a sql query

// Interactor will talk to this db layer to run their queries
// and get the result. Before they can talk, at global level the db
// layer should have been initialized. In our case library  interactor for
// example, can supply necessary DB configuration that db layer expects
// and initialize it.
import mysql from 'mysql2/promise';
/**
 * This config object must be passed to create the SQLDB Manager
 */
interface DBConfig {
  /** The complete url to the dbms along with protocol, port , user name and password  */
  DbURL: string;
}

interface Adapter {
  shutDown: () => Promise<void>;
  runQuery: <T>(sql: string, values: any[]) => Promise<T | undefined>;
}
export class MySQLAdapter implements Adapter {
  private pool: mysql.Pool;
  constructor(private readonly config: DBConfig) {
    this.pool = mysql.createPool(this.config.DbURL);
  }

  async shutDown() {
    return this.pool.end();
  }
  async runQuery<T>(sql: string, values: any[]): Promise<T | undefined> {
    let connection: mysql.PoolConnection | null = null;
    try {
      connection = await this.pool.getConnection();
      const [result] = await connection.query(sql, values);
      return result as T;
    } catch (err) {
      if (err instanceof Error) throw new Error(err.message);
    } finally {
      if (connection) {
        this.pool.releaseConnection(connection);
      }
    }
  }
}
