import { HttpStatus } from '@nestjs/common';
import { Booking } from 'entities/booking.entity';

export const BOOKING_RESPONSES = {
  BOOKING_CREATED: (
    booking: Booking,
  ): { message: string; data: Booking; status_code: number } => ({
    message: 'Booking created successfully',
    data: booking,
    status_code: 201,
  }),
  BOOKING_SUMMARY: (
    booking: object,
  ): { message: string; data: object; statusCode: number } => ({
    message: 'Booking summary created successfully',
    data: booking,
    statusCode: 201,
  }),
  BOOKING_NOT_FOUND: (id: number): { message: string; statusCode: number } => ({
    message: `Booking with ID ${id} not found`,
    statusCode: 404,
  }),
  BOOKINGS_NOT_FOUND: (): { message: string; status_code: number } => ({
    message: `Bookings not found`,
    status_code: 404,
  }),
  BOOKING_FOR_USER_NOT_FOUND: (
    id: number,
  ): { message: string; status_code: number } => ({
    message: `No Bookings for UserId: ${id} found`,
    status_code: 404,
  }),
  BOOKING_FETCHED: (
    booking: object,
  ): { message: string; data: object; status_code: number } => ({
    message: 'Booking fetched successfully',
    data: booking,
    status_code: 200,
  }),
  BOOKINGS_FETCHED: (
    bookings: object[],
  ): { message: string; data: object[]; status_code: number } => ({
    message: 'Bookings fetched successfully',
    data: bookings,
    status_code: 200,
  }),
  BOOKING_UPDATED: (
    booking: Booking,
  ): { message: string; data: Booking; status_code: number } => ({
    message: 'Booking updated successfully',
    data: booking,
    status_code: 200,
  }),
  BOOKING_DELETED: (id: number): { message: string; status_code: number } => ({
    message: `Booking with ID ${id} deleted successfully`,
    status_code: 200,
  }),
  CHECKIN_DATE_PAST: {
    message: 'Check-in date cannot be in the past',
    error: 'Bad Request',
    status_code: 400,
  },
  CHECKOUT_BEFORE_CHECKIN: {
    message: 'Check-out date must be after the check-in date',
    error: 'Bad Request',
    status_code: 400,
  },
  DATES_OUT_OF_RANGE: {
    message: 'Booking dates are out of the allowed range',
    error: 'Bad Request',
    status_code: 400,
  },
  NO_ACCESS_TO_PROPERTY: {
    message: 'User does not have access to this property',
    error: 'Forbidden',
    status_code: 403,
  },
  DATES_BOOKED_OR_UNAVAILABLE: {
    message: 'Selected dates include booked or unavailable dates',
    error: 'Conflict',
    status_code: 409,
  },
  LAST_MINUTE_MIN_NIGHTS: (
    minNights: number,
  ): { message: string; error: string; status_code: number } => ({
    message: `Minimum ${minNights} night(s) required for last-minute bookings`,
    error: 'Bad Request',
    status_code: 400,
  }),
  LAST_MINUTE_MAX_NIGHTS: (
    maxNights: number,
  ): { message: string; error: string; status_code: number } => ({
    message: `Maximum ${maxNights} nights allowed for last-minute bookings`,
    error: 'Bad Request',
    status_code: 400,
  }),
  REGULAR_MIN_NIGHTS: (
    minNights: number,
  ): { message: string; error: string; status_code: number } => ({
    message: `Minimum ${minNights} nights required`,
    error: 'Bad Request',
    status_code: 400,
  }),
  MAX_STAY_LENGTH_EXCEEDED: {
    message: 'Your booking request has exceeded the maximum stay length',
    error: 'Bad Request',
    status_code: 400,
  },
  INSUFFICIENT_PEAK_NIGHTS: {
    message: `You don't have sufficient peak-season remaining nights to select this checkout date`,
    error: 'Forbidden',
    status_code: 403,
  },
  INSUFFICIENT_LAST_MIN_BOOKING_NIGHTS: {
    message: `You don't have sufficient Last minute remaining nights to select this checkout date`,
    error: 'Forbidden',
    status_code: 403,
  },
  INSUFFICIENT_OFF_NIGHTS: {
    message: `You don't have sufficient off-season remaining nights to select this checkout date`,
    error: 'Forbidden',
    status_code: 403,
  },
  INSUFFICIENT_PEAK_HOLIDAY_NIGHTS: {
    message: `You don't have sufficient Peak season holiday remaining nights to select this checkout date`,
    error: 'Forbidden',
    status_code: 403,
  },
  INSUFFICIENT_OFF_HOLIDAY_NIGHTS: {
    message: `You don't have sufficient Off season holiday remaining nights to select this checkout date`,
    error: 'Forbidden',
    status_code: 403,
  },
  INSUFFICIENT_GAP_BETWEEN_BOOKINGS: {
    message: `You should wait at least 5 nights from the last booking to book again.`,
    error: 'Forbidden',
    status_code: 403,
  },
  BOOKING_TOO_CLOSE_TO_CHECKIN: {
    message: 'Booking must be made at least 24 hours before the check-in time',
    error: 'Bad Request',
    status_code: 400,
  },
  INVALID_BOOKING_YEAR: {
    message: 'Invalid booking year',
    error: 'Bad Request',
    status_code: 400,
  },
  GUESTS_LIMIT_EXCEEDS: {
    message: 'Number of guests or pets exceeds property limits',
    error: 'Bad Request',
    status_code: 400,
  },
  EXCEEDED_PEAK_HOLIDAY_NIGHTS: (
    userShares: number,
  ): { message: string; error: string; status_code: number } => ({
    message: `You have exceeded the allowed peak holiday nights. You are allowed ${userShares * 2} peak holiday nights.`,
    error: 'Forbidden',
    status_code: 403,
  }),
  BOOKING_CANCELLED: (
    cancelledBooking: Booking,
  ): { message: string; data: Booking; status_code: number } => ({
    message: 'Booking cancelled successfully',
    data: cancelledBooking,
    status_code: 200,
  }),
  BOOKING_ALREADY_CANCELLED_OR_COMPLETED: {
    message: 'Booking is already cancelled or completed',
    status_code: 400,
  },
  CANNOT_CANCEL_PAST_BOOKING: {
    message: 'Cannot cancel a past booking',
    status_code: 400,
  },
  TOO_LATE_TO_CANCEL: {
    message: 'Too late to cancel the booking',
    status_code: 400,
  },
  CANNOT_CANCEL_LAST_MINUTE_BOOKING: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Last-minute bookings cannot be cancelled.',
  },
  OWNER_REZ_BOOKING_FAILED: {
    message: 'Owner cannot book reservations.',
    error: 'Forbidden',
    status_code: HttpStatus.FORBIDDEN,
  },
  OWNER_REZ_BOOKING_ID_NOT_FOUND: {
    message: 'Booking ID was not found.',
    error: 'Not Found',
    status_code: HttpStatus.NOT_FOUND,
  },
  OWNER_REZ_BOOKING_500: {
    message: 'You have conflicts in the provided data with server.',
    error: 'Internal Server Error',
    status_code: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  OWNER_REZ_BOOKING_404: {
    message: 'Some of the provided data not found in our server.',
    error: 'Not Found',
    status_code: HttpStatus.NOT_FOUND,
  },
  OWNER_REZ_BOOKING_400: {
    message: 'Provided data was incorrect or invalid.',
    error: 'Bad Request',
    status_code: HttpStatus.BAD_REQUEST,
  },
};
