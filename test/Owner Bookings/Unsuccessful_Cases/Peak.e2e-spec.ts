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

  beforeAll(async () => {
    const sqlScript = fs.readFileSync(
      './test/Datasets/Unsuccessful/Bookings_unsuccessfull.sql',
      'utf-8',
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

  beforeEach(async () => {
    const sqlScript = fs.readFileSync(
      './test/Datasets/Unsuccessful/User_Properties_unsuccessfull.sql',
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
          isLastMinuteBooking: false,
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
          checkinDate: '2025-04-16T11:51:55.260Z',
          checkoutDate: '2025-04-30T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 6,
          noOfChildren: 4,
          notes: 'None',
        },
        expectedMessage:
          "You don't have sufficient peak-season remaining nights to select this checkout date",
        statusCode: 403,
      },
      {
        description:
          'A booking is made with the same check-in and check-out date.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-04-23T11:51:55.260Z',
          checkoutDate: '2025-04-23T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Check-out date must be after the check-in date',
        statusCode: 400,
      },
      {
        description:
          'A booking is made after 2 years from the acquisition year',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2030-06-21T11:51:55.260Z',
          checkoutDate: '2030-06-26T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking dates are out of the allowed range',
        statusCode: 400,
      },
      {
        description: 'A booking is made in less than 3 days',
        payload: {
          user: { id: 3 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-05-01T11:51:55.260Z',
          checkoutDate: '2025-05-02T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Minimum 3 nights required',
        statusCode: 400,
      },
      {
        description:
          'Multiple short bookings are made but booking is restricted due to unavailability of remaining nights',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-04-01T11:51:55.260Z',
          checkoutDate: '2025-04-08T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
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
          'A booking is made that exceeds the number of guests allowed limit per property.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-04-01T11:51:55.260Z',
          checkoutDate: '2025-04-08T11:51:55.260Z',
          noOfGuests: 100,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Number of guests or pets exceeds property limits',
        statusCode: 400,
      },
      {
        description:
          'A booking is made that exceeds the number of pets allowed limit per property.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-04-01T11:51:55.260Z',
          checkoutDate: '2025-04-08T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 20,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Number of guests or pets exceeds property limits',
        statusCode: 400,
      },
      {
        description: 'A booking does not adhere to the minimum stay length.',
        payload: {
          user: { id: 3 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-05-01T11:51:55.260Z',
          checkoutDate: '2025-05-02T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Minimum 3 nights required',
        statusCode: 400,
      },
      {
        description: 'A booking does not adhere to the maximum stay length.',
        payload: {
          user: { id: 3 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-04-03T11:51:55.260Z',
          checkoutDate: '2025-04-30T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage:
          'Your booking request has exceeded the maximum stay length',
        statusCode: 400,
      },
      {
        description: '  A booking is made for past days.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2020-04-03T11:51:55.260Z',
          checkoutDate: '2020-04-9T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Check-in date cannot be in the past',
        statusCode: 400,
      },
      {
        description: 'A booking is made again for the same date.',
        payload: {
          user: { id: 2 },
          property: { id: 2 },
          createdBy: { id: 1 },
          checkinDate: '2026-04-02T11:51:55.260Z',
          checkoutDate: '2026-04-10T11:51:55.260Z',
          noOfGuests: 4,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 2,
          noOfChildren: 2,
          notes: 'None',
        },
        expectedMessage:
          'You should wait at least 5 nights from the last booking to book again.',
        statusCode: 403,
      },
      {
        description:
          'A booking is made across multiple properties for the same time period, but at least one property has insufficient available nights. ',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-04-02T11:51:55.260Z',
          checkoutDate: '2026-04-10T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage:
          "You don't have sufficient peak-season remaining nights to select this checkout date",
        statusCode: 403,
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
