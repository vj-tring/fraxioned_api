import { createConnection, Connection } from 'mysql2/promise';
export const getConnection = async (): Promise<Connection> => {
  return createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'fraxioned_testing',
  });
};
export const baseurl = 'http://localhost:3009/api/v1';
