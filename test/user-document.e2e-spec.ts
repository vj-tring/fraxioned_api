import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for User Document', () => {
  const url = `${baseurl}/user-documents`;
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

  describe('User Document Creation', () => {
    it('Successful user-document creation', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        createdBy: { id: 1 },
        documentName: 'Doc Name',
        documentURL: 'Doc URL',
      };
      const response = await request(url)
        .post('/')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      const { message, status, document } = response.body;
      expect(message).toBe('Document created successfully');
      expect(status).toBe(201);
      id = document.id;
    });
    it('Unuccessful user-document creation', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: 10000 },
        createdBy: { id: 1 },
        documentName: 'Doc Name',
        documentURL: 'Doc URL',
      };
      const response = await request(url)
        .post('/')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { status } = response.body;
      expect(status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        createdBy: { id: 1 },
        documentName: 'Doc Name',
        documentURL: 'Doc URL',
      };
      const response = await request(url)
        .post('/')
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
  describe('Fetch All User Documents', () => {
    it('Successful user-documents fetch', async () => {
      const response = await request(url)
        .get('/')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { message, status } = response.body;
      expect(message).toBe('Documents fetched successfully');
      expect(status).toBe(200);
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
  describe('Fetch Specific User Document', () => {
    it('Successful user-document fetch', async () => {
      const response = await request(url)
        .get(`/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { message, status } = response.body;
      expect(message).toBe('Document fetched successfully');
      expect(status).toBe(200);
    });
    it('Unsuccessful user-document fetch', async () => {
      const response = await request(url)
        .get('/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific User Document', () => {
    it('Successful user-document update', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        updatedBy: { id: 1 },
        documentName: 'Document Name',
        documentURL: 'Document URL',
      };
      const response = await request(url)
        .patch(`/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);

      const { message, status } = response.body;
      expect(message).toBe('Document updated successfully');
      expect(status).toBe(200);
    });
    it('Unsuccessful user-document update', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        updatedBy: { id: 1 },
        documentName: 'Document Name',
        documentURL: 'Document URL',
      };
      const response = await request(url)
        .patch('/0')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        updatedBy: { id: 1 },
        documentName: 'string',
        documentURL: 'string',
      };
      const response = await request(url)
        .patch('/0')
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
  describe('Delete Specific User Document', () => {
    it('Successful user-document deletion', async () => {
      const response = await request(url)
        .delete(`/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      const { message, status } = response.body;
      expect(message).toBe('Document deleted successfully');
      expect(status).toBe(404);
    });
    it('User Document not found for delete', async () => {
      const response = await request(url)
        .delete('/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/0')
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
