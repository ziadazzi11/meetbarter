import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ShadowbanException } from '../guards/shadowban.guard';

@Catch(ShadowbanException)
export class ShadowbanFilter implements ExceptionFilter {
    catch(exception: ShadowbanException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // 👻 THE PHANTOM RESPONSE
        // Return a generic success to make the user think their action worked.
        // We simulate a created resource or a successful operation.

        response
            .status(HttpStatus.CREATED) // or 200 depending on generic need, 201 is often better for POST
            .json({
                status: 'success',
                message: 'Operation completed successfully.',
                timestamp: new Date().toISOString(),
                // Generate a fake ID to complete the illusion
                id: 'sb-' + Math.random().toString(36).substr(2, 9)
            });
    }
}
