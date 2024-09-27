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
import { PropertyCodeCategoryService } from '../service/property-code-category.service';
import { PropertyCodeCategory } from '../entities/property-code-category.entity';
import { CreatePropertyCodeCategoryDto } from '../dto/requests/property-code-category/create-property-code-category.dto';

@ApiTags('Property Code Category')
@Controller('v1/property-code-categories')
@UseGuards(AuthGuard)
@ApiHeadersForAuth()
export class PropertyCodeCategoryController {
  constructor(
    private readonly propertyCodeCategoryService: PropertyCodeCategoryService,
  ) {}

  @Post()
  async createPropertyCodeCategory(
    @Body() createPropertyCodeCategoryDto: CreatePropertyCodeCategoryDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodeCategory;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyCodeCategoryService.createPropertyCodeCategory(
          createPropertyCodeCategoryDto,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while creating the Property Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllPropertyCodeCategories(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodeCategory[];
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyCodeCategoryService.findAllPropertyCodeCategories();
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving all Property Code Categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('property-code-category/:id')
  async getPropertyCodeCategoryById(@Param('id') id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyCodeCategory;
    statusCode: HttpStatus;
  }> {
    try {
      const result =
        await this.propertyCodeCategoryService.findPropertyCodeCategoryById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the Property Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('property-code-category/:id')
  async deletePropertyCodeCategory(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string; statusCode: HttpStatus }> {
    try {
      const result =
        await this.propertyCodeCategoryService.deletePropertyCodeCategoryById(
          id,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        'An error occurred while deleting the Property Code Category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
