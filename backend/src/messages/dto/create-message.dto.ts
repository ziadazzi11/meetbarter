import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    senderId: string;

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    receiverId: string;

    @IsString()
    @IsOptional()
    @IsUUID()
    tradeId?: string;

    @IsString()
    @IsOptional()
    @IsUUID()
    listingId?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    templateKey?: string;
}
