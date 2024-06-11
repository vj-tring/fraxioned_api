import { IsNotEmpty, IsObject } from 'class-validator';
export class AddRuleDto {
    @IsNotEmpty()
    @IsObject()
    conditions: any;
  
    @IsNotEmpty()
    @IsObject()
    event: any;
  }

