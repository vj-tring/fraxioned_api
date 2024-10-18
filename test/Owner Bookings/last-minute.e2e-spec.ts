import * as request from 'supertest';
import { baseurl } from '../test.config';
import { createConnection, Connection } from 'mysql2/promise';
//NOTE : This test will drop the database after all test cases are executed.
describe('Booking API Test', () => {
  const url = `${baseurl}/authentication`;
  const url1 = `${baseurl}/bookings`;
  let token: string;
  let userid: number;
  let connection: Connection;
  let bookid: number;

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
    connection = await createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'fraxioned_test',
    });
    await connection.query(`DROP DATABASE fraxioned_test`);
    await connection.query(`CREATE DATABASE fraxioned_test`);
    await connection.end();
  });
  describe('Last Minute Booking', () => {
    it('Last Minute Booking is made within 24 hours', async () => {
      const todaydate = new Date();
      const checkin = todaydate;
      const checkout = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
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
        checkinDate: checkin,
        checkoutDate: checkout,
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
        'Booking must be made at least 24 hours before the check-in time',
      );
    });
    it('Last Minute Booking(LMB) exceeds maximum stay length', async () => {
      const todaydate = new Date();
      const checkin = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const checkout = new Date(todaydate.getTime() + 8 * 24 * 60 * 60 * 1000);
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
        checkinDate: checkin,
        checkoutDate: checkout,
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
        'Maximum 3 nights allowed for last-minute bookings',
      );
    });
    it('Last Minute Booking(LMB) is made with same checkin and checkout dates', async () => {
      const todaydate = new Date();
      const checkin = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const checkout = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
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
        checkinDate: checkin,
        checkoutDate: checkout,
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
        'Check-out date must be after the check-in date',
      );
    });
    it('Last Minute Booking(LMB) is made without following minimum stay length(1 night)', async () => {
      const todaydate = new Date();
      const checkin = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const checkout = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
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
        checkinDate: checkin,
        checkoutDate: checkout,
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
        'Check-out date must be after the check-in date',
      );
    });
    it('Last Minute Booking(LMB) is made within 3 nights', async () => {
      const todaydate = new Date();
      const checkin = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const checkout = new Date(todaydate.getTime() + 5 * 24 * 60 * 60 * 1000);
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
        checkinDate: checkin,
        checkoutDate: checkout,
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
    });
    it('Last Minute Booking(LMB) is made only for one night', async () => {
      const todaydate = new Date();
      const checkin = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const checkout = new Date(todaydate.getTime() + 3 * 24 * 60 * 60 * 1000);
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
        checkinDate: checkin,
        checkoutDate: checkout,
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
    });
    it('Trying to cancel last minute booking', async () => {
      const response = await request(url1)
        .post(`/${bookid}/${userid}/cancel`)
        .set('Accept', 'application/json')
        .set('access-token', `${token}`)
        .set('user-id', `${userid}`)
        .set('id', `${bookid}`)
        .set('user', `${userid}`)
        .expect('Content-Type', /json/);
      expect(response.body.message).toBe(
        'Last-minute bookings cannot be cancelled.',
      );
    });
    it('A booking is made again for the same date', async () => {
      const todaydate = new Date();
      const checkin = new Date(todaydate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const checkout = new Date(todaydate.getTime() + 5 * 24 * 60 * 60 * 1000);
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
        checkinDate: checkin,
        checkoutDate: checkout,
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
        'You should wait at least 5 nights from the last booking to book again.',
      );
    });
  });
});
