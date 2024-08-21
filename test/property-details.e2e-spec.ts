import * as request from 'supertest';
import { baseurl } from './test.config';
import { setup, token, userid } from './setup';

describe('E2E test for Property Details', () => {
  const url = `${baseurl}/property-details`;
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

  describe('Property Detail Creation', () => {
    it('Successful property detail creation', async () => {
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
      const response = await request(url)
        .post('/property-detail')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body).toHaveProperty('id');
      id = response.body.id;
    });
    it('Unsuccessful property detail creation', async () => {
      const credentials = {
        property: { id: 10000 },
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
      const response = await request(url)
        .post('/property-detail')
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
        wifiNetwork: 'ACT-Ethernet',
      };
      const response = await request(url)
        .post('/property-detail')
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
  describe('Fetch All Property Details', () => {
    it('Successful property details fetch', async () => {
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
  describe('Fetch Specific Property detail', () => {
    it('Successful property detail fetch', async () => {
      const response = await request(url)
        .get(`/property-detail/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveProperty('id');
    });
    it('Unsuccessful property detail fetch', async () => {
      const response = await request(url)
        .get('/property-detail/0')
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
        .get('/property-detail/0')
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
        updatedBy: { id: 1 },
        property: { id: propertyid },
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
      await request(url)
        .patch(`/property-detail/${id}`)
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    it('Unsuccessful property detail update', async () => {
      const credentials = {
        updatedBy: { id: 1 },
        property: { id: propertyid },
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
      const response = await request(url)
        .patch('/property-detail/0')
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
        .delete('/property-detail/0')
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
        .delete(`/property-detail/${id}`)
        .set('Accept', 'application/json')
        .set('user-id', `${userid}`)
        .set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    it('Property detail id not found for delete', async () => {
      const response = await request(url)
        .delete('/property-detail/0')
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
        .delete('/property-detail/0')
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
