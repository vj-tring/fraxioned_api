import * as request from 'supertest';
import { baseurl, getConnection } from '../../test.config';
import { Connection } from 'mysql2/promise';
import * as fs from 'fs';

describe('Booking API Test', () => {
  const url = `${baseurl}/authentication`;
  const url1 = `${baseurl}/bookings`;
  let token: string;
  let userid: number;
  let connection: Connection;

  beforeAll(async () => {
    connection = await getConnection();
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
    const sqlScript = fs.readFileSync(
      './test/Datasets/User_Properties.sql',
      'utf8',
    );
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
  afterAll(async () => {
    const sqlScript = fs.readFileSync(
      './test/Datasets/Truncate_Booking_Table.sql',
      'utf8',
    );
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
    await connection.end();
  });
  describe('Off Season Booking', () => {
    const testCases = [
      {
        description:
          'Booking nights in off season with sufficient available nights',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-06-29T11:51:55.260Z',
          checkoutDate: '2025-07-02T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description: 'Booking nights consecutively in off season',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-07-08T11:51:55.260Z',
          checkoutDate: '2025-07-22T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 6,
          noOfChildren: 4,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Booking is made across multiple properties for the same time period',
        payload: {
          user: { id: 2 },
          property: { id: 2 },
          createdBy: { id: 1 },
          checkinDate: '2025-06-29T11:51:55.260Z',
          checkoutDate: '2025-07-02T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Multiple short bookings are made with respect to remaining nights',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-06-29T11:51:55.260Z',
          checkoutDate: '2026-07-02T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Multiple short bookings are made with respect to remaining nights',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-07-08T11:51:55.260Z',
          checkoutDate: '2026-07-12T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Booking is made by an owner with two shares in the same property',
        payload: {
          user: { id: 3 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-08-01T11:51:55.260Z',
          checkoutDate: '2025-08-22T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Booking is made by an owner with three shares in the same property',
        payload: {
          user: { id: 4 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-09-01T11:51:55.260Z',
          checkoutDate: '2026-09-29T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Booking is made consecutively for a minimum 3 nights at the end of one year and at the start of another year',
        payload: {
          user: { id: 4 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-12-30T11:51:55.260Z',
          checkoutDate: '2026-01-02T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Booking is made consecutively for 14 nights at the end of one year and at the start of another year',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2024-12-23T11:51:55.260Z',
          checkoutDate: '2025-01-06T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 6,
          noOfChildren: 4,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Booking is made consecutively at the end of one year and at the start of another year with respect to 2 shares.',
        payload: {
          user: { id: 3 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-12-21T11:51:55.260Z',
          checkoutDate: '2027-01-11T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description:
          'Booking is made consecutively at the end of one year and at the start of another year with respect to 3 shares',
        payload: {
          user: { id: 4 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2027-12-18T11:51:55.260Z',
          checkoutDate: '2028-01-15T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
    ];

    testCases.forEach(({ description, payload, expectedMessage }) => {
      it(
        description,
        async () => {
          const responses = Array.isArray(payload)
            ? await Promise.all(
                payload.map((p) =>
                  request(url1)
                    .post('/booking')
                    .set('Accept', 'application/json')
                    .send(p)
                    .set('access-token', `${token}`)
                    .set('user-id', `${userid}`)
                    .expect('Content-Type', /json/),
                ),
              )
            : [
                await request(url1)
                  .post('/booking')
                  .set('Accept', 'application/json')
                  .send(payload)
                  .set('access-token', `${token}`)
                  .set('user-id', `${userid}`)
                  .expect('Content-Type', /json/),
              ];

          responses.forEach((response) => {
            expect(response.body.message).toBe(expectedMessage);
          });
        },
        10000,
      );
    });
  });
});
