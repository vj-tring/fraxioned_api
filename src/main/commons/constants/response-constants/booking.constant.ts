import { Booking } from 'entities/booking.entity';

export const BOOKING_RESPONSES = {
  BOOKING_CREATED: (booking: Booking): { message: string; data: Booking } => ({
    message: 'Booking created successfully',
    data: booking,
  }),
  BOOKING_NOT_FOUND: (id: number): { message: string } => ({
    message: `Booking with ID ${id} not found`,
  }),
  BOOKING_FETCHED: (booking: Booking): { message: string; data: Booking } => ({
    message: 'Booking fetched successfully',
    data: booking,
  }),
  BOOKING_UPDATED: (booking: Booking): { message: string; data: Booking } => ({
    message: 'Booking updated successfully',
    data: booking,
  }),
  BOOKING_DELETED: (id: number): { message: string } => ({
    message: `Booking with ID ${id} deleted successfully`,
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
    error: 'Bad Request',
    statusCode: 400,
  },
  DATES_BOOKED_OR_UNAVAILABLE: {
    message: 'Selected dates include booked or unavailable dates',
    error: 'Bad Request',
    statusCode: 400,
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
    error: 'Bad Request',
    statusCode: 400,
  },
  INSUFFICIENT_OFF_NIGHTS: {
    message: `You don't have sufficient off-season remaining nights to select this checkout date`,
    error: 'Bad Request',
    statusCode: 400,
  },
};
