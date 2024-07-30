import { InjectRepository } from "@nestjs/typeorm";
import { PropertyDetails } from "../entities/property_details.entity";
import { Repository } from "typeorm/repository/Repository";
import { PropertyDetailsDto } from "../dto/propertyDetails.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PropertyDetailsService {
    constructor(
        @InjectRepository(PropertyDetails)
        private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    ) {}

    async savePropertyDetails(propertyDetails: PropertyDetailsDto): Promise<object> {
        return await this.propertyDetailsRepository.save(propertyDetails);
    }
}