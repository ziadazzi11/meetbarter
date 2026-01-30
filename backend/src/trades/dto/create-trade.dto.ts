import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTradeDto {
    @IsString()
    @IsNotEmpty()
    listingId: string;

    @IsString()
    @IsNotEmpty()
    buyerId: string;

    @IsNumber()
    @IsOptional()
    cashOffer?: number;

    @IsString()
    @IsOptional()
    cashCurrency?: string;
}
