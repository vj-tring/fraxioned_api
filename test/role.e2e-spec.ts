import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E test for Role', () => {
  const url = `${baseurl}/roles`;
  const url1 = `${baseurl}/authentication`;
  let token: string;
  let userid: number;

  it('Login', async () => {
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
  describe('Role Creation', () => {
    it('Successful role creation', async () => {
      const credentials = {
        createdBy: { id: 1 },
        roleName: 'Admin0',
        roleDescription: 'description',
      };
      const response = await request(url)
        .post('/role')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);

      const { message } = response.body;
      expect(message).toBe('Role created successfully');
    });
    it('Role already exist', async () => {
      const credentials = {
        createdBy: { id: 1 },
        roleName: 'Admin',
        roleDescription: 'description',
      };
      const response = await request(url)
        .post('/role')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(409);

      const { message } = response.body;
      expect(message).toBe('Role with name Admin already exists');
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        createdBy: { id: 1 },
        roleName: 'Admin',
        roleDescription: 'description',
      };
      const response = await request(url)
        .post('/role')
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
  describe('Fetch All Roles', () => {
    it('Successful roles fetch', async () => {
      const response = await request(url)
        .get('/')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('Roles fetched successfully');
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
  describe('Fetch Specific Role', () => {
    it('Successful role fetch', async () => {
      const response = await request(url)
        .get('/role/1')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveProperty('roleName');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/role/1')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific Role', () => {
    it('Successful role update', async () => {
      const credentials = {
        updatedBy: { id: 1 },
        roleName: 'Admin',
        roleDescription: 'admin-role',
      };
      const response = await request(url)
        .patch('/role/1')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('Role updated successfully');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/role/3')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific Role', () => {
    it('Successful role deletion', async () => {
      const response = await request(url)
        .delete('/role/9')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('Role deleted successfully');
    });
    it('Role id not found for delete', async () => {
      const response = await request(url)
        .delete('/role/8')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(404);
      const { message } = response.body;
      expect(message).toBe('Role with ID 8 not found');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/role/4')
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
