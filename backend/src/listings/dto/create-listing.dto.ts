import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Matches } from 'class-validator';

export class CreateListingDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^(?:(?!(?:\d[\s-]*){8,}).)*$/, { message: 'Title cannot contain phone numbers. Contact info is shared after trade approval.' })
    title!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?:(?!(?:\d[\s-]*){8,}).)*$/, { message: 'Description cannot contain phone numbers. Contact info is shared after trade approval.' })
    description!: string;

    @IsInt()
    @Min(0)
    priceVP!: number;

    @IsString()
    @IsNotEmpty()
    categoryId!: string;

    @IsString()
    @IsNotEmpty()
    sellerId!: string;

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

    @IsOptional()
    priceCash?: number;

    @IsOptional()
    @IsString()
    priceCurrency?: string;

    @IsOptional()
    @IsString()
    attributes?: string; // JSON: { acceptVP: boolean, acceptBarter: boolean }
}
