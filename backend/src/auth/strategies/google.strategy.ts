
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || 'Client_ID_Missing',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'Client_Secret_Missing',
            callbackURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile;
        const user = await this.authService.validateOAuthLogin({
            email: emails[0].value,
            name: `${name.givenName} ${name.familyName}`,
            provider: 'GOOGLE',
            photoUrl: photos[0].value,
        });
        done(null, user);
    }
}
