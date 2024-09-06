import * as request from 'supertest';
import { baseurl } from './test.config';

describe('Booking API Test', () => {
  const url = `${baseurl}/authentication`;
  const url1 = `${baseurl}/bookings`;
  let token: string;
  let userid: number;
  beforeAll(async () => {
    const login_credentials = {
      email: 'owner@fraxioned.com',
      password: 'Owner@123',
    };
    const response = await request(url)
      .post('/login')
      .set('Accept', 'application/json')
      .send(login_credentials);
    const { session, user } = response.body;
    token = session.token;
    userid = user.id;
  });
  describe.skip('Successful Flows', () => {
    it('Booking nights in peak season', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-03-15T11:51:55.260Z',
        checkoutDate: '2025-03-20T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
    });
    it('Booking nights in off season', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-09-01T11:51:55.260Z',
        checkoutDate: '2025-09-05T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
    });
    it('Booking nights consecutively in peak season', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 2,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-04-01T11:51:55.260Z',
        checkoutDate: '2025-04-14T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
    });
    it('Booking nights consecutively in off season', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-08-01T11:51:55.260Z',
        checkoutDate: '2025-08-14T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
    });
    it('Booking includes both Peak and Off-Season nights', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-06-27T11:51:55.260Z',
        checkoutDate: '2025-07-03T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
    });
    it('Booking is made at the end of one year and the start of another year', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2024-12-29T05:40:48.669Z',
        checkoutDate: '2025-01-02T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
    });
    it('Last Minute Booking(LMB) is made within 3 nights', async () => {
      const todaydate = new Date();
      const checkin = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const checkout = new Date(todaydate.getTime() + 5 * 24 * 60 * 60 * 1000);
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 2,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: checkin,
        checkoutDate: checkout,
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
    });
  });
  describe('Unsuccessful Flows', () => {
    it('Booking is made for less than 3 days in peak season', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-06-01T05:40:48.669Z',
        checkoutDate: '2025-06-02T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Minimum 3 nights required');
    });
    it('Booking is made for less than 3 days in off season', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-11-01T05:40:48.669Z',
        checkoutDate: '2025-11-02T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Minimum 3 nights required');
    });
    it('Booking is made for past days in peak season', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2024-06-01T05:40:48.669Z',
        checkoutDate: '2024-06-05T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Check-in date cannot be in the past');
    });
    it('Booking is made for past days in off season', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2024-07-01T05:40:48.669Z',
        checkoutDate: '2024-07-05T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Check-in date cannot be in the past');
    });
    it('Booking is made with the same check-in and check-out date', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-07-01T05:40:48.669Z',
        checkoutDate: '2025-07-01T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'Check-out date must be after the check-in date',
      );
    });
    it('Booking is made that exceeds the number of guests or pets allowed limit per property', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-07-01T05:40:48.669Z',
        checkoutDate: '2025-07-05T05:40:48.669Z',
        noOfGuests: 50,
        noOfPets: 10,
        isLastMinuteBooking: true,
        noOfAdults: 30,
        noOfChildren: 20,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'Number of guests or pets exceeds property limits',
      );
    });
    it.skip('Booking is made without allowing the required 5-night gap', async () => {
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 2,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-04-15T11:51:55.260Z',
        checkoutDate: '2025-04-20T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'You should wait atleast 5 nights from last booking to book again.',
      );
    });
    it('Last Minute Booking is made within 24 hours', async () => {
      const todaydate = new Date();
      const checkin = todaydate;
      const checkout = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: checkin,
        checkoutDate: checkout,
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'Booking must be made at least 24 hours before the check-in time',
      );
    });
    it('Last Minute Booking(LMB) exceeds maximum 3 nights', async () => {
      const todaydate = new Date();
      const checkin = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const checkout = new Date(todaydate.getTime() + 8 * 24 * 60 * 60 * 1000);
      const credentials = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: checkin,
        checkoutDate: checkout,
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'string',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(credentials)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'Maximum 3 nights allowed for last-minute bookings',
      );
    });
  });
});
