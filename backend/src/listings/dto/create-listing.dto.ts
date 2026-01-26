import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';

export class CreateListingDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsInt()
    @Min(0)
    priceVP: number;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsNotEmpty()
    sellerId: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsOptional()
    images?: string; // JSON string

    @IsOptional()
    condition?: string;

    @IsOptional()
    listingType?: string; // OFFER | REQUEST

    @IsOptional()
    expiresAt?: Date;
}
