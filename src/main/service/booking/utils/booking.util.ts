import { Repository } from 'typeorm';
import { Booking } from 'src/main/entities/booking.entity';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';

export function normalizeDate(date: Date | string): Date {
  const parsedDate = new Date(date);
  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
  );
}

export function extractMonthDay(date: Date): { month: number; day: number } {
  return { month: date.getMonth(), day: date.getDate() };
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const { month: dateMonth, day: dateDay } = extractMonthDay(date);
  const { month: startMonth, day: startDay } = extractMonthDay(start);
  const { month: endMonth, day: endDay } = extractMonthDay(end);

  if (
    startMonth < endMonth ||
    (startMonth === endMonth && startDay <= endDay)
  ) {
    return (
      (dateMonth > startMonth ||
        (dateMonth === startMonth && dateDay >= startDay)) &&
      (dateMonth < endMonth || (dateMonth === endMonth && dateDay <= endDay))
    );
  } else {
    return (
      dateMonth > startMonth ||
      (dateMonth === startMonth && dateDay >= startDay) ||
      dateMonth < endMonth ||
      (dateMonth === endMonth && dateDay <= endDay)
    );
  }
}

export async function generateBookingId(
  bookingRepository: Repository<Booking>,
  propertyId: number,
): Promise<string> {
  const baseStartNumber = 1;

  const propertyIdLength = Math.max(2, propertyId.toString().length);

  const lastBooking = await bookingRepository.findOne({
    where: {},
    order: { createdAt: 'DESC' },
    select: ['bookingId'],
  });

  const lastId = lastBooking
    ? parseInt(lastBooking.bookingId.slice(6 + propertyIdLength), 10)
    : baseStartNumber - 1;

  const newId = lastId + 1;
  const incrementingNumberLength = Math.max(2, newId.toString().length);

  const currentYear = new Date().getFullYear().toString();

  const paddedPropertyId = propertyId
    .toString()
    .padStart(propertyIdLength, '0');
  const paddedNewId = newId.toString().padStart(incrementingNumberLength, '0');

  return `FX${currentYear}${paddedPropertyId}${paddedNewId}`;
}

export async function updatePeakHoliday(
  holidayYear: number,
  peakHolidayNights: number,
  userPropertiesRepository: Repository<UserProperties>,
  acquisitionDate: Date,
  user: User,
  property: Property,
): Promise<void> {
  const today = new Date();
  const acquisitionYear = acquisitionDate.getFullYear();
  const currentYearForValidation = today.getFullYear();
  const diffOfAcquisitionAndCheckInYear = holidayYear - acquisitionYear + 1;
  const isEven = diffOfAcquisitionAndCheckInYear % 2 === 0;

  let targetYear: number, userPropertyToUpdate: UserProperties;

  if (
    !isEven &&
    (currentYearForValidation === holidayYear ||
      currentYearForValidation + 1 === holidayYear)
  ) {
    targetYear = holidayYear + 1;
  } else if (
    isEven &&
    (currentYearForValidation + 1 === holidayYear ||
      currentYearForValidation + 2 === holidayYear)
  ) {
    targetYear = holidayYear - 1;
  }

  if (targetYear) {
    userPropertyToUpdate = await userPropertiesRepository.findOne({
      where: { user: user, property: property, year: targetYear },
    });

    if (userPropertyToUpdate) {
      userPropertyToUpdate.peakRemainingHolidayNights -= peakHolidayNights;
      userPropertyToUpdate.peakBookedHolidayNights += peakHolidayNights;
      await userPropertiesRepository.save(userPropertyToUpdate);
    }
  }
}
