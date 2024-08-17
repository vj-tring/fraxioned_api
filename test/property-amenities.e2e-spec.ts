import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E test for Property Codes', () => {
  const url = `${baseurl}/property-amenities`;
  const url1 = `${baseurl}/authentication`;
  const url2 = `${baseurl}/properties`;
  const url3 = `${baseurl}/amenities`;
  let token: string;
  let userid: number;
  let id: number;
  let propertyid: number;
  let amenityid: number;

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
  beforeAll(async () => {
    const credentials = {
      createdBy: { id: 1 },
      propertyName: 'Property Name',
      ownerRezPropId: 0,
      address: 'Property Address',
      city: 'Property City',
      state: 'Property State',
      country: 'Property Country',
      zipcode: 0,
      houseDescription: 'Property Description',
      isExclusive: true,
      propertyShare: 0,
      latitude: 0,
      longitude: 0,
      isActive: true,
      displayOrder: 0,
    };
    const response1 = await request(url2)
      .post('/property')
      .set('Accept', 'application/json')
      .send(credentials)
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`);
    propertyid = response1.body.id;
  });
  beforeAll(async () => {
    const amenityCredentials = {
      createdBy: { id: 1 },
      amenityName: 'Amenityname',
      amenityDescription: 'Description',
      amenityType: 'Type',
    };
    const amenityResponse = await request(url3)
      .post('/amenity')
      .set('Accept', 'application/json')
      .send(amenityCredentials)
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`);
    amenityid = amenityResponse.body.data.id;
  });
  afterAll(async () => {
    await request(url2)
      .delete(`/property/${propertyid}`)
      .set('Accept', 'application/json')
      .set('user-id', `${userid}`)
      .set('access-token', `${token}`);
  });
  afterAll(async () => {
    await request(url)
      .delete(`/property-amenity/${id}`)
      .set('Accept', 'application/json')
      .set('user-id', `${userid}`)
      .set('access-token', `${token}`);
  });
  afterAll(async () => {
    await request(url3)
      .delete(`/amenity/${amenityid}`)
      .set('Accept', 'application/json')
      .set('user-id', `${userid}`)
      .set('access-token', `${token}`);
  });
  describe('Property Amenity Creation', () => {
    it('Successful property amenity creation', async () => {
      const credentials = {
        property: { id: propertyid },
        amenity: { id: amenityid },
        createdBy: { id: 1 },
      };
      const response = await request(url)
        .post('/property-amenity')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      id = response.body.data.id;
    });
    it('Property amenity already exist', async () => {
      const credentials = {
        property: { id: propertyid },
        amenity: { id: amenityid },
        createdBy: { id: 1 },
      };
      const response = await request(url)
        .post('/property-amenity')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { statusCode, success } = response.body;
      expect(statusCode).toBe(409);
      expect(success).toBe(false);
    });
    it('Unsuccessful property amenity creation', async () => {
      const credentials = {
        property: { id: 10000 },
        amenity: { id: amenityid },
        createdBy: { id: 1 },
      };
      const response = await request(url)
        .post('/property-amenity')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { statusCode, success } = response.body;
      expect(statusCode).toBe(404);
      expect(success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        property: { id: propertyid },
        amenity: { id: amenityid },
        createdBy: { id: 1 },
      };
      const response = await request(url)
        .post('/property-amenity')
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
  describe('Fetch All Property amenity', () => {
    it('Successful property amenity fetch', async () => {
      const response = await request(url)
        .get('/property-amenity')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message, success } = response.body;
      expect(message).toBe('Property amenities retrieved successfully');
      expect(success).toBe(true);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/property-amenity')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Fetch Specific Property amenity', () => {
    it('Successful property amenity fetch', async () => {
      const response = await request(url)
        .get(`/property-amenity/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Unsuccessful property amenity fetch', async () => {
      const response = await request(url)
        .get('/property-amenity/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { statusCode, success } = response.body;
      expect(statusCode).toBe(404);
      expect(success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/property-amenity/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific Property amenity', () => {
    it('Successful property amenity update', async () => {
      const credentials = {
        property: { id: propertyid },
        amenity: { id: amenityid },
        updatedBy: { id: 1 },
      };
      const response = await request(url)
        .patch(`/property-amenity/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Unsuccessful property amenity update', async () => {
      const credentials = {
        property: { id: propertyid },
        amenity: { id: amenityid },
        updatedBy: { id: 1 },
      };
      const response = await request(url)
        .patch('/property-amenity/0')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { statusCode, success } = response.body;
      expect(statusCode).toBe(404);
      expect(success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .patch('/property-amenity/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific Property amenity', () => {
    it('Successful property amenity deletion', async () => {
      const response = await request(url)
        .delete(`/property-amenity/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Property amenity id not found for delete', async () => {
      const response = await request(url)
        .delete('/property-amenity/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { statusCode, success } = response.body;
      expect(statusCode).toBe(404);
      expect(success).toBe(false);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/property-amenity/0')
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
