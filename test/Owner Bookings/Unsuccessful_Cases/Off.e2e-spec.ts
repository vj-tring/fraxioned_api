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
      './test/Datasets/Unsuccessful/Off_Booking.sql',
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
      './test/Datasets/Unsuccessful/User_Properties.sql',
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
      './test/Datasets/Unsuccessful/Truncate_Booking_Table.sql',
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
          'Booking is made during off season with insufficient available nights.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-08-29T11:51:55.260Z',
          checkoutDate: '2025-09-02T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage:
          "You don't have sufficient off-season remaining nights to select this checkout date",
        statusCode: 403,
      },
      {
        description:
          'Booking nights consecutively in off season is restricted due to unavailability of remaining nights.',
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
        expectedMessage:
          "You don't have sufficient off-season remaining nights to select this checkout date",
        statusCode: 403,
      },
      {
        description:
          'Booking is made at the end of one year and at the start of another year , but at least one year has insufficient available nights. ',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-12-20T11:51:55.260Z',
          checkoutDate: '2026-01-03T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage:
          "You don't have sufficient off-season remaining nights to select this checkout date",
        statusCode: 403,
      },
      {
        description:
          'booking is made consecutively for a minimum 3 nights at the end of one year and at the start of another year, but at least one year has insufficient available nights.',
        payload: {
          user: { id: 2 },
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
        expectedMessage:
          "You don't have sufficient off-season remaining nights to select this checkout date",
        statusCode: 403,
      },
      {
        description:
          'Multiple short bookings are made but booking is restricted due to unavailability of remaining nights',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-07-08T11:51:55.260Z',
          checkoutDate: '2025-07-11T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage:
          "You don't have sufficient off-season remaining nights to select this checkout date",
        statusCode: 403,
      },
      {
        description: 'Booking does not adhere to the maximum stay length.',
        payload: {
          user: { id: 3 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-08-01T11:51:55.260Z',
          checkoutDate: '2025-08-30T11:51:55.260Z',
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
        description: 'Booking does not adhere to the minimum stay length.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-09-01T11:51:55.260Z',
          checkoutDate: '2025-09-02T11:51:55.260Z',
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
        description: 'Booking is made in less than 3 days.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-09-01T11:51:55.260Z',
          checkoutDate: '2025-09-02T11:51:55.260Z',
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
        description: 'booking is made for past days.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2020-09-01T11:51:55.260Z',
          checkoutDate: '2020-09-08T11:51:55.260Z',
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
        description:
          'Booking is made with the same check-in and check-out date.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-09-01T11:51:55.260Z',
          checkoutDate: '2025-09-01T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 6,
          noOfChildren: 4,
          notes: 'None',
        },
        expectedMessage: 'Check-out date must be after the check-in date',
        statusCode: 400,
      },
      {
        description: 'Booking is made after 2 years from the acquisition year.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2030-09-01T11:51:55.260Z',
          checkoutDate: '2030-09-10T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 6,
          noOfChildren: 4,
          notes: 'None',
        },
        expectedMessage: 'Booking dates are out of the allowed range',
        statusCode: 400,
      },
      {
        description:
          'Booking is made that exceeds the number of guests allowed limit per property.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-09-01T11:51:55.260Z',
          checkoutDate: '2026-09-10T11:51:55.260Z',
          noOfGuests: 50,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 40,
          noOfChildren: 10,
          notes: 'None',
        },
        expectedMessage: 'Number of guests or pets exceeds property limits',
        statusCode: 400,
      },
      {
        description:
          'Booking is made that exceeds the number of pets allowed limit per property.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-09-01T11:51:55.260Z',
          checkoutDate: '2026-09-10T11:51:55.260Z',
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
        description: 'Booking is made again for the same date.',
        payload: {
          user: { id: 2 },
          property: { id: 2 },
          createdBy: { id: 1 },
          checkinDate: '2026-09-01T11:51:55.260Z',
          checkoutDate: '2026-09-10T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage:
          'You should wait at least 5 nights from the last booking to book again.',
        statusCode: 403,
      },
      {
        description:
          'Booking is made across multiple properties for the same time period, but at least one property has insufficient available nights.',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-09-01T11:51:55.260Z',
          checkoutDate: '2026-09-10T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: false,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage:
          "You don't have sufficient off-season remaining nights to select this checkout date",
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
