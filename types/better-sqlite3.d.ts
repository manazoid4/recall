declare module 'better-sqlite3' {
  interface Database {
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(stmt: string): unknown;
    transaction<T>(fn: (...args: unknown[]) => T): (...args: unknown[]) => T;
  }
  interface Statement {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
  }
  const Database: {
    new (path: string): Database;
    (path: string): Database;
  };
  export = Database;
}
