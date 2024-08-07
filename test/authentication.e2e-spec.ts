import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { baseurl } from './test.config';

describe('Authentication', () => {
  const url = `${baseurl}/authentication`;
  let token: string;
  let userid: number;

  describe('Login', () => {
    it('Successful Login', async () => {
      const valid_credentials = {
        email: 'dharshanramk@gmail.com',
        password: 'Admin@123',
      };
      const response = await request(url)
        .post('/login')
        .set('Accept', 'application/json')
        .send(valid_credentials)
        .expect('Content-Type', /json/)
        .expect(HttpStatus.CREATED);

      const { message, session, status, user } = response.body;
      expect(message).toBe('Login successful');
      expect(session).toHaveProperty('token');
      expect(status).toBe(200);
      token = session.token;
      userid = user.id;
    });

    it('Unsuccessful Login', async () => {
      const invalid_credentials = {
        email: 'dharshanramk@gmail.com',
        password: 'Admin',
      };
      const response = await request(url)
        .post('/login')
        .set('Accept', 'application/json')
        .send(invalid_credentials)
        .expect('Content-Type', /json/);

      const { message, status } = response.body;
      expect(message).toBe('Invalid credentials');
      expect(status).toBe(401);
    });

    it('User Not Found', async () => {
      const invalid_credentials2 = {
        email: 'email@email.com',
        password: 'Password',
      };
      const response = await request(url)
        .post('/login')
        .set('Accept', 'application/json')
        .send(invalid_credentials2)
        .expect('Content-Type', /json/);

      const { message, status } = response.body;
      expect(message).toBe('User not found');
      expect(status).toBe(404);
    });
  });
  describe('Forget Password', () => {
    it('Send Link Successfully', async () => {
      const forgotmail = {
        email: 'dharshanramk@gmail.com',
      };
      const response = await request(url)
        .post('/forgotPassword')
        .set('Accept', 'application/json')
        .send(forgotmail)
        .expect('Content-Type', /json/)
        .expect(HttpStatus.OK);

      const { message } = response.body;
      expect(message).toBe('Password reset email sent successfully');
    });
    it('User Not Found', async () => {
      const forgotinvalidmail = {
        email: 'gmail@gmail.com',
      };
      const response = await request(url)
        .post('/forgotPassword')
        .set('Accept', 'application/json')
        .send(forgotinvalidmail)
        .expect('Content-Type', /json/)
        .expect(HttpStatus.OK);

      const { message } = response.body;
      expect(message).toBe(
        'The account associated with this user was not found',
      );
    });
  });
  describe('Reset Password', () => {
    it('Successfully Reset Password', async () => {
      const reset = {
        oldPassword: 'Admin@123',
        newPassword: 'Admin@12',
        userId: 3,
      };
      const response = await request(url)
        .post('/resetPassword')
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .send(reset)
        .expect('Content-Type', /json/)
        .expect(HttpStatus.OK);

      const { message } = response.body;
      expect(message).toBe('Password reset successfully');
    });
    it('Invalid Token or User id', async () => {
      const reset1 = {
        oldPassword: 'Admin@123',
        newPassword: 'Admin@12',
        userId: 0,
      };
      const response = await request(url)
        .post('/resetPassword')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .send(reset1)
        .expect('Content-Type', /json/)
        .expect(HttpStatus.UNAUTHORIZED);

      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
    it('Wrong Old password', async () => {
      const reset2 = {
        oldPassword: 'Admin@111',
        newPassword: 'Admin@123',
        userId: 3,
      };
      const response = await request(url)
        .post('/resetPassword')
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .send(reset2)
        .expect('Content-Type', /json/);

      const { message } = response.body;
      expect(message).toBe('The provided old password is incorrect');
    });
  });
  describe('Logout', () => {
    it('Logout Successful', async () => {
      await request(url)
        .post('/logout')
        .set('Accept', 'application/json')
        .set('Authorization', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });
});
