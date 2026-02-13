import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, validateSync } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsOptional()
    NODE_ENV: string = 'production';

    @IsString()
    @IsNotEmpty()
    DATABASE_URL: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    VAULT_ENCRYPTION_KEY: string = 'm33tb@rt3r_s3cur3_v@u1t_k3y_2026!';

    @IsString()
    @IsOptional()
    JWT_SECRET: string = 'default_jwt_secret_for_railway_fallback';

    // Optional but recommended for production CORS
    @IsString()
    FRONTEND_URL: string = 'http://localhost:3000';
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true },
    );
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
