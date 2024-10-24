import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import {
  WebhookAction,
  WebhookTypeFlags,
} from 'src/main/commons/constants/integration/owner-rez-api.constants';

export class CommonSubscriptionsResponseDto {
  @IsNotEmpty({ message: 'action is required' })
  @IsEnum(WebhookAction)
  action: WebhookAction;

  @IsNotEmpty({ message: 'api_application_connection_id is required' })
  @IsInt()
  api_application_connection_id: number;

  @IsNotEmpty({ message: 'category is required' })
  @IsString()
  category: string;

  @IsNotEmpty({ message: 'id is required' })
  @IsInt()
  id: number;

  @IsNotEmpty({ message: 'type is required' })
  @IsEnum(WebhookTypeFlags)
  type: WebhookTypeFlags;

  @IsNotEmpty({ message: 'webhookUrl is required' })
  @IsString()
  webhook_url: string;
}
