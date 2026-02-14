
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService
    ) {
        super({
            clientID: process.env.FACEBOOK_APP_ID || 'App_ID_Missing',
            clientSecret: process.env.FACEBOOK_APP_SECRET || 'App_Secret_Missing',
            callbackURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/auth/facebook/callback`,
            scope: ['email'],
            profileFields: ['emails', 'name', 'photos'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
        const { name, emails, photos } = profile;
        const user = await this.authService.validateOAuthLogin({
            email: emails[0].value,
            name: `${name.givenName} ${name.familyName}`,
            provider: 'FACEBOOK',
            photoUrl: photos[0]?.value,
        });
        done(null, user);
    }
}
