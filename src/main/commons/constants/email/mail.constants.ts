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
  },
};

export const assetsHostingUrl = {
  development: 'http://192.168.1.223:3008',
  production: 'http://192.168.1.47:3008',
};
