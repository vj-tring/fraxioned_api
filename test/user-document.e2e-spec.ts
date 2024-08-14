import * as request from 'supertest';
import { baseurl } from './test.config';

process.env.DATABASE_NAME = 'fraxioned_testing';
describe('E2E test for User Document', () => {
  const url = `${baseurl}/user-documents`;
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
  describe('User Document Creation', () => {
    it('Successful user-document creation', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: 1 },
        createdBy: { id: 1 },
        documentName: 'string',
        documentURL: 'string',
      };
      const response = await request(url)
        .post('/')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      const { message, status } = response.body;
      expect(message).toBe('Document created successfully');
      expect(status).toBe(201);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: 1 },
        createdBy: { id: 1 },
        documentName: 'string',
        documentURL: 'string',
      };
      const response = await request(url)
        .post('/')
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
  describe('Fetch All User Documents', () => {
    it('Successful user-document fetch', async () => {
      const response = await request(url)
        .get('/')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { message, status } = response.body;
      expect(message).toBe('Documents fetched successfully');
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
  describe('Fetch Specific User Document', () => {
    it('Successful user-document fetch', async () => {
      const response = await request(url)
        .get('/2')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { message, status } = response.body;
      expect(message).toBe('Document fetched successfully');
      expect(status).toBe(200);
    });
    it('Unsuccessful user-document fetch', async () => {
      const response = await request(url)
        .get('/1')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/1')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific User Document', () => {
    it('Successful user-document update', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: 1 },
        updatedBy: { id: 1 },
        documentName: 'string',
        documentURL: 'string',
      };
      const response = await request(url)
        .patch('/2')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);

      const { message, status } = response.body;
      expect(message).toBe('Document updated successfully');
      expect(status).toBe(200);
    });
    it('Unsuccessful user-document update', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: 1 },
        updatedBy: { id: 1 },
        documentName: 'string',
        documentURL: 'string',
      };
      const response = await request(url)
        .patch('/1')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: 1 },
        updatedBy: { id: 1 },
        documentName: 'string',
        documentURL: 'string',
      };
      const response = await request(url)
        .patch('/1')
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
  describe('Delete Specific User Document', () => {
    it('Successful user-document deletion', async () => {
      const response = await request(url)
        .delete('/5')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { message, status } = response.body;
      expect(message).toBe('Document deleted successfully');
      expect(status).toBe(404);
    });
    it('User Document not found for delete', async () => {
      const response = await request(url)
        .delete('/1')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/1')
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
