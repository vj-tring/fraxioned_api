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
  describe('Combination of Peak season and Off season Booking', () => {
    const testCases = [
      {
        description:
          'Booking nights in this combination with sufficient available nights',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2025-06-26T11:51:55.260Z',
          checkoutDate: '2025-06-30T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: true,
          noOfAdults: 5,
          noOfChildren: 5,
          notes: 'None',
        },
        expectedMessage: 'Booking created successfully',
      },
      {
        description: 'Booking nights consecutively',
        payload: {
          user: { id: 2 },
          property: { id: 1 },
          createdBy: { id: 1 },
          checkinDate: '2026-06-24T11:51:55.260Z',
          checkoutDate: '2026-07-08T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: true,
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
          checkinDate: '2025-06-26T11:51:55.260Z',
          checkoutDate: '2025-06-30T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: true,
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
          checkinDate: '2025-02-18T11:51:55.260Z',
          checkoutDate: '2025-03-11T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: true,
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
          checkinDate: '2026-02-14T11:51:55.260Z',
          checkoutDate: '2026-03-14T11:51:55.260Z',
          noOfGuests: 10,
          noOfPets: 2,
          isLastMinuteBooking: true,
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
