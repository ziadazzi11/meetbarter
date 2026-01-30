import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MinLength, validateSync } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsString()
    @IsNotEmpty()
    DATABASE_URL: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(32, { message: 'VAULT_ENCRYPTION_KEY must be at least 32 characters long for AES-256 security.' })
    VAULT_ENCRYPTION_KEY: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    JWT_SECRET: string;

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
