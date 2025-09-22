import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class BodyItemDTO {
  @IsString()
  nationalIdentificationNumber!: string;
}

export class MessageHeaderDTO {
  @IsString() sender!: string;
  @IsString() receiver!: string;
  @IsString() messageType!: string;
  @IsString() messageId!: string;
  @IsString() createdAt!: string; // YYYY-MM-DD
}

export class MessageDTO {
  @ValidateNested()
  @Type(() => MessageHeaderDTO)
  header!: MessageHeaderDTO;

  // eslint-disable-next-line prettier/prettier
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BodyItemDTO)
  body!: BodyItemDTO[];
}

export class RunRequestDTO {
  @IsOptional() @IsString() trackedEntity?: string;
  // eslint-disable-next-line prettier/prettier
  @IsOptional()
  @ValidateNested()
  @Type(() => MessageDTO)
  message?: MessageDTO;
}
