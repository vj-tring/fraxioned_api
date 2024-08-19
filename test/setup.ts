import * as request from 'supertest';
import { baseurl } from './test.config';

const url1 = `${baseurl}/authentication`;

export let token: string;
export let userid: number;

interface LoginCredentials {
  email: string;
  password: string;
}

//Modify email and password correspond with the database records.
export const setup = async (): Promise<void> => {
  const login_credentials: LoginCredentials = {
    email: 'fraxionedownersportal@gmail.com',
    password: 'Admin@123',
  };
  const response = await request(url1)
    .post('/login')
    .set('Accept', 'application/json')
    .send(login_credentials);
  const { session, user } = response.body;
  token = session.token;
  userid = user.id;
};
