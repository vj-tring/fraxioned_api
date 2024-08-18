import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for Property Codes', () => {
  const url = `${baseurl}/property-codes`;
  const url2 = `${baseurl}/properties`;
  let id: number;
  let propertyid: number;

  beforeAll(async () => {
    await setup();
  }, 100000);

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

  describe('Property Codes Creation', () => {
    it('Successful property codes creation', async () => {
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
    it('Unsuccessful property codes creation', async () => {
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
  describe('Fetch Specific Property codes', () => {
    it('Successful property codes fetch', async () => {
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
  describe('Update Specific Property Codes', () => {
    it('Successful property codes update', async () => {
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
    it('Unsuccessful property codes update', async () => {
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
        .patch('/property-code/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific Property Codes', () => {
    it('Successful property codes deletion', async () => {
      await request(url)
        .delete(`/property-code/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    it('Property codes id not found for delete', async () => {
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
