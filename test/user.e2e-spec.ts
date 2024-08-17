import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E test for Users', () => {
  const url = `${baseurl}/users`;
  const url1 = `${baseurl}/authentication`;
  let token: string;
  let userid: number;
  let id: number;

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
  describe('User Creation', () => {
    it('Successful user creation', async () => {
      const credentials = {
        role: { id: 1 },
        firstName: 'Fname',
        lastName: 'Lname',
        password: 'password',
        imageURL: 'URL',
        isActive: true,
        addressLine1: 'Address 1',
        addressLine2: 'Address 2',
        state: 'state',
        country: 'country',
        city: 'city',
        zipcode: 'zipcode',
        resetToken: 'resetToken',
        resetTokenExpires: '2024-08-17T11:23:44.467Z',
        lastLoginTime: '2024-08-17T11:23:44.467Z',
        createdBy: 1,
        contactDetails: [{ contactType: 'string', contactValue: 'string' }],
      };
      const response = await request(url)
        .post('/user')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      const { message, user } = response.body;
      expect(message).toBe('User created successfully');
      id = user.id;
    });
    it('User already exist', async () => {
      const credentials = {
        role: { id: 1 },
        firstName: 'Fname',
        lastName: 'Lname',
        password: 'password',
        imageURL: 'URL',
        isActive: true,
        addressLine1: 'Address 1',
        addressLine2: 'Address 2',
        state: 'state',
        country: 'country',
        city: 'city',
        zipcode: 'zipcode',
        resetToken: 'resetToken',
        resetTokenExpires: '2024-08-17T11:23:44.467Z',
        lastLoginTime: '2024-08-17T11:23:44.467Z',
        createdBy: 1,
        contactDetails: [{ contactType: 'string', contactValue: 'string' }],
      };
      const response = await request(url)
        .post('/user')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { status } = response.body;
      expect(status).toBe(409);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        role: { id: 1 },
        firstName: 'Fname',
        lastName: 'Lname',
        password: 'password',
        imageURL: 'URL',
        isActive: true,
        addressLine1: 'Address 1',
        addressLine2: 'Address 2',
        state: 'state',
        country: 'country',
        city: 'city',
        zipcode: 'zipcode',
        resetToken: 'resetToken',
        resetTokenExpires: '2024-08-17T11:23:44.467Z',
        lastLoginTime: '2024-08-17T11:23:44.467Z',
        createdBy: 1,
        contactDetails: [{ contactType: 'string', contactValue: 'string' }],
      };
      const response = await request(url)
        .post('/user')
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
        .get(`/user/${id}`)
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
        .get('/user/0')
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
        firstName: 'Admin',
        lastName: 'Admin',
        password: 'Admin',
        imageURL: 'Admin',
        isActive: true,
        addressLine1: 'Admin',
        addressLine2: 'Admin',
        state: 'Admin',
        country: 'Admin',
        city: 'Admin',
        zipcode: 'Admin',
        resetToken: 'Admin',
        resetTokenExpires: '2024-08-12T06:10:51.104Z',
        lastLoginTime: '2024-08-12T06:10:51.104Z',
        updatedBy: 1,
        contactDetails: [
          {
            contactType: 'string',
            contactValue: 'string',
          },
        ],
      };
      const response = await request(url)
        .patch(`/user/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('User updated successfully');
    });
    it('Unsuccessful user update', async () => {
      const credentials = {
        role: { id: 1 },
        firstName: 'Update Fname',
        lastName: 'Update Lname',
        password: 'Update password',
        imageURL: 'Update imageURL',
        isActive: true,
        addressLine1: 'Update address1',
        addressLine2: 'Update address2',
        state: 'Update state',
        country: 'Update country',
        city: 'Update City',
        zipcode: 'Update zipcode',
        resetToken: 'Update resetToken',
        resetTokenExpires: '2024-08-12T06:10:51.104Z',
        lastLoginTime: '2024-08-12T06:10:51.104Z',
        updatedBy: 1,
        contactDetails: [
          {
            contactType: 'string',
            contactValue: 'string',
          },
        ],
      };
      const response = await request(url)
        .patch('/user/0')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .patch('/user/0')
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
        .patch(`/user/${id}/set-active-status`)
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
        .patch(`/user/${id}/set-active-status`)
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
        .patch(`/user/${id}/set-active-status`)
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
        .patch(`/user/${id}/set-active-status`)
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
        .patch(`/user/${id}/set-active-status`)
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
