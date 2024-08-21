import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for Users', () => {
  const url = `${baseurl}/users`;
  let id: number;

  beforeAll(async () => {
    await setup();
  }, 100000);

  describe('User Creation', () => {
    it('Successful user creation', async () => {
      const credentials = {
        role: { id: 1 },
        firstName: 'firstName',
        lastName: 'lastName',
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
        firstName: 'update e2e',
        lastName: 'update e2e',
        password: 'update e2e',
        imageURL: 'update e2e',
        isActive: true,
        addressLine1: 'update e2e',
        addressLine2: 'update e2e',
        state: 'update e2e',
        country: 'update e2e',
        city: 'update e2e',
        zipcode: 'update e2e',
        resetToken: 'update e2e',
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
