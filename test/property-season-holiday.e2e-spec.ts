import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for Property Season holiday', () => {
  const url = `${baseurl}/property-season-holidays`;
  const url2 = `${baseurl}/properties`;
  const url3 = `${baseurl}/holidays`;
  const url4 = `${baseurl}/property-details`;
  let id: number;
  let propertyid: number;
  let holidayid: number;
  let detailid: number;

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
  beforeAll(async () => {
    const credentials = {
      property: { id: propertyid },
      createdBy: { id: 1 },
      noOfGuestsAllowed: 0,
      noOfBedrooms: 0,
      noOfBathrooms: 0,
      noOfBathroomsFull: 0,
      noOfBathroomsHalf: 0,
      squareFootage: 'Meters',
      checkInTime: 0,
      checkOutTime: 0,
      cleaningFee: 0,
      noOfPetsAllowed: 0,
      petPolicy: '2',
      feePerPet: 0,
      peakSeasonStartDate: '2024-08-16',
      peakSeasonEndDate: '2024-08-16',
      peakSeasonAllottedNights: 0,
      offSeasonAllottedNights: 0,
      peakSeasonAllottedHolidayNights: 0,
      offSeasonAllottedHolidayNights: 0,
      lastMinuteBookingAllottedNights: 0,
      wifiNetwork: 'ACTEthernet',
    };
    const response = await request(url4)
      .post('/property-detail')
      .set('Accept', 'application/json')
      .send(credentials)
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`);
    detailid = response.body.id;
  });
  beforeAll(async () => {
    const credentials = {
      startDate: '2025-08-03',
      endDate: '2025-08-03',
      createdBy: { id: 1 },
      properties: [{ id: propertyid }],
      name: 'Holiday',
      year: 2002,
    };
    const response = await request(url3)
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
    holidayid = data.id;
  });

  beforeAll(async () => {
    const response = await request(url)
      .get('/property-season-holiday')
      .set('Accept', 'application/json')
      .set('user-id', `${userid}`)
      .set('access-token', `${token}`);
    const { data } = response.body;
    const lastRecord = data[data.length - 1];
    if (lastRecord) {
      await request(url)
        .delete(`/property-season-holiday/${lastRecord.id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`);
    }
  });

  afterAll(async () => {
    await request(url4)
      .delete(`/property-detail/${detailid}`)
      .set('Accept', 'application/json')
      .set('user-id', `${userid}`)
      .set('access-token', `${token}`);
  });

  afterAll(async () => {
    await request(url2)
      .delete(`/property/${propertyid}`)
      .set('Accept', 'application/json')
      .set('user-id', `${userid}`)
      .set('access-token', `${token}`);
  });

  afterAll(async () => {
    await request(url3)
      .delete(`/holiday/${holidayid}`)
      .set('Accept', 'application/json')
      .set('user-id', `${userid}`)
      .set('access-token', `${token}`);
  });

  describe('Property Season Holiday Creation', () => {
    it('Successful property season holiday creation', async () => {
      const credentials = {
        property: { id: propertyid },
        holiday: { id: holidayid },
        createdBy: { id: 1 },
        isPeakSeason: true,
      };
      const response = await request(url)
        .post('/property-season-holiday')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { message, success } = response.body;
      expect(message).toBe('Property Season Holiday created successfully');
      expect(success).toBe(true);
      id = response.body.data.id;
    });
    it('Property season holiday already exist', async () => {
      const credentials = {
        property: { id: propertyid },
        holiday: { id: holidayid },
        createdBy: { id: 1 },
        isPeakSeason: true,
      };
      const response = await request(url)
        .post('/property-season-holiday')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      const { statusCode, success } = response.body;
      expect(statusCode).toBe(409);
      expect(success).toBe(false);
    });
    it('Unsuccessful property season holiday creation', async () => {
      const credentials = {
        property: { id: 10000 },
        holiday: { id: holidayid },
        createdBy: { id: 1 },
        isPeakSeason: true,
      };
      const response = await request(url)
        .post('/property-season-holiday')
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
        holiday: { id: holidayid },
        createdBy: { id: 1 },
        isPeakSeason: true,
      };
      const response = await request(url)
        .post('/property-season-holiday')
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
  describe('Fetch All Property season holiday', () => {
    it('Successful property season holiday fetch', async () => {
      const response = await request(url)
        .get('/property-season-holiday')
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const { message, success } = response.body;
      expect(message).toBe('Property season holidays retrieved successfully');
      expect(success).toBe(true);
    });
    it('Invalid token or user id', async () => {
      const response = await request(url)
        .get('/property-season-holiday')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Fetch Specific Property season holiday', () => {
    it('Successful property season holiday fetch', async () => {
      const response = await request(url)
        .get(`/property-season-holiday/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Unsuccessful property season holiday fetch', async () => {
      const response = await request(url)
        .get('/property-season-holiday/0')
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
        .get('/property-season-holiday/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Update Specific Property season holiday', () => {
    it('Successful property season holiday update', async () => {
      const credentials = {
        property: { id: propertyid },
        holiday: { id: holidayid },
        updatedBy: { id: 1 },
        isPeakSeason: true,
      };
      const response = await request(url)
        .patch(`/property-season-holiday/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Unsuccessful property season holiday update', async () => {
      const credentials = {
        property: { id: propertyid },
        holiday: { id: holidayid },
        updatedBy: { id: 1 },
        isPeakSeason: true,
      };
      const response = await request(url)
        .patch('/property-season-holiday/0')
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
        .patch('/property-season-holiday/0')
        .set('Accept', 'application/json')
        .set('access-token', 'token')
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(401);
      const { message } = response.body;
      expect(message).toBe('The provided user ID or access token is invalid');
    });
  });
  describe('Delete Specific Property season holiday', () => {
    it('Successful property season holiday deletion', async () => {
      const response = await request(url)
        .delete(`/property-season-holiday/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('Property season holiday id not found for delete', async () => {
      const response = await request(url)
        .delete('/property-season-holiday/0')
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
        .delete('/property-season-holiday/0')
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
