import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTradeDto {
    @IsString()
    @IsNotEmpty()
    listingId: string;

    @IsString()
    @IsNotEmpty()
    buyerId: string;
}
