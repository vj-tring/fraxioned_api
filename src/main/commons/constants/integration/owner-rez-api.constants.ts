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
      oauth: {
        authorize: 'oauth/authorize',
        accessToken: 'oauth/access_token',
      },
      subscription: {
        get: 'v2/webhooksubscriptions/',
        post: 'v2/webhooksubscriptions',
        put: 'v2/webhooksubscriptions/',
        delete: 'v2/webhooksubscriptions/',
        all: 'v2/webhooksubscriptions',
        categories: 'v2/webhooksubscriptions/categories',
      },
    },
  },
};

export enum AuthorizationType {
  BEARER = 'Bearer',
  OAUTH = 'OAuth',
  BASIC = 'Basic',
  NONE = 'None',
}

export enum WebhookAction {
  ENTITY_CREATE = 'entity_create',
  ENTITY_UPDATE = 'entity_update',
  ENTITY_DELETE = 'entity_delete',
  ENTITY_REVOKE = 'application_authorization_revoked',
  ENTITY_TEST = 'webhook_test',
}

export enum WebhookTypeFlags {
  NONE = 'none',
  BOOKING = 'booking',
  GUEST = 'guest',
  PROPERTY = 'property',
  MESSAGE = 'message',
}
