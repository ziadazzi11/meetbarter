import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeaderDeceptionMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Remove real headers (if any leak)
        res.removeHeader('X-Powered-By');

        // Inject Fake Infrastructure Headers (The Mask)
        const decoys = [
            { 'Server': 'Apache/2.4.41 (Ubuntu)' },
            { 'Server': 'nginx/1.18.0' },
            { 'X-Powered-By': 'PHP/7.4.3' },
            { 'X-Runtime': '0.042' }, // Ruby/Rails style
            { 'X-Amz-Cf-Id': this.randomString(12) } // Fake Cloudfront
        ];

        // Pick 2 random decoys
        const chosen = this.shuffle(decoys).slice(0, 2);

        chosen.forEach(d => {
            const [key, value] = Object.entries(d)[0];
            res.setHeader(key, value as string);
        });

        next();
    }

    private shuffle(array: any[]) {
        return array.sort(() => Math.random() - 0.5);
    }

    private randomString(length: number) {
        return Math.random().toString(36).substring(2, length + 2);
    }
}
