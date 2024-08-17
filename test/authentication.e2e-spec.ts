import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E Test for Authentication', () => {
  const url = `${baseurl}/authentication`;
  let token: string;
  let userid: number;
  let resetToken: string;
  let roleid: string;

  describe('Login', () => {
    it('Successful Login', async () => {
      const valid_credentials = {
        email: 'dharshanramk@gmail.com',
        password: 'Admin@12',
      };
      const response = await request(url)
        .post('/login')
        .set('Accept', 'application/json')
        .send(valid_credentials)
        .expect('Content-Type', /json/);

      const { message, session, status, user } = response.body;
      expect(message).toBe('Login successful');
      expect(session).toHaveProperty('token');
      expect(status).toBe(200);
      token = session.token;
      userid = user.id;
      roleid = user.role.id;
    });

    it('Unsuccessful Login', async () => {
      const invalid_credentials = {
        email: 'dharshanramk@gmail.com',
        password: 'password',
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
  describe('Invite User', () => {
    const randomEmail = (): string => {
      const random = Math.random().toString(36).substring(2, 15);
      return `${random}@example.com`;
    };
    it('Send Invite Successfully', async () => {
      const invite = {
        email: randomEmail(),
        firstName: 'fname',
        lastName: 'lname',
        addressLine1: 'address1',
        addressLine2: 'address2',
        state: 'state',
        country: 'country',
        city: 'city',
        zipcode: 'code',
        phoneNumber: 'phonenumber',
        roleId: roleid,
        updatedBy: 1,
        createdBy: 1,
        userPropertyDetails: {
          propertyID: 1,
          noOfShares: 'string',
          acquisitionDate: '2024-08-08T11:36:22.849Z',
        },
      };

      const response = await request(url)
        .post('/invite')
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .send(invite)
        .expect('Content-Type', /json/);

      const { message } = response.body;
      expect(message).toBe('Invite sent successfully');
    });
    it('Invite already sended', async () => {
      const invite = {
        email: 'fraxionedownersportal@gmail.com',
        firstName: 'fname',
        lastName: 'lname',
        addressLine1: 'address1',
        addressLine2: 'address2',
        state: 'state',
        country: 'country',
        city: 'city',
        zipcode: 'code',
        phoneNumber: 'phonenumber',
        roleId: roleid,
        updatedBy: 1,
        createdBy: 1,
        userPropertyDetails: {
          propertyID: 1,
          noOfShares: 'string',
          acquisitionDate: '2024-08-08T11:36:22.849Z',
        },
      };

      const response = await request(url)
        .post('/invite')
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .send(invite)
        .expect('Content-Type', /json/)
        .expect(201);

      const { message } = response.body;
      expect(message).toBe('Email already exists');
    });
    it('Invalid token or user id', async () => {
      const invite = {
        email: 'email@email.com',
        firstName: 'fname',
        lastName: 'lname',
        addressLine1: 'address1',
        addressLine2: 'address2',
        state: 'state',
        country: 'country',
        city: 'city',
        zipcode: 'code',
        phoneNumber: 'phonenumber',
        roleId: roleid,
        updatedBy: 1,
        createdBy: 1,
        userPropertyDetails: {
          propertyID: 1,
          noOfShares: 'string',
          acquisitionDate: '2024-08-08T11:36:22.849Z',
        },
      };

      const response = await request(url)
        .post('/invite')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .send(invite)
        .expect('Content-Type', /json/)
        .expect(401);

      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
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
        .expect('Content-Type', /json/);

      const { message } = response.body;
      expect(message).toBe('Password reset email sent successfully');
    });
    it('Login again to get Reset Token', async () => {
      const valid_credentials = {
        email: 'dharshanramk@gmail.com',
        password: 'Admin@12',
      };
      const response = await request(url)
        .post('/login')
        .set('Accept', 'application/json')
        .send(valid_credentials);
      resetToken = response.body.user.resetToken;
    });
    it('User Not Found', async () => {
      const forgotinvalidmail = {
        email: 'gmail@gmail.com',
      };
      const response = await request(url)
        .post('/forgotPassword')
        .set('Accept', 'application/json')
        .send(forgotinvalidmail)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'The account associated with this user was not found',
      );
    });
  });
  describe('Recover Password', () => {
    it('Successfully Change Password', async () => {
      const recover = {
        newPassword: 'Admin@12',
      };
      const response = await request(url)
        .post('/recoverPassword')
        .set('Accept', 'application/json')
        .set('resetToken', `${resetToken}`)
        .send(recover)
        .expect('Content-Type', /json/);

      const { message } = response.body;
      expect(message).toBe('Password has been reset successfully');
    });

    it('Invalid Reset Token', async () => {
      const recover = {
        newPassword: 'Admin@12',
      };
      const response = await request(url)
        .post('/recoverPassword')
        .set('Accept', 'application/json')
        .set('resetToken', 'resetToken')
        .send(recover)
        .expect('Content-Type', /json/);

      const { message } = response.body;
      expect(message).toBe(
        'The account associated with this user was not found',
      );
    });
  });
  describe('Reset Password', () => {
    it('Reset Password Successfully', async () => {
      const reset = {
        oldPassword: 'Admin@12',
        newPassword: 'Admin@12',
        userId: 3,
      };
      const response = await request(url)
        .post('/resetPassword')
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .send(reset)
        .expect('Content-Type', /json/);

      const { message } = response.body;
      expect(message).toBe('Password reset successfully');
    });
    it('Invalid Token or User id', async () => {
      const reset1 = {
        oldPassword: 'Admin@12',
        newPassword: 'Admin@12',
        userId: 1,
      };
      const response = await request(url)
        .post('/resetPassword')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .send(reset1)
        .expect('Content-Type', /json/);

      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
    it('Wrong Old password', async () => {
      const reset2 = {
        oldPassword: 'password',
        newPassword: 'Admin@12',
        userId: 1,
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
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });
});
