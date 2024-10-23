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
      passowrd: 'Owner@123',
    };
    const response = await request(url)
      .post('/login')
      .set('Accept', 'application/json')
      .send(login_payload);
    const { session, user } = response.body;
    token = session.token;
    userid = user.id;
    console.log(token);
    console.log(userid);
  });

  beforeEach(async () => {
    const sqlScript = fs.readFileSync(
      './test/Datasets/userProperties_unsuccessfull.sql',
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
  describe('Peak Season Booking', () => {
    const testCases = [
      {
        description:
          'Booking nights in peak season with Insufficient available nights',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-04-01T11:51:55.260Z',
          checkoutDate: '2025-04-15T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBookings: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage:
          "You don't have sufficient peak-season remaining nights to select this checkout date",
        statusCode: 403,
      },
      {
        description:
          'Booking nights consecutively in peak season is restricted due to unavailability of remaining nights.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-04-01T11:51:55.260Z',
          checkoutDate: '2025-04-15T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 6,
          noOfChildren: 4,
          notes: 'None',
        },
        expectedMessage: 'Booking is failed',
      },
      {
        description:
          'Booking is made across multiple properties for the same time period is restricted due to unavailabity of remaining nights',
        payload: {
          user: { id: 2 },
          property: { id: 2 },
          createdBy: { id: 1 },
          checkinDate: '2025-03-15T11:51:55.260Z',
          checkoutDate: '2025-03-18T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking is failed',
      },
      {
        description:
          'Multiple short bookings are not made due to unavailability of remaining nights.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-04-21T11:51:55.260Z',
          checkoutDate: '2026-04-27T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking is failed',
      },
    ];

    testCases.forEach(
      ({ description, payload, expectedMessage, statusCode }) => {
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
              expect(response.body.status_code).toBe(statusCode);
            });
          },
          10000,
        );
      },
    );
  });
});
