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
  describe('Peak Season and Off Season combined booking', () => {
    it('Booking nights with sufficient available nights', async () => {
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
        checkinDate: '2025-06-27T11:51:55.260Z',
        checkoutDate: '2025-07-01T11:51:55.260Z',
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
        checkinDate: '2025-06-25T11:51:55.260Z',
        checkoutDate: '2025-07-08T11:51:55.260Z',
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
        checkinDate: '2025-06-27T11:51:55.260Z',
        checkoutDate: '2025-07-01T11:51:55.260Z',
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
    it('Booking is made by an owner with two shares in the same property', async () => {
      const payload = {
        user: {
          id: 3,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2026-06-14T11:51:55.260Z',
        checkoutDate: '2026-07-12T11:51:55.260Z',
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
    it('Booking is made by an owner with three shares in the same property', async () => {
      const payload = {
        user: {
          id: 4,
        },
        property: {
          id: 1,
        },
        createdBy: {
          id: 1,
        },
        checkinDate: '2025-02-22T11:51:55.260Z',
        checkoutDate: '2025-04-05T11:51:55.260Z',
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
  });
});
