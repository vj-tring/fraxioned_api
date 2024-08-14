import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E test for User Session', () => {
  const url = `${baseurl}/user-sessions`;
  const url1 = `${baseurl}/authentication`;
  let token: string;
  let userid: number;

  beforeAll(async () => {
    const valid_credentials = {
      email: 'dharshanramk@gmail.com',
      password: 'Admin@12',
    };
    const response = await request(url1)
      .post('/login')
      .set('Accept', 'application/json')
      .send(valid_credentials);
    const { session, user } = response.body;
    token = session.token;
    userid = user.id;
  });
  describe('User Session Creation', () => {
    it('Successful user-session creation', async () => {
      const credentials = {
        user: { id: 3 },
        createdBy: { id: 3 },
        updatedBy: { id: 3 },
        token: 'nekottoken',
        expiresAt: '2024-08-13T08:53:04.646Z',
      };
      const response = await request(url)
        .post('/user-session')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      const { message, status } = response.body;
      expect(message).toBe('User session created successfully');
      expect(status).toBe(201);
    });
    it('User Session already exist', async () => {
      const credentials = {
        user: { id: 3 },
        createdBy: { id: 3 },
        updatedBy: { id: 3 },
        token: 'string',
        expiresAt: '2024-08-13T08:53:04.646Z',
      };
      const response = await request(url)
        .post('/user-session')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Internal server error');
      expect(response.body.statusCode).toBe(500);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        startDate: '2024-08-03',
        endDate: '2024-08-03',
        createdBy: { id: 3 },
        name: 'holiday',
        year: 2024,
      };
      const response = await request(url)
        .post('/user-session')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);

      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Fetch All User Sessions', () => {
    it('Successful user-session fetch', async () => {
      const response = await request(url)
        .get('/')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { message, status } = response.body;
      expect(message).toBe('User sessions fetched successfully');
      expect(status).toBe(200);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Fetch Specific User Session', () => {
    it('Successful user-session fetch', async () => {
      const response = await request(url)
        .get('/user-session/1')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresAt');
    });
    it('Unsuccessful user-session fetch', async () => {
      const response = await request(url)
        .get('/user-session/70')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { error, statusCode } = response.body;
      expect(error).toBe('Not Found');
      expect(statusCode).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/user-session/1')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific User Session', () => {
    it('Successful user-session update', async () => {
      const credentials = {
        updatedBy: { id: 3 },
        token: 'update',
        expiresAt: '2024-08-13T08:53:30.195Z',
      };
      const response = await request(url)
        .patch('/user-session/2')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);

      const { message, status } = response.body;
      expect(message).toBe('User session updated successfully');
      expect(status).toBe(200);
    });
    it('Unsuccessful user-session update', async () => {
      const credentials = {
        updatedBy: { id: 3 },
        token: 'update',
        expiresAt: '2024-08-13T08:53:30.195Z',
      };
      const response = await request(url)
        .patch('/user-session/70')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { error, statusCode } = response.body;
      expect(error).toBe('Not Found');
      expect(statusCode).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        user: { id: 3 },
        createdBy: { id: 3 },
        updatedBy: { id: 3 },
        token: 'string',
        expiresAt: '2024-08-13T08:53:04.646Z',
      };
      const response = await request(url)
        .patch('/user-session/1')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific User Session', () => {
    it('Successful user-session deletion', async () => {
      const response = await request(url)
        .delete('/user-session/103')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { message, status } = response.body;
      expect(message).toBe('User session deleted successfully');
      expect(status).toBe(200);
    });
    it('User Session not found for delete', async () => {
      const response = await request(url)
        .delete('/user-session/70')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { error, statusCode } = response.body;
      expect(error).toBe('Not Found');
      expect(statusCode).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/user-session/4')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
});
