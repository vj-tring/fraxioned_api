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

@Module({
  imports: [
    DatabaseModule,
    HolidaysModule,
    PropertiesModule,
    PropertyDetailsModule,
    AuthenticationModule,
    RoleModule,
    PropertySeasonHolidaysModule,
    UserSessionModule,
    UserPropertyModule,
    UserModule,
    AmenitiesModule,
    UserDocumentModule,
    PropertyAmenitiesModule,
    PropertyCodesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
      exclude: ['/api/(.*)'],
    }),
    MaintenanceModule,
  ],
})
export class AppModule {}
