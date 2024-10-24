import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import {
  AuthorizationType,
  integration,
} from 'src/main/commons/constants/integration/owner-rez-api.constants';
import { getClient } from '../apis/owner-rez-endpoints';
import { CreateSubscriptionsDto } from 'src/main/dto/requests/subscriptions/create-subscriptions.dto';
import { CommonSubscriptionsResponseDto } from 'src/main/dto/responses/subscriptions/common-subscriptions.dto';
import { GenericResponseDto } from 'src/main/dto/responses/generics/generic-response.dto';
import { SUBSCRIPTIONS_RESPONSES } from 'src/main/commons/constants/response-constants/subscriptions.constant';
import { LoggerService } from 'src/main/service/logger.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly logger: LoggerService) {}
  async createSubscriptions(
    token: string,
    subscriptions: CreateSubscriptionsDto,
  ): Promise<GenericResponseDto<CommonSubscriptionsResponseDto>> {
    try {
      const client = await getClient(AuthorizationType.NONE);
      const response: AxiosResponse = await client.post(
        integration.ownerRez.endpoints.subscription.post,
        subscriptions,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const subscription: CommonSubscriptionsResponseDto = response.data;
      return SUBSCRIPTIONS_RESPONSES.SUBSCRIPTION_CREATED(subscription);
    } catch (error) {
      this.logger.error(
        `Error creating subscription: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSubscriptions(
    token: string,
  ): Promise<GenericResponseDto<CommonSubscriptionsResponseDto[]>> {
    try {
      const client = await getClient(AuthorizationType.NONE);
      const response: AxiosResponse = await client.get(
        integration.ownerRez.endpoints.subscription.all,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const subscriptions: CommonSubscriptionsResponseDto[] =
        response.data['items'];
      return SUBSCRIPTIONS_RESPONSES.SUBSCRIPTIONS_FETCHED(subscriptions);
    } catch (error) {
      this.logger.error(
        `Error fetching all subscriptions: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while fetching all the subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSubscriptionsById(
    id: number,
    token: string,
  ): Promise<GenericResponseDto<CommonSubscriptionsResponseDto>> {
    try {
      const client = await getClient(AuthorizationType.NONE);
      const response: AxiosResponse = await client.get(
        `${integration.ownerRez.endpoints.subscription.get}${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const subscription: CommonSubscriptionsResponseDto = response.data;
      return SUBSCRIPTIONS_RESPONSES.SUBSCRIPTION_FETCHED(subscription);
    } catch (error) {
      this.logger.error(
        `Error fetching subscription: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while fetching the subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSubscriptionsById(
    id: number,
    token: string,
  ): Promise<GenericResponseDto<[]>> {
    try {
      const client = await getClient(AuthorizationType.NONE);
      await client.delete(
        `${integration.ownerRez.endpoints.subscription.delete}${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return SUBSCRIPTIONS_RESPONSES.SUBSCRIPTION_DELETED();
    } catch (error) {
      this.logger.error(
        `Error deleting subscription: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSubscriptionsCategories(
    token: string,
  ): Promise<GenericResponseDto<AxiosResponse>> {
    try {
      const client = await getClient(AuthorizationType.NONE);
      const response: AxiosResponse = await client.get(
        `${integration.ownerRez.endpoints.subscription.categories}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return SUBSCRIPTIONS_RESPONSES.SUBSCRIPTIONS_CATEGORIES_FETCHED(
        response.data,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching subscriptions categories: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while fetching the subscriptions categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
