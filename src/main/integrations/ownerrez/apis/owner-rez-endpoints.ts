import { ConfigModule, ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { integration } from 'src/main/commons/constants/integration/owner-rez-api.constants';

let baseURL: string;
let username: string;
let password: string;

export const axiosConfigAsync = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<AxiosInstance> => {
    baseURL = configService.get<string>('DEV_API_URL');
    username = configService.get<string>('DEV_API_USERNAME');
    password = configService.get<string>('DEV_API_PASSWORD');

    const environment = configService.get<string>('SET_ENV');

    if (environment !== 'DEV') {
      baseURL = configService.get<string>('API_URL');
      username = configService.get<string>('API_USERNAME');
      password = configService.get<string>('API_PASSWORD');
    }

    const axiosInstance = axios.create({
      baseURL: baseURL,
      auth: {
        username: username,
        password: password,
      },
    });
    return axiosInstance;
  },
  inject: [ConfigService],
};

let dynamicClient: AxiosInstance | null = null;

const getClient = async (): Promise<AxiosInstance> => {
  if (!dynamicClient) {
    const configService = new ConfigService();
    dynamicClient = await axiosConfigAsync.useFactory(configService);
  }
  return dynamicClient;
};

// Temporary Solution for Cancel Booking Operation from OwnerRez Team
const temporaryClient = axios.create({
  baseURL: 'https://api.ownerrez.com/',
  auth: {
    username: username,
    password: password,
  },
});

export const getAllProperties = async (): Promise<AxiosResponse> => {
  const client = await getClient();
  const response: AxiosResponse = await client.get(
    integration.ownerRez.endpoints.properties.get,
  );
  return response;
};

export const createBooking = async (
  booking: object,
): Promise<AxiosResponse> => {
  const client = await getClient();
  const response: AxiosResponse = await client.post(
    integration.ownerRez.endpoints.booking.post,
    booking,
  );
  return response.data;
};

export const updateBooking = async (
  bookingId: number,
  booking: object,
): Promise<AxiosResponse> => {
  const client = await getClient();
  const response: AxiosResponse = await client.patch(
    `${integration.ownerRez.endpoints.booking.patch}${bookingId}`,
    booking,
  );
  return response.data;
};

export const cancelBooking = async (
  bookingId: number,
  booking: object,
): Promise<AxiosResponse> => {
  const response: AxiosResponse = await temporaryClient.patch(
    `${integration.ownerRez.endpoints.booking.delete}${bookingId}`,
    booking,
  );
  return response.data;
};

export const getCurrentUser = async (): Promise<AxiosResponse> => {
  const client = await getClient();
  const response: AxiosResponse = await client.get(
    integration.ownerRez.endpoints.users.get,
  );
  return response.data;
};
