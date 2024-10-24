import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for User Session', () => {
  const url = `${baseurl}/user-sessions`;
  let id: number;

  beforeAll(async () => {
    await setup();
  }, 100000);

  describe('User Session Creation', () => {
    it('Successful user-session creation', async () => {
      const credentials = {
        user: { id: 1 },
        createdBy: { id: 1 },
        updatedBy: { id: 1 },
        token: 'nekottokent764bzhxbhjgzgxvg',
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
      const { message, status, userSession } = response.body;
      expect(message).toBe('User session created successfully');
      expect(status).toBe(201);
      id = userSession.id;
    });
    it('User Session already exist', async () => {
      const credentials = {
        user: { id: 1 },
        createdBy: { id: 1 },
        updatedBy: { id: 1 },
        token: 'nekottokent764bzhxbhjgzgxvg',
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
        user: { id: 1 },
        createdBy: { id: 1 },
        updatedBy: { id: 1 },
        token: 'nekottokent764bzhxbhjgzgxvg',
        expiresAt: '2024-08-13T08:53:04.646Z',
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
        .get(`/user-session/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresAt');
    });
    it('Unsuccessful user-session fetch', async () => {
      const response = await request(url)
        .get('/user-session/0')
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
        .get('/user-session/0')
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
        updatedBy: { id: 1 },
        token:
          '534251e668624cbc28a03c73fcf1a00f12ad4801dbda9b5349fd18306eb4adc2467af23913442947b55d9c7673caf85a',
        expiresAt: '2024-08-13T08:53:30.195Z',
      };
      const response = await request(url)
        .patch(`/user-session/${id}`)
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
        updatedBy: { id: 1 },
        token: 'update',
        expiresAt: '2024-08-13T08:53:30.195Z',
      };
      const response = await request(url)
        .patch('/user-session/0')
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
        .patch('/user-session/0')
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
        .delete(`/user-session/${id}`)
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
        .delete('/user-session/0')
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
        .delete('/user-session/0')
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
