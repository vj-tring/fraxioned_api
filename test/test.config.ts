// import { createConnection, Connection } from 'mysql2/promise';
// export const getConnection = async (): Promise<Connection> => {
//   return createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '1234',
//     database: 'fraxioned_testing',
//   });
// };
// export const baseurl = 'http://localhost:3009/api/v1';


import { createConnection, Connection } from 'mysql2/promise';
export const getConnection = async (): Promise<Connection> => {
  return createConnection({
    host: '192.168.1.47',
    user: 'admin',
    password: 'root',
    database: 'fraxioned_testing',
  });
};
export const baseurl = 'http://192.168.1.47:3009/api/v1';