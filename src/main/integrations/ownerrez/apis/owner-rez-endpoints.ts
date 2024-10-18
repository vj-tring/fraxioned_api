import { ConfigModule, ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export const axiosConfigAsync = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<AxiosInstance> => {
    const axiosInstance = axios.create({
      baseURL: configService.get<string>('API_URL'),
      auth: {
        username: configService.get<string>('API_USERNAME'),
        password: configService.get<string>('API_PASSWORD'),
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

export const getAllProperties = async (): Promise<AxiosResponse> => {
  const client = await getClient();
  const response: AxiosResponse = await client.get('v2/properties');
  return response;
};

export const createBooking = async (
  booking: object,
): Promise<AxiosResponse> => {
  const client = await getClient();
  const response: AxiosResponse = await client.post('v2/bookings', booking);
  return response.data;
};

export const updateBooking = async (
  bookingId: number,
  booking: object,
): Promise<AxiosResponse> => {
  const client = await getClient();
  const response: AxiosResponse = await client.patch(
    `v2/bookings/${bookingId}`,
    booking,
  );
  return response.data;
};
