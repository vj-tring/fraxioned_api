import {
  Controller,
  HttpStatus,
  HttpException,
  Get,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiHeadersForAuth } from '../commons/guards/auth-headers.decorator';
import { HouseCodeCategoryService } from '../service/house-code-category.service';
import { HouseCodeCategory } from '../entities/house-code-category.entity';
import { CreateHouseCodeCategoryDto } from '../dto/requests/house-code-category/create-house-code-category.dto';

@ApiTags('House Code Category')
@Controller('v1/houseCodeCategories')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class HouseCodeCategoryController {
  constructor(
    private readonly houseCodeCategoryService: HouseCodeCategoryService,
  ) {}

  @Post()
  async createHouseCodeCategory(
    @Body() createHouseCodeCategoryDto: CreateHouseCodeCategoryDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: HouseCodeCategory;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.houseCodeCategoryService.createHouseCodeCategory(
          createHouseCodeCategoryDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the House Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllHouseCodeCategories(): Promise<{
    success: boolean;
    message: string;
    data?: HouseCodeCategory[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.houseCodeCategoryService.findAllHouseCodeCategories();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all House Code Categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('houseCodeCategory/:id')
  async getHouseCodeCategoryById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: HouseCodeCategory;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.houseCodeCategoryService.findHouseCodeCategoryById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the House Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('houseCodeCategory/:id')
  async deleteHouseCodeCategory(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result =
        await this.houseCodeCategoryService.deleteHouseCodeCategoryById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the House Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
