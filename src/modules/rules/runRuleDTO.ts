import { IsNotEmpty, IsObject } from "class-validator";

export class RunRulesDto {
  
    @IsNotEmpty()
    propertyName:string;
    @IsNotEmpty()
    @IsObject()
    facts: any;
  }