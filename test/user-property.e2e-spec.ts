import * as request from 'supertest';
import { baseurl } from './test.config';

describe('E2E test for User Property', () => {
  const url = `${baseurl}/user-properties`;
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
  describe('User Property Creation', () => {
    it('Successful user property creation', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        createdBy: { id: 1 },
        noOfShare: 0,
        acquisitionDate: '2024-08-16T09:54:23.088Z',
        isActive: true,
        year: 0,
        peakAllottedNights: 0,
        peakUsedNights: 0,
        peakBookedNights: 0,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 0,
        peakAllottedHolidayNights: 0,
        peakUsedHolidayNights: 0,
        peakBookedHolidayNights: 0,
        peakRemainingHolidayNights: 0,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 0,
        offUsedNights: 0,
        offBookedNights: 0,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 0,
        offAllottedHolidayNights: 0,
        offUsedHolidayNights: 0,
        offBookedHolidayNights: 0,
        offRemainingHolidayNights: 0,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 0,
        lastMinuteUsedNights: 0,
        lastMinuteBookedNights: 0,
        lastMinuteRemainingNights: 0,
      };
      const response = await request(url)
        .post('/user-property')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body.message).toBe('User property created successfully');
      id = response.body.userProperty.id;
    });
    it('Unsuccessful user property creation', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        createdBy: { id: 1 },
        noOfShare: 0,
        acquisitionDate: '2024-08-16T09:54:23.088Z',
        isActive: true,
        year: 0,
        peakAllottedNights: 0,
        peakUsedNights: 0,
        peakBookedNights: 0,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 0,
        peakAllottedHolidayNights: 0,
        peakUsedHolidayNights: 0,
        peakBookedHolidayNights: 0,
        peakRemainingHolidayNights: 0,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 0,
        offUsedNights: 0,
        offBookedNights: 0,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 0,
        offAllottedHolidayNights: 0,
        offUsedHolidayNights: 0,
        offBookedHolidayNights: 0,
        offRemainingHolidayNights: 0,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 0,
        lastMinuteUsedNights: 0,
        lastMinuteBookedNights: 0,
        lastMinuteRemainingNights: 0,
      };
      const response = await request(url)
        .post('/user-property')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(409);
    });
    it('Invalid token or user id', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        createdBy: { id: 1 },
        noOfShare: 0,
        acquisitionDate: '2024-08-16T09:54:23.088Z',
        isActive: true,
        year: 0,
        peakAllottedNights: 0,
        peakUsedNights: 0,
        peakBookedNights: 0,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 0,
        peakAllottedHolidayNights: 0,
        peakUsedHolidayNights: 0,
        peakBookedHolidayNights: 0,
        peakRemainingHolidayNights: 0,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 0,
        offUsedNights: 0,
        offBookedNights: 0,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 0,
        offAllottedHolidayNights: 0,
        offUsedHolidayNights: 0,
        offBookedHolidayNights: 0,
        offRemainingHolidayNights: 0,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 0,
        lastMinuteUsedNights: 0,
        lastMinuteBookedNights: 0,
        lastMinuteRemainingNights: 0,
      };
      const response = await request(url)
        .post('/user-property')
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
  describe('Fetch All User Properties', () => {
    it('Successful user property fetch', async () => {
      const response = await request(url)
        .get('/')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.message).toBe(
        'User properties fetched successfully',
      );
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
  describe('Fetch Specific User Property', () => {
    it('Successful user property fetch', async () => {
      const response = await request(url)
        .get(`/user-property/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.message).toBe('User property fetched successfully');
    });
    it('Unsuccessful user property fetch', async () => {
      const response = await request(url)
        .get('/user-property/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/user-property/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific User Property', () => {
    it('Successful user property update', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: propertyid },
        updatedBy: { id: 1 },
        noOfShare: 0,
        acquisitionDate: '2024-08-16T09:54:23.088Z',
        year: 0,
        peakAllottedNights: 0,
        peakUsedNights: 0,
        peakBookedNights: 0,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 0,
        peakAllottedHolidayNights: 0,
        peakUsedHolidayNights: 0,
        peakBookedHolidayNights: 0,
        peakRemainingHolidayNights: 0,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 0,
        offUsedNights: 0,
        offBookedNights: 0,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 0,
        offAllottedHolidayNights: 0,
        offUsedHolidayNights: 0,
        offBookedHolidayNights: 0,
        offRemainingHolidayNights: 0,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 0,
        lastMinuteUsedNights: 0,
        lastMinuteBookedNights: 0,
        lastMinuteRemainingNights: 0,
      };
      const response = await request(url)
        .patch(`/user-property/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.message).toBe('User property updated successfully');
    });
    it('Unsuccessful user property update', async () => {
      const credentials = {
        user: { id: 1 },
        property: { id: id },
        updatedBy: { id: 1 },
        noOfShare: 0,
        acquisitionDate: '2024-08-16T09:54:23.088Z',
        year: 0,
        peakAllottedNights: 0,
        peakUsedNights: 0,
        peakBookedNights: 0,
        peakCancelledNights: 0,
        peakLostNights: 0,
        peakRemainingNights: 0,
        peakAllottedHolidayNights: 0,
        peakUsedHolidayNights: 0,
        peakBookedHolidayNights: 0,
        peakRemainingHolidayNights: 0,
        peakCancelledHolidayNights: 0,
        peakLostHolidayNights: 0,
        offAllottedNights: 0,
        offUsedNights: 0,
        offBookedNights: 0,
        offCancelledNights: 0,
        offLostNights: 0,
        offRemainingNights: 0,
        offAllottedHolidayNights: 0,
        offUsedHolidayNights: 0,
        offBookedHolidayNights: 0,
        offRemainingHolidayNights: 0,
        offCancelledHolidayNights: 0,
        offLostHolidayNights: 0,
        lastMinuteAllottedNights: 0,
        lastMinuteUsedNights: 0,
        lastMinuteBookedNights: 0,
        lastMinuteRemainingNights: 0,
      };
      const response = await request(url)
        .patch('/user-property/0')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/user-property/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific User Property', () => {
    it('Successful user property deletion', async () => {
      const response = await request(url)
        .delete(`/user-property/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.message).toBe('User property deleted successfully');
    });
    it('User Property id not found for delete', async () => {
      const response = await request(url)
        .delete('/user-property/0')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/);
      expect(response.body.status).toBe(404);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .delete('/user-property/0')
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
