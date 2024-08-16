import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E test for Users', () => {
  const url = `${baseurl}/users`;
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
  describe('Fetch All Users', () => {
    it('Successful users fetch', async () => {
      const response = await request(url)
        .get('/')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('Users fetched successfully');
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
  describe('Fetch Specific User', () => {
    it('Successful user fetch', async () => {
      const response = await request(url)
        .get('/user/1')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.message).toBe('User fetched successfully');
    });
    it('Unsuccessful user fetch', async () => {
      const response = await request(url)
        .get('/user/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.message).toBe('User with ID 0 not found');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/user/1')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific User', () => {
    it('Successful user update', async () => {
      const credentials = {
        role: { id: 1 },
        firstName: 'Mail',
        lastName: 'Check',
        password: 'string',
        imageURL: 'string',
        isActive: true,
        addressLine1: 'string',
        addressLine2: 'string',
        state: 'string',
        country: 'string',
        city: 'string',
        zipcode: 'string',
        resetToken: 'string',
        resetTokenExpires: '2024-08-12T06:10:51.104Z',
        lastLoginTime: '2024-08-12T06:10:51.104Z',
        updatedBy: 3,
        contactDetails: [
          {
            contactType: 'string',
            contactValue: 'string',
          },
        ],
      };
      const response = await request(url)
        .patch('/user/5')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('User updated successfully');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .patch('/user/5')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Active Status Check', () => {
    it('User already in active state', async () => {
      const credentials = {
        isActive: true,
      };
      const response = await request(url)
        .patch('/user/5/set-active-status')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('User is already in state: active');
    });
    it('Deactivate user successfully', async () => {
      const credentials = {
        isActive: false,
      };
      const response = await request(url)
        .patch('/user/5/set-active-status')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('User state changed to: deactivated');
    });
    it('User already in deactive state', async () => {
      const credentials = {
        isActive: false,
      };
      const response = await request(url)
        .patch('/user/5/set-active-status')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('User is already in state: inactive');
    });
    it('Activate user successfully', async () => {
      const credentials = {
        isActive: true,
      };
      const response = await request(url)
        .patch('/user/5/set-active-status')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('User state changed to: activated');
    });

    it('Invalid token or user id', async () => {
      const credentials = {
        isActive: true,
      };
      const response = await request(url)
        .patch('/user/5/set-active-status')
        .send(credentials)
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
