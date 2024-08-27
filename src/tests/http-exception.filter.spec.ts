import { GlobalExceptionFilter } from 'src/main/commons/exceptions/filters/http-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test-url',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should return internal server error for unknown exceptions', () => {
    const exception = new Error('Unknown error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
  });

  it('should return the correct response for HttpException', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Forbidden',
      error: 'Error',
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
  });

  it('should return the correct response for HttpException with custom response', () => {
    const exceptionResponse = {
      message: 'Custom error message',
      error: 'Custom Error',
    };
    const exception = new HttpException(
      exceptionResponse,
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Custom error message',
      error: 'Custom Error',
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
  });

  it('should return the correct response for HttpException with partial custom response', () => {
    const exceptionResponse = {
      message: 'Partial custom error message',
    };
    const exception = new HttpException(
      exceptionResponse,
      HttpStatus.UNAUTHORIZED,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Partial custom error message',
      error: 'Error',
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
  });
});
