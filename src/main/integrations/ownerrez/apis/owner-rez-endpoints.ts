import axios, { AxiosResponse } from 'axios';

const username = 'jaiganesh.j@tringapps.com';
const password = 'pt_oxy7rb429ic9bpvuva47vuuoqb5kjndp';

const client = axios.create({
  // PROD - https://api.ownerrez.com/
  baseURL: 'https://apistage.ownerrez.com/',
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
