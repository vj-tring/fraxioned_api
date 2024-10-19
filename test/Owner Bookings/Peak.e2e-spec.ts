import * as request from 'supertest';
import { baseurl } from '../test.config';
import { createConnection, Connection } from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

describe('Booking API Test', () => {
  const url = `${baseurl}/authentication`;
  const url1 = `${baseurl}/bookings`;
  let token: string;
  let userid: number;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'fraxioned_testing',
    });
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
  beforeEach(async () => {
    const scriptPath = path.resolve(__dirname, 'user properties dataset.sql');
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');
    const statements = sqlScript
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);
    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (error) {
        throw error;
      }
    }
  });
  describe('Peak Season Booking', () => {
    it('Booking nights consecutively in peak season', async () => {
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
        checkoutDate: '2025-04-15T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
    });
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
        checkinDate: '2026-04-01T11:51:55.260Z',
        checkoutDate: '2026-04-15T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
        noOfAdults: 6,
        noOfChildren: 4,
        notes: 'None',
      };
      await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`);

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
        checkinDate: '2026-04-21T11:51:55.260Z',
        checkoutDate: '2026-04-26T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
        noOfAdults: 6,
        noOfChildren: 4,
        notes: 'None',
      };
      const response1 = await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload1)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response1.body.message).toBe(
        "You don't have sufficient peak-season remaining nights to select this checkout date",
      );
    });

    it('Booking nights in peak season', async () => {
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
        checkinDate: '2025-03-15T11:51:55.260Z',
        checkoutDate: '2025-03-18T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
    });
    it('Booking is made across multiple properties for the same time period', async () => {
      const payload = {
        user: {
          id: 2,
        },
        property: {
          id: 2,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-03-15T11:51:55.260Z',
        checkoutDate: '2025-03-18T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
    });
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
        checkinDate: '2026-04-21T11:51:55.260Z',
        checkoutDate: '2026-04-27T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
        checkinDate: '2026-06-21T11:51:55.260Z',
        checkoutDate: '2026-06-26T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
    }, 10000);
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
        checkinDate: '2025-06-01T11:51:55.260Z',
        checkoutDate: '2025-06-16T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
        checkinDate: '2025-05-01T05:40:48.669Z',
        checkoutDate: '2025-05-03T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
        checkinDate: '2025-05-01T05:40:48.669Z',
        checkoutDate: '2025-05-03T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
    it('Booking is made for past days in peak season', async () => {
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
        checkinDate: '2024-06-01T05:40:48.669Z',
        checkoutDate: '2024-06-05T05:40:48.669Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
        checkinDate: '2025-04-01T05:40:48.669Z',
        checkoutDate: '2025-04-05T05:40:48.669Z',
        noOfGuests: 100,
        noOfPets: 50,
        isLastMinuteBooking: false,
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
        checkinDate: '2026-03-15T11:51:55.260Z',
        checkoutDate: '2026-03-18T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
        noOfAdults: 5,
        noOfChildren: 5,
        notes: 'None',
      };
      await request(url1)
        .post('/booking')
        .set('Accept', 'application/json')
        .send(payload)
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`);

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
        checkinDate: '2026-03-19T11:51:55.260Z',
        checkoutDate: '2026-03-25T11:51:55.260Z',
        noOfGuests: 10,
        noOfPets: 2,
        isLastMinuteBooking: false,
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
      expect(response1.body.status_code).toBe(403);
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
        isLastMinuteBooking: false,
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
