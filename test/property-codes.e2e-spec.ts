import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E test for Property Codes', () => {
  const url = `${baseurl}/property-codes`;
  const url1 = `${baseurl}/authentication`;
  const url2 = `${baseurl}/properties`;
  let token: string;
  let userid: number;
  let id: number;
  let propertyid: number;

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
    const response = await request(url2)
      .post('/property')
      .set('Accept', 'application/json')
      .send(credentials)
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`);
    propertyid = response.body.id;
  });
  afterAll(async () => {
    await request(url2)
      .delete(`/property/${propertyid}`)
      .set('Accept', 'application/json')
      .set('user-id', `${userid}`)
      .set('access-token', `${token}`);
  });
  describe('Property Code Creation', () => {
    it('Successful property code creation', async () => {
      const credentials = {
        property: propertyid,
        propertyCodeType: 'string',
        propertyCode: 'string',
        createdBy: 1,
      };
      const response = await request(url)
        .post('/property-code')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body).toHaveProperty('id');
      id = response.body.id;
    });
    it('Unsuccessful property code creation', async () => {
      const credentials = {
        property: 10000,
        propertyCodeType: 'string',
        propertyCode: 'string',
        createdBy: 1,
      };
      const response = await request(url)
        .post('/property-code')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { statusCode, error } = response.body;
      expect(statusCode).toBe(404);
      expect(error).toBe('Not Found');
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        property: propertyid,
        propertyCodeType: 'string',
        propertyCode: 'string',
        createdBy: 1,
      };
      const response = await request(url)
        .post('/property-code')
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
  describe('Fetch All Property Codes', () => {
    it('Successful property codes fetch', async () => {
      await request(url)
        .get('/')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
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
  describe('Fetch Specific Property code', () => {
    it('Successful property code fetch', async () => {
      const response = await request(url)
        .get(`/property-code/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveProperty('id');
    });
    it('Unsuccessful property code fetch', async () => {
      const response = await request(url)
        .get('/property-code/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { statusCode, error } = response.body;
      expect(statusCode).toBe(404);
      expect(error).toBe('Not Found');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/property-code/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific Property detail', () => {
    it('Successful property detail update', async () => {
      const credentials = {
        property: propertyid,
        propertyCodeType: 'CodeType',
        propertyCode: 'Code',
        updatedBy: 1,
      };
      await request(url)
        .patch(`/property-code/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    it('Unsuccessful property detail update', async () => {
      const credentials = {
        property: propertyid,
        propertyCodeType: 'CodeType',
        propertyCode: 'Code',
        updatedBy: 1,
      };
      const response = await request(url)
        .patch('/property-code/0')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { statusCode, error } = response.body;
      expect(statusCode).toBe(404);
      expect(error).toBe('Not Found');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/property-code/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific Property Detail', () => {
    it('Successful property detail deletion', async () => {
      await request(url)
        .delete(`/property-code/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    it('Property detail id not found for delete', async () => {
      const response = await request(url)
        .delete('/property-code/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { statusCode, error } = response.body;
      expect(statusCode).toBe(404);
      expect(error).toBe('Not Found');
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/property-code/0')
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
