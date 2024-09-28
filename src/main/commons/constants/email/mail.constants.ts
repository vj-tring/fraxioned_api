export const mailTemplates = {
  auth: {
    registration: './registration',
    forgotPassword: './reset-password',
  },
  maintenance: {
    default: './maintenance-default',
    ticket: './maintenance-ticket',
  },
  contactUs: {
    default: './contact-us-default',
    enquiry: './contact-us',
  },
  booking: {
    confirmation: './booking-confirmation',
    modification: './booking-modification',
    cancellation: './booking-cancellation',
  },
  reminder: {
    upcoming: './upcoming-reminder',
    final: './final-reminder',
    instructions: './checkout-instructions',
  },
};

export const mailSubject = {
  auth: {
    registration: 'Welcome to Fraxioned',
    forgotPassword: 'Password Reset',
  },
  maintenance: {
    default: 'Ticket Received',
    ticket: 'Maintenance Ticket',
  },
  contactUs: {
    default: 'Thank You for Reaching Out',
    enquiry: 'Owner Enquiry',
  },
  booking: {
    confirmation: 'Booking Confirmed',
    modification: 'Booking Modified',
    cancellation: 'Booking Cancelled',
  },
  reminder: {
    upcoming: 'Upcoming Booking Reminder',
    final: 'Get Ready for Your Stay',
    instructions: 'Check-out Instructions',
  },
};

export enum ReminderType {
  UPCOMING = 'upcoming',
  FINAL = 'final',
  INSTRUCTIONS = 'instructions',
}

export const reminderDays = {
  upcoming: 28,
  final: 3,
  instructions: 2,
};

export const SignWaiverRequiredProperties = [
  'Paradise Shores (eighths)',
  'Paradise Shores (tenths)',
  'Crown Jewel',
  'Modern Lagoon',
];

export const assetsHostingUrl = {
  development: 'http://192.168.1.223:3008',
  production: 'http://192.168.1.47:3008',
};
