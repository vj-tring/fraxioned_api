import * as request from 'supertest';
import { baseurl } from '../test.config';

describe('Booking API Test', () => {
  const url = `${baseurl}/authentication`;
  const url1 = `${baseurl}/bookings`;
  let token: string;
  let userid: number;
  let bookid: number;
  let bookid1: number;
  let bookid2: number;
  let bookid3: number;

  beforeAll(async () => {
    const login_payload = {
      email: 'owner@fraxioned.com',
      password: 'Owner@123',
    };
    const response = await request(url)
      .post('/login')
      .set('Accept', 'application/json')
      .send(login_payload);
    const { session, user } = response.body;
    token = session.token;
    userid = user.id;
  });
  afterAll(async () => {
    await request(url1)
      .post(`/${bookid1}/${userid}/cancel`)
      .set('Accept', 'application/json')
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`)
      .set('id', `${bookid1}`)
      .set('user', `${userid}`);
  });
  afterAll(async () => {
    await request(url1)
      .post(`/${bookid2}/${userid}/cancel`)
      .set('Accept', 'application/json')
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`)
      .set('id', `${bookid2}`)
      .set('user', `${userid}`);
  });
  afterAll(async () => {
    await request(url1)
      .post(`/${bookid}/${userid}/cancel`)
      .set('Accept', 'application/json')
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`)
      .set('id', `${bookid}`)
      .set('user', `${userid}`);
  });
  describe('Successful Flows', () => {
    it('Booking nights consecutively in off season', async () => {
      const payload = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-07-01T11:51:55.260Z',
        checkoutDate: '2025-07-15T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 6,
        noOfChildren: 4,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
      bookid = response.body.data.id;
    }, 10000);
    it('Booking nights in off season', async () => {
      const payload = {
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
        checkoutDate: '2025-08-08T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
      bookid1 = response.body.data.id;
    }, 10000);
    it('Multiple short bookings are made with respect to remaining nights', async () => {
      const payload = {
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
        checkoutDate: '2025-09-04T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Booking created successfully');
      bookid2 = response.body.data.id;

      const payload1 = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-09-11T11:51:55.260Z',
        checkoutDate: '2025-09-14T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'None',
      };
      const response1 = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload1)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response1.body.message).toBe('Booking created successfully');
      bookid3 = response1.body.data.id;
    }, 10000);
    it('Cancel booked nights consecutively in off season', async () => {
      const response = await request(url1)
        .post(`/${bookid3}/${userid}/cancel`)
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .set('id', `${bookid3}`)
        .set('user', `${userid}`);
      expect(response.body.message).toBe('Booking cancelled successfully');
    }, 8000);
    it('Trying to cancel already cancelled booking', async () => {
      const response = await request(url1)
        .post(`/${bookid3}/${userid}/cancel`)
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .set('id', `${bookid3}`)
        .set('user', `${userid}`);
      expect(response.body.message).toBe(
        'Booking is already cancelled or completed',
      );
    });
  });
  describe('Unsuccessful Flows', () => {
    it('Booking does not adhere to the maximum stay length', async () => {
      const payload2 = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-10-01T11:51:55.260Z',
        checkoutDate: '2025-10-16T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 6,
        noOfChildren: 4,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload2)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'Your booking request has exceeded the maximum stay length',
      );
    });
    it('Booking is made with insufficient off Season Remaining Nights', async () => {
      const payload = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-11-20T11:51:55.260Z',
        checkoutDate: '2025-12-04T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 6,
        noOfChildren: 4,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        "You don't have sufficient off-season remaining nights to select this checkout date",
      );
    });
    it('Booking is made for less than 3 days', async () => {
      const payload = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-12-10T05:40:48.669Z',
        checkoutDate: '2025-12-12T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Minimum 3 nights required');
    });
    it('Booking does not adhere to the minimum stay length', async () => {
      const payload = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-12-17T05:40:48.669Z',
        checkoutDate: '2025-12-19T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Minimum 3 nights required');
    });
    it('Booking is made for past days in off season', async () => {
      const payload = {
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
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe('Check-in date cannot be in the past');
    });
    it('Booking is made that exceeds the number of guests or pets allowed limit per property', async () => {
      const payload = {
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
        noOfGuests: 100,
        noOfPets: 50,
        isLastMinuteBooking: true,
        noOfAdults: 30,
        noOfChildren: 20,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'Number of guests or pets exceeds property limits',
      );
    });
    it('Booking is made without allowing the required 5-night gap', async () => {
      const payload = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-09-05T11:51:55.260Z',
        checkoutDate: '2025-09-10T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.statusCode).toBe(403);
    });
    it('Booking is made beyond the 730-day rolling calendar limit', async () => {
      const payload = {
        user: {
          id: 2,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2030-04-15T11:51:55.260Z',
        checkoutDate: '2030-04-20T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: true,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'None',
      };
      const response = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'Booking dates are out of the allowed range',
      );
    });
  });
});
