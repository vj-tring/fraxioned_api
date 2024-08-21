import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for Properties', () => {
  const url = `${baseurl}/properties`;
  let id: number;

  beforeAll(async () => {
    await setup();
  }, 100000);

  describe('Property Creation', () => {
    it('Successful property creation', async () => {
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
      const response = await request(url)
        .post('/property')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body).toHaveProperty('id');
      id = response.body.id;
    });
    it('Invalid token or user id', async () => {
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
      const response = await request(url)
        .post('/property')
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
  describe('Fetch All Properties', () => {
    it('Successful property fetch', async () => {
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
  describe('Fetch Specific Property', () => {
    it('Successful property fetch', async () => {
      const response = await request(url)
        .get(`/property/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveProperty('propertyName');
    });
    it('Unsuccessful property fetch', async () => {
      const response = await request(url)
        .get('/property/0')
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
        .get('/property/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific Property', () => {
    it('Successful property update', async () => {
      const credentials = {
        updatedBy: { id: 1 },
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
      const response = await request(url)
        .patch(`/property/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveProperty('propertyName');
    });
    it('Unsuccessful property update', async () => {
      const credentials = {
        updatedBy: { id: 1 },
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
      const response = await request(url)
        .patch('/property/0')
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
        .delete('/property/3')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific Property', () => {
    it('Successful property deletion', async () => {
      await request(url)
        .delete(`/property/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    it('Property id not found for delete', async () => {
      const response = await request(url)
        .delete('/property/0')
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
        .delete('/property/4')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Compare Properties', () => {
    it('Successful', async () => {
      await request(url)
        .post('/compare-properties')
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
    }, 100000);
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .post('/compare-properties')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Get Specific Property Details', () => {
    it('Successful Fetch', async () => {
      await request(url)
        .get(`/property/${id}/details`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    }, 100000);
    it('Unsuccessful Fetch', async () => {
      const response = await request(url)
        .get('/property/0/details')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/property/0/details')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Get Properties with details', () => {
    it('Successful property fetch', async () => {
      await request(url)
        .get('/properties-with-details')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/properties-with-details')
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
