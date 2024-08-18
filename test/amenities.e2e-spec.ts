import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for Amenities', () => {
  const url = `${baseurl}/amenities`;
  let id: number;

  beforeAll(async () => {
    await setup();
  }, 100000);

  describe('Amenity Creation', () => {
    it('Successful amenity creation', async () => {
      const credentials = {
        createdBy: { id: 1 },
        amenityName: 'Amenity',
        amenityDescription: 'Description',
        amenityType: 'Facility',
      };
      const response = await request(url)
        .post('/amenity')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body.success).toBe(true);
      id = response.body.data.id;
    });
    it('Amenity already exist', async () => {
      const credentials = {
        createdBy: { id: 1 },
        amenityName: 'Amenity',
        amenityDescription: 'Description',
        amenityType: 'Facility',
      };
      const response = await request(url)
        .post('/amenity')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        createdBy: { id: 1 },
        amenityName: 'AmenityAmenity',
        amenityDescription: 'Description',
        amenityType: 'Facility',
      };
      const response = await request(url)
        .post('/amenity')
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
  describe('Fetch All Amenities', () => {
    it('Successful amenity fetch', async () => {
      const response = await request(url)
        .get('/amenity')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('Amenities retrieved successfully');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/amenity')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Fetch Specific Amenity', () => {
    it('Successful amenity fetch', async () => {
      const response = await request(url)
        .get(`/amenity/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Unsuccessful amenity fetch', async () => {
      const response = await request(url)
        .get('/amenity/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/amenity/1')
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
        updatedBy: { id: 3 },
        amenityName: 'Amenity',
        amenityDescription: 'Description',
        amenityType: 'Rental',
      };
      const response = await request(url)
        .patch(`/amenity/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Unsuccessful role update', async () => {
      const credentials = {
        updatedBy: { id: 3 },
        amenityName: 'Amenity',
        amenityDescription: 'Description',
        amenityType: 'Rental',
      };
      const response = await request(url)
        .patch('/amenity/0')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .patch('/amenity/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific Amenity', () => {
    it('Successful amenity deletion', async () => {
      const response = await request(url)
        .delete(`/amenity/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Amenity not found for delete', async () => {
      const response = await request(url)
        .delete('/amenity/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message, success } = response.body;
      expect(message).toBe('Amenity with ID 0 not found');
      expect(success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/amenity/0')
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
