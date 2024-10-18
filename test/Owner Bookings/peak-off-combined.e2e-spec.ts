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
  let id: number;

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

  beforeAll(async () => {
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
      checkinDate: '2025-12-01T11:51:55.260Z',
      checkoutDate: '2025-12-15T11:51:55.260Z',
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
    id = response.body.data.id;
  });

  afterAll(async () => {
    await request(url1)
      .post(`/${id}/${userid}/cancel`)
      .set('Accept', 'application/json')
      .set('access-token', `${token}`)
      .set('user-id', `${userid}`)
      .set('id', `${id}`)
      .set('user', `${userid}`);
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

  describe('Peak and Off Season combined booking', () => {
    it('Booking is made which includes both Peak and Off-Season nights', async () => {
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
        checkinDate: '2025-03-12T11:51:55.260Z',
        checkoutDate: '2025-03-18T11:51:55.260Z',
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
      bookid = response.body.data.id;
    }, 10000);
    it('Cancel booked nights', async () => {
      const response = await request(url1)
        .post(`/${bookid}/${userid}/cancel`)
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .set('id', `${bookid}`)
        .set('user', `${userid}`);
      expect(response.body.message).toBe('Booking cancelled successfully');
    }, 8000);
    it('Trying to cancel already cancelled booking', async () => {
      const response = await request(url1)
        .post(`/${bookid}/${userid}/cancel`)
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .set('id', `${bookid}`)
        .set('user', `${userid}`);
      expect(response.body.message).toBe(
        'Booking is already cancelled or completed',
      );
    });
    it('Booking nights consecutively', async () => {
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
        checkinDate: '2025-06-22T11:51:55.260Z',
        checkoutDate: '2025-07-06T11:51:55.260Z',
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
      bookid1 = response.body.data.id;
    }, 10000);
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
        checkinDate: '2025-07-08T11:51:55.260Z',
        checkoutDate: '2025-07-12T11:51:55.260Z',
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
    it('Booking is made to reduce Off-Season remaining nights', async () => {
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
        checkinDate: '2025-11-01T11:51:55.260Z',
        checkoutDate: '2025-11-10T11:51:55.260Z',
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
    }, 10000);
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
        checkinDate: '2025-03-12T11:51:55.260Z',
        checkoutDate: '2025-03-18T11:51:55.260Z',
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
    it('Cancel the booking is made to reduce Off-Season remaining nights', async () => {
      const response = await request(url1)
        .post(`/${bookid2}/${userid}/cancel`)
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .set('id', `${bookid2}`)
        .set('user', `${userid}`);
      expect(response.body.message).toBe('Booking cancelled successfully');
    }, 8000);
    it('Booking is made to reduce peak season remaining nights', async () => {
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
        checkinDate: '2025-04-01T11:51:55.260Z',
        checkoutDate: '2025-04-08T11:51:55.260Z',
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
      bookid3 = response.body.data.id;
    }, 10000);
    it('Booking is made with insufficient Peak Season Remaining Nights', async () => {
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
        checkinDate: '2025-03-12T11:51:55.260Z',
        checkoutDate: '2025-03-18T11:51:55.260Z',
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
        "You don't have sufficient peak-season remaining nights to select this checkout date",
      );
    });
    it('Cancel the booking is made to reduce peak season remaining nights', async () => {
      const response = await request(url1)
        .post(`/${bookid3}/${userid}/cancel`)
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .set('id', `${bookid3}`)
        .set('user', `${userid}`);
      expect(response.body.message).toBe('Booking cancelled successfully');
    }, 8000);

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
        checkinDate: '2025-03-10T11:51:55.260Z',
        checkoutDate: '2025-03-26T11:51:55.260Z',
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
        checkinDate: '2025-03-15T05:40:48.669Z',
        checkoutDate: '2025-03-17T05:40:48.669Z',
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
        checkinDate: '2025-03-15T05:40:48.669Z',
        checkoutDate: '2025-03-17T05:40:48.669Z',
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
