import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E test for Amenities', () => {
  const url = `${baseurl}/amenities`;
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
  describe('Amenity Creation', () => {
    it('Successful amenity creation', async () => {
      const credentials = {
        createdBy: { id: 3 },
        amenityName: 'AmenityName',
        amenityDescription: 'Description',
        amenityType: 'Residential',
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
    });
    it('Amenity already exist', async () => {
      const credentials = {
        createdBy: { id: 3 },
        amenityName: 'amenity',
        amenityDescription: 'Description',
        amenityType: 'Residential',
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
        createdBy: { id: 3 },
        amenityName: 'amenity',
        amenityDescription: 'Description',
        amenityType: 'Residential',
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
    it('Successful roles fetch', async () => {
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
        .get('/amenity/7')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Unsuccessful amenity fetch', async () => {
      const response = await request(url)
        .get('/amenity/1')
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
        amenityName: 'amenity1',
        amenityDescription: 'Descrip',
        amenityType: 'Residental',
      };
      const response = await request(url)
        .patch('/amenity/5')
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
        amenityName: 'amenity1',
        amenityDescription: 'Descrip',
        amenityType: 'Residental',
      };
      const response = await request(url)
        .patch('/amenity/1')
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
        .delete('/amenity/1')
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
        .delete('/amenity/8')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Amenity not found for delete', async () => {
      const response = await request(url)
        .delete('/amenity/1')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message } = response.body;
      expect(message).toBe('Amenity with ID 1 not found');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/amenity/4')
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
