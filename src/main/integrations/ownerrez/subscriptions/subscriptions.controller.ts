import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiHeadersForAuth } from 'src/main/commons/guards/auth-headers.decorator';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { AxiosResponse } from 'axios';
import { CreateSubscriptionsDto } from 'src/main/dto/requests/subscriptions/create-subscriptions.dto';
import { CommonSubscriptionsResponseDto } from 'src/main/dto/responses/subscriptions/common-subscriptions.dto';
import { GenericResponseDto } from 'src/main/dto/responses/generics/generic-response.dto';

@ApiTags('OwnerRez Subscriptions')
@Controller('v1/subscriptions')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}
  @Post()
  async createSubscriptions(
    @Headers('api-access-token') token: string,
    @Body() createSubscriptionsDto: CreateSubscriptionsDto,
  ): Promise<GenericResponseDto<CommonSubscriptionsResponseDto>> {
    try {
      return await this.subscriptionsService.createSubscriptions(
        token,
        createSubscriptionsDto,
      );
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllSubscriptions(
    @Headers('api-access-token') token: string,
  ): Promise<GenericResponseDto<CommonSubscriptionsResponseDto[]>> {
    try {
      return await this.subscriptionsService.getAllSubscriptions(token);
    } catch (error) {
      throw new HttpException(
        'An error occurred while fetching all the subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('subscription/:id')
  async getSubscriptionsById(
    @Headers('api-access-token') token: string,
    @Param('id') id: number,
  ): Promise<GenericResponseDto<CommonSubscriptionsResponseDto>> {
    try {
      return await this.subscriptionsService.getSubscriptionsById(id, token);
    } catch (error) {
      throw new HttpException(
        'An error occurred while fetching the subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('subscription/:id')
  async deleteSubscriptionsById(
    @Headers('api-access-token') token: string,
    @Param('id') id: number,
  ): Promise<GenericResponseDto<[]>> {
    try {
      return await this.subscriptionsService.deleteSubscriptionsById(id, token);
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('categories')
  async getAllSubscriptionsCategories(
    @Headers('api-access-token') token: string,
  ): Promise<GenericResponseDto<AxiosResponse>> {
    try {
      return await this.subscriptionsService.getAllSubscriptionsCategories(
        token,
      );
    } catch (error) {
      throw new HttpException(
        'An error occurred while fetching the subscriptions categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
