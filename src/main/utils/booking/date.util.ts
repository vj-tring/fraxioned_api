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

export function normalizeDates(
  checkinDate: Date | string,
  checkoutDate: Date | string,
): { checkinDate: Date; checkoutDate: Date } {
  function normalizeDate(date: Date | string): Date {
    const parsedDate = new Date(date);
    return new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
    );
  }

  return {
    checkinDate: normalizeDate(checkinDate),
    checkoutDate: normalizeDate(checkoutDate),
  };
}
