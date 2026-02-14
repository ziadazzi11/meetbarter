import { Controller, Post, Get, Body, UnauthorizedException, HttpCode, HttpStatus, UseGuards, Request, Res, ServiceUnavailableException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SystemStateService } from '../system-state/system-state.service';
import { MfaService } from './mfa.service';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';

class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    fullName: string;

    @IsString()
    @IsOptional()
    country?: string;
}

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private mfaService: MfaService,
        private systemState: SystemStateService,
    ) { }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Request() req: any) { }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req: any, @Res() res: any) {
        const { access_token, user } = await this.authService.login(req.user);
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}/login?token=${access_token}&uid=${user.id}`);
    }

    @Get('facebook')
    @UseGuards(FacebookAuthGuard)
    async facebookAuth(@Request() req: any) { }

    @Get('facebook/callback')
    @UseGuards(FacebookAuthGuard)
    async facebookAuthRedirect(@Request() req: any, @Res() res: any) {
        const { access_token, user } = await this.authService.login(req.user);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}/login?token=${access_token}&uid=${user.id}`);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Request() req: any) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const ip = req.ip || req.connection.remoteAddress;
        return this.authService.login(user, ip);
    }

    @Post('signup')
    async signup(@Body() registerDto: RegisterDto) {
        if (this.systemState.getKillSwitches().disableSignup) {
            throw new ServiceUnavailableException('New registrations are currently disabled.');
        }
        return this.authService.register(registerDto);
    }

    @Post('refresh')
    async refresh(@Body('userId') userId: string, @Body('refresh_token') refreshToken: string) {
        return this.authService.refresh(userId, refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('mfa/setup')
    async setupMfa(@Request() req: any) {
        const secret = this.mfaService.generateSecret();
        const qrCode = await this.mfaService.generateQrCode(req.user.email, secret);

        // Return secret for verification step (it's not yet enabled on the account)
        return { secret, qrCode };
    }

    @UseGuards(JwtAuthGuard)
    @Post('mfa/enable')
    async enableMfa(@Request() req: any, @Body('secret') secret: string, @Body('token') token: string) {
        const isValid = this.mfaService.verifyToken(token, secret);
        if (!isValid) throw new UnauthorizedException('Invalid MFA token');

        // Permanently enable and store secret (in production, encrypt this secret)
        await this.authService.updateMfa(req.user.userId, { mfaSecret: secret, mfaEnabled: true });
        return { success: true };
    }
}
