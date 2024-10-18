import { Booking } from 'src/main/entities/booking.entity';
import { Repository } from 'typeorm';

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
