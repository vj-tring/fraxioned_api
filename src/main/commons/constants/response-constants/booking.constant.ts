import { Booking } from 'entities/booking.entity';

export const BOOKING_RESPONSES = {
  BOOKING_CREATED: (
    booking: Booking,
  ): { message: string; data: Booking; statusCode: number } => ({
    message: 'Booking created successfully',
    data: booking,
    statusCode: 201,
  }),
  BOOKING_NOT_FOUND: (id: number): { message: string; statusCode: number } => ({
    message: `Booking with ID ${id} not found`,
    statusCode: 404,
  }),
  BOOKINGS_NOT_FOUND: (): { message: string; statusCode: number } => ({
    message: `Bookings not found`,
    statusCode: 404,
  }),
  BOOKING_FOR_USER_NOT_FOUND: (
    id: number,
  ): { message: string; statusCode: number } => ({
    message: `No Bookings for UserId: ${id} found`,
    statusCode: 404,
  }),
  BOOKING_FETCHED: (
    booking: object,
  ): { message: string; data: object; statusCode: number } => ({
    message: 'Booking fetched successfully',
    data: booking,
    statusCode: 200,
  }),
  BOOKINGS_FETCHED: (
    bookings: object[],
  ): { message: string; data: object[]; statusCode: number } => ({
    message: 'Bookings fetched successfully',
    data: bookings,
    statusCode: 200,
  }),
  BOOKING_UPDATED: (
    booking: Booking,
  ): { message: string; data: Booking; statusCode: number } => ({
    message: 'Booking updated successfully',
    data: booking,
    statusCode: 200,
  }),
  BOOKING_DELETED: (id: number): { message: string; statusCode: number } => ({
    message: `Booking with ID ${id} deleted successfully`,
    statusCode: 200,
  }),
  CHECKIN_DATE_PAST: {
    message: 'Check-in date cannot be in the past',
    error: 'Bad Request',
    statusCode: 400,
  },
  CHECKOUT_BEFORE_CHECKIN: {
    message: 'Check-out date must be after the check-in date',
    error: 'Bad Request',
    statusCode: 400,
  },
  DATES_OUT_OF_RANGE: {
    message: 'Booking dates are out of the allowed range',
    error: 'Bad Request',
    statusCode: 400,
  },
  NO_ACCESS_TO_PROPERTY: {
    message: 'User does not have access to this property',
    error: 'Forbidden',
    statusCode: 403,
  },
  DATES_BOOKED_OR_UNAVAILABLE: {
    message: 'Selected dates include booked or unavailable dates',
    error: 'Conflict',
    statusCode: 409,
  },
  LAST_MINUTE_MIN_NIGHTS: (
    minNights: number,
  ): { message: string; error: string; statusCode: number } => ({
    message: `Minimum ${minNights} night(s) required for last-minute bookings`,
    error: 'Bad Request',
    statusCode: 400,
  }),
  LAST_MINUTE_MAX_NIGHTS: (
    maxNights: number,
  ): { message: string; error: string; statusCode: number } => ({
    message: `Maximum ${maxNights} nights allowed for last-minute bookings`,
    error: 'Bad Request',
    statusCode: 400,
  }),
  REGULAR_MIN_NIGHTS: (
    minNights: number,
  ): { message: string; error: string; statusCode: number } => ({
    message: `Minimum ${minNights} nights required`,
    error: 'Bad Request',
    statusCode: 400,
  }),
  MAX_STAY_LENGTH_EXCEEDED: {
    message: 'Your booking request has exceeded the maximum stay length',
    error: 'Bad Request',
    statusCode: 400,
  },
  INSUFFICIENT_PEAK_NIGHTS: {
    message: `You don't have sufficient peak-season remaining nights to select this checkout date`,
    error: 'Forbidden',
    statusCode: 403,
  },
  INSUFFICIENT_LAST_MIN_BOOKING_NIGHTS: {
    message: `You don't have sufficient Last minute remaining nights to select this checkout date`,
    error: 'Forbidden',
    statusCode: 403,
  },
  INSUFFICIENT_OFF_NIGHTS: {
    message: `You don't have sufficient off-season remaining nights to select this checkout date`,
    error: 'Forbidden',
    statusCode: 403,
  },
  INSUFFICIENT_PEAK_HOLIDAY_NIGHTS: {
    message: `You don't have sufficient Peak season holiday remaining nights to select this checkout date`,
    error: 'Forbidden',
    statusCode: 403,
  },
  INSUFFICIENT_OFF_HOLIDAY_NIGHTS: {
    message: `You don't have sufficient Off season holiday remaining nights to select this checkout date`,
    error: 'Forbidden',
    statusCode: 403,
  },
  INSUFFICIENT_GAP_BETWEEN_BOOKINGS: {
    message: `You should wait at least 5 nights from the last booking to book again.`,
    error: 'Forbidden',
    statusCode: 403,
  },
  BOOKING_TOO_CLOSE_TO_CHECKIN: {
    message: 'Booking must be made at least 24 hours before the check-in time',
    error: 'Bad Request',
    statusCode: 400,
  },
  INVALID_BOOKING_YEAR: {
    message: 'Invalid booking year',
    error: 'Bad Request',
    statusCode: 400,
  },
  GUESTS_LIMIT_EXCEEDS: {
    message: 'Number of guests or pets exceeds property limits',
    error: 'Bad Request',
    statusCode: 400,
  },
  EXCEEDED_PEAK_HOLIDAY_NIGHTS: (
    userShares: number,
  ): { message: string; error: string; statusCode: number } => ({
    message: `You have exceeded the allowed peak holiday nights. You are allowed ${userShares * 2} peak holiday nights.`,
    error: 'Forbidden',
    statusCode: 403,
  }),
};
