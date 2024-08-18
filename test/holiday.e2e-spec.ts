import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for Holiday', () => {
  const url = `${baseurl}/holidays`;
  let id: number;

  beforeAll(async () => {
    await setup();
  }, 100000);

  beforeAll(async () => {
    const credentials = {
      startDate: '2024-08-03',
      endDate: '2024-08-03',
      createdBy: { id: 1 },
      name: 'Holiday',
      year: 2024,
    };
    await request(url)
      .post('/holiday')
      .set('Accept', 'application/json')
      .send(credentials)
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`);
  });
  const generateYear = (): number => {
    const min = 2000;
    const max = 2100;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  describe('Holiday Creation', () => {
    it('Successful holiday creation', async () => {
      const year = generateYear();
      const startDate = `${year}-08-04`;
      const endDate = `${year}-08-04`;
      const credentials = {
        startDate,
        endDate,
        createdBy: { id: 1 },
        name: 'holiday',
        year: year,
      };
      const response = await request(url)
        .post('/holiday')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      const { message, success, data } = response.body;
      expect(message).toBe('Holiday created successfully');
      expect(success).toBe(true);
      id = data.id;
    });
    it('Holiday already exist', async () => {
      const credentials = {
        startDate: '2024-08-03',
        endDate: '2024-08-03',
        createdBy: { id: 1 },
        name: 'Holiday',
        year: 2024,
      };
      const response = await request(url)
        .post('/holiday')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        startDate: '2024-08-03',
        endDate: '2024-08-03',
        createdBy: { id: 1 },
        name: 'holiday',
        year: 2024,
      };
      const response = await request(url)
        .post('/holiday')
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
  describe('Fetch All Holidays', () => {
    it('Successful holiday fetch', async () => {
      const response = await request(url)
        .get('/holiday')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message, success } = response.body;
      expect(message).toBe('Holidays retrieved successfully');
      expect(success).toBe(true);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/holiday')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Fetch Specific Holiday', () => {
    it('Successful holiday fetch', async () => {
      const response = await request(url)
        .get(`/holiday/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message, success } = response.body;
      expect(message).toBe('Holiday retrieved successfully');
      expect(success).toBe(true);
    });
    it('Unsuccessful holiday fetch', async () => {
      const response = await request(url)
        .get('/holiday/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { success, statusCode } = response.body;
      expect(success).toBe(false);
      expect(statusCode).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/holiday/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific Holiday', () => {
    it('Successful holiday update', async () => {
      const credentials = {
        startDate: '2024-08-03',
        endDate: '2024-08-03',
        updatedBy: { id: 1 },
        name: 'holiday',
        year: 2024,
      };
      const response = await request(url)
        .patch(`/holiday/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);

      const { message, success } = response.body;
      expect(message).toBe('Holiday updated successfully');
      expect(success).toBe(true);
    });
    it('Unsuccessful holiday update', async () => {
      const credentials = {
        startDate: '2024-08-03',
        endDate: '2024-08-03',
        updatedBy: { id: 1 },
        name: 'holiday',
        year: 2024,
      };
      const response = await request(url)
        .patch('/holiday/0')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { success, statusCode } = response.body;
      expect(success).toBe(false);
      expect(statusCode).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        updatedBy: { id: 1 },
        amenityName: 'amenity1',
        amenityDescription: 'Descrip',
        amenityType: 'Residental',
      };
      const response = await request(url)
        .patch('/holiday/0')
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
  describe('Delete Specific Holiday', () => {
    it('Successful holiday deletion', async () => {
      const response = await request(url)
        .delete(`/holiday/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Holiday not found for delete', async () => {
      const response = await request(url)
        .delete('/holiday/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { success, statusCode } = response.body;
      expect(success).toBe(false);
      expect(statusCode).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/holiday/0')
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
