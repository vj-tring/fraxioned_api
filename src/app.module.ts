import { Module } from '@nestjs/common';
import { DatabaseModule } from './main/modules/database.module';
import { HolidaysModule } from 'modules/holidays.module';
import { PropertiesModule } from './main/modules/properties.module';
import { AuthenticationModule } from './main/modules/authentication.module';
import { RoleModule } from './main/modules/role.module';
import { PropertyDetailsModule } from './main/modules/property-details.module';
import { PropertySeasonHolidaysModule } from './main/modules/property-season-holidays.module';
import { UserSessionModule } from './main/modules/user-session.module';
import { UserPropertyModule } from './main/modules/user-property.module';
import { UserModule } from './main/modules/user.module';
import { AmenitiesModule } from './main/modules/amenities.module';
import { UserDocumentModule } from './main/modules/user-document.module';
import { PropertyAmenitiesModule } from './main/modules/property-amenities.module';
import { PropertyCodesModule } from './main/modules/property-codes.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './main/email/mail.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MaintenanceModule } from './main/modules/maintenance.module';
import { PropertyImagesModule } from './main/modules/property-images.module';
import { S3UtilsModule } from './main/modules/s3-utils.module';
import { SpaceModule } from './main/modules/space.module';
import { SpaceTypesModule } from './main/modules/space-types.module';
import { BookingModule } from './main/modules/booking.module';
import { ContactUsModule } from './main/modules/contact-us.module';
import { ReportsModule } from './main/modules/reports.module';
import { PropertyCodeCategoryModule } from './main/modules/property-code-category.module';
import { AmenityGroupModule } from './main/modules/amenity-group.module';
import { FaqCategoryModule } from './main/modules/faqcategory.module';
import { FaqQuestionsModule } from './main/modules/faqquestions.module';

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    BookingModule,
    UserModule,
    PropertiesModule,
    PropertyDetailsModule,
    UserPropertyModule,
    HolidaysModule,
    RoleModule,
    PropertySeasonHolidaysModule,
    UserSessionModule,
    AmenitiesModule,
    UserDocumentModule,
    PropertyAmenitiesModule,
    PropertyCodesModule,
    PropertyImagesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    S3UtilsModule,
    SpaceModule,
    SpaceTypesModule,

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
      exclude: ['/api/(.*)'],
    }),
    ReportsModule,
    MaintenanceModule,
    ContactUsModule,
    PropertyCodeCategoryModule,
    AmenityGroupModule,
    FaqCategoryModule,
    FaqQuestionsModule,
  ],
})
export class AppModule {}
