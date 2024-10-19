export const integration = {
  ownerRez: {
    endpoints: {
      booking: {
        get: '',
        post: 'v2/bookings',
        put: '',
        patch: 'v2/bookings/',
        delete: 'api/bookings/',
      },
      properties: {
        get: 'v2/properties',
        post: '',
        put: '',
        delete: '',
      },
      users: {
        get: 'v2/users/me',
        post: '',
        put: '',
        delete: '',
      },
    },
  },
};
