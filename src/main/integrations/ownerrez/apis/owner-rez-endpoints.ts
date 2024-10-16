import axios, { AxiosResponse } from 'axios';

const username = 'invoice@fraxioned.com';
const password = 'pt_5pj8kpdq03cnd2p95z0ctrd0hvrjdlbc';

const client = axios.create({
  baseURL: 'https://api.ownerrez.com/',
  auth: {
    username,
    password,
  },
});

export const getAllProperties = async (): Promise<AxiosResponse> => {
  const response: AxiosResponse = await client.get('v2/properties');
  return response;
};

export const createBooking = async (
  booking: object,
): Promise<AxiosResponse> => {
  const response: AxiosResponse = await client.post('v2/bookings', booking);
  return response.data;
};
