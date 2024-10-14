import { HttpStatus } from '@nestjs/common';
import { FaqQuestions } from 'src/main/entities/faq-questions.entity';

export const FAQ_QUESTIONS_RESPONSES = {
  QUESTION_ALREADY_EXISTS: (
    question: string,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Question "${question}" already exists.`,
    statusCode: HttpStatus.CONFLICT,
  }),

  QUESTION_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Question with ID "${id}" not found.`,
    statusCode: HttpStatus.NOT_FOUND,
  }),

  QUESTIONS_NOT_FOUND: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: 'No questions found.',
    statusCode: HttpStatus.NOT_FOUND,
  }),

  QUESTION_FETCHED: (
    question: FaqQuestions,
  ): {
    success: boolean;
    message: string;
    data: FaqQuestions;
    statusCode: number;
  } => ({
    success: true,
    message: 'Question fetched successfully.',
    data: question,
    statusCode: HttpStatus.OK,
  }),

  QUESTIONS_FETCHED: (
    questions: FaqQuestions[],
  ): {
    success: boolean;
    message: string;
    data: FaqQuestions[];
    statusCode: number;
  } => ({
    success: true,
    message: 'Questions fetched successfully.',
    data: questions,
    statusCode: HttpStatus.OK,
  }),

  QUESTION_CREATED: (
    savedQuestion: FaqQuestions,
    question: string,
  ): {
    success: boolean;
    message: string;
    data: FaqQuestions;
    statusCode: number;
  } => ({
    success: true,
    message: `Question "${question}" created successfully.`,
    data: savedQuestion,
    statusCode: HttpStatus.CREATED,
  }),

  QUESTION_UPDATED: (
    updatedQuestion: FaqQuestions,
  ): {
    success: boolean;
    message: string;
    data: FaqQuestions;
    statusCode: number;
  } => ({
    success: true,
    message: 'Question updated successfully.',
    data: updatedQuestion,
    statusCode: HttpStatus.OK,
  }),

  QUESTION_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Question with ID "${id}" deleted successfully.`,
    statusCode: HttpStatus.OK,
  }),
};
