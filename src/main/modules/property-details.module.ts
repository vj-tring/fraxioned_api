import { Module } from "@nestjs/common";
import { PropertyDetailsController } from "../controller/property-details.controller";
import { PropertyDetailsService } from "../service/property-details.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PropertyDetails } from "../entities/property_details.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PropertyDetails
          ]),
    ],
    controllers: [PropertyDetailsController],
    providers: [PropertyDetailsService],
})
export class PropertyDetailsModule {}