import { Module } from '@nestjs/common';
import { DatabaseModule } from './main/modules/database.module';
import { PropertySpaceImageModule } from './main/modules/property-space-image.module';
import { BookingModule } from './main/modules/booking.module';
import { UserModule } from './main/modules/user.module';
import { PropertiesModule } from './main/modules/properties.module';
import { PropertyDetailsModule } from './main/modules/property-details.module';
import { UserPropertyModule } from './main/modules/user-property.module';
import { HolidaysModule } from './main/modules/holidays.module';
import { RoleModule } from './main/modules/role.module';
import { PropertySeasonHolidaysModule } from './main/modules/property-season-holidays.module';
import { UserSessionModule } from './main/modules/user-session.module';
import { AmenitiesModule } from './main/modules/amenities.module';
import { UserDocumentModule } from './main/modules/user-property-document.module';
import { PropertySpaceAmenitiesModule } from './main/modules/property-space-amenity.module';
import { PropertyCodesModule } from './main/modules/property-codes.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './main/email/mail.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MaintenanceModule } from './main/modules/maintenance.module';
import { S3UtilsModule } from './main/modules/s3-utils.module';
import { SpaceModule } from './main/modules/space.module';
import { ReportsModule } from './main/modules/reports.module';
import { AuthenticationModule } from './main/modules/authentication.module';
import { ContactUsModule } from './main/modules/contact-us.module';
import { CronJobsService } from './main/scheduler/cron-jobs.service';
import { MailSchedulerService } from './main/scheduler/mail-scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from './main/modules/logger.module';
import { PropertyCodeCategoryModule } from './main/modules/property-code-category.module';
import { AmenityGroupModule } from './main/modules/amenity-group.module';
import { FaqCategoryModule } from './main/modules/faq-category.module';
import { FaqQuestionsModule } from './main/modules/faq-questions.module';
import { SpaceBedTypeModule } from './main/modules/space-bed-type.module';
import { PropertySpaceModule } from './main/modules/property-space.module';
import { PropertySpaceBedModule } from './main/modules/property-space-bed.module';
import { SpaceBathroomTypesModule } from './main/modules/space-bathroom-types.module';
import { PropertySpaceBathroomModule } from './main/modules/property-space-bathroom.module';
import { RuleConstantModule } from './main/modules/rule-constant.module';
import { PropertyAdditionalImageModule } from './main/modules/property-additional-image.module';
import { SubscriptionsModule } from './main/integrations/ownerrez/subscriptions/subscriptions.module';

@Module({
  imports: [
    DatabaseModule,
    PropertySpaceImageModule,
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
    PropertySpaceAmenitiesModule,
    PropertyCodesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    S3UtilsModule,
    SpaceModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
      exclude: ['/api/(.*)'],
    }),
    ReportsModule,
    AuthenticationModule,
    MaintenanceModule,
    ContactUsModule,
    ScheduleModule.forRoot(),
    LoggerModule,
    PropertyCodeCategoryModule,
    AmenityGroupModule,
    FaqCategoryModule,
    FaqQuestionsModule,
    SpaceBedTypeModule,
    PropertySpaceModule,
    PropertySpaceBedModule,
    SpaceBathroomTypesModule,
    PropertySpaceBathroomModule,
    RuleConstantModule,
    PropertyAdditionalImageModule,
    SubscriptionsModule,
  ],
  providers: [CronJobsService, MailSchedulerService],
})
export class AppModule {}
