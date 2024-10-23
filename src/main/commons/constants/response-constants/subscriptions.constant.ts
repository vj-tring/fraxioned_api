import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { GenericResponseDto } from 'src/main/dto/responses/generics/generic-response.dto';
import { CommonSubscriptionsResponseDto } from 'src/main/dto/responses/subscriptions/common-subscriptions.dto';

export const SUBSCRIPTIONS_RESPONSES = {
  SUBSCRIPTION_CREATED: (
    subscription: CommonSubscriptionsResponseDto,
  ): GenericResponseDto<CommonSubscriptionsResponseDto> => ({
    success: true,
    message: `Subscription type ${subscription.type} created with ID ${subscription.id}`,
    data: subscription,
    statusCode: HttpStatus.OK,
  }),
  SUBSCRIPTIONS_FETCHED: (
    subscriptions: CommonSubscriptionsResponseDto[],
  ): GenericResponseDto<CommonSubscriptionsResponseDto[]> => ({
    success: true,
    message: `All the subscriptions are fetched successfully`,
    data: subscriptions,
    statusCode: HttpStatus.OK,
  }),
  SUBSCRIPTION_FETCHED: (
    subscription: CommonSubscriptionsResponseDto,
  ): GenericResponseDto<CommonSubscriptionsResponseDto> => ({
    success: true,
    message: `Subscription type ${subscription.type} retrieved successfully`,
    data: subscription,
    statusCode: HttpStatus.OK,
  }),
  SUBSCRIPTION_DELETED: (): GenericResponseDto<null> => ({
    success: true,
    message: `Subscription deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  SUBSCRIPTIONS_CATEGORIES_FETCHED: (
    categories: AxiosResponse,
  ): GenericResponseDto<AxiosResponse> => ({
    success: true,
    message: `All the subscriptions categories are fetched successfully`,
    data: categories,
    statusCode: HttpStatus.OK,
  }),
};
