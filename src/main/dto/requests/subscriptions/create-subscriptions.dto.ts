import { IsNotEmpty, IsString } from 'class-validator';
import {
  WebhookAction,
  WebhookTypeFlags,
} from 'src/main/commons/constants/integration/owner-rez-api.constants';

export class CreateSubscriptionsDto {
  @IsNotEmpty({ message: 'action is required' })
  @IsString()
  action: WebhookAction;

  @IsNotEmpty({ message: 'category is required' })
  @IsString()
  category: string;

  @IsNotEmpty({ message: 'type is required' })
  @IsString()
  type: WebhookTypeFlags;

  @IsNotEmpty({ message: 'webhookUrl is required' })
  @IsString()
  webhook_url: string;
}
