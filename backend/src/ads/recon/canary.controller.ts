import { Controller, Get, Req, Ip, All } from '@nestjs/common';
import { SignalIngestionService } from '../signal-ingestion.service';
import { Request } from 'express';

@Controller()
export class CanaryController {
    constructor(private signalIngestion: SignalIngestionService) { }

    // 🪤 TRAP 1: Typical Admin Probing
    @All('admin/debug/users')
    @All('api/admin/phpmyadmin')
    @All('wp-admin')
    async honeypotAdmin(@Req() req: Request, @Ip() ip: string) {
        this.emitTrap(ip, req, 'ADMIN_PROBE');
        return this.fakeResponse();
    }

    // 🪤 TRAP 2: Swagger/Dev Probing
    @Get('api/v1/swagger.json')
    @Get('api/docs/internal')
    async honeypotDocs(@Req() req: Request, @Ip() ip: string) {
        this.emitTrap(ip, req, 'DOCS_PROBE');
        return {
            openapi: "3.0.0",
            info: { title: "Internal API (Deprecated)", version: "0.1.0-alpha" },
            paths: {}
        };
    }

    // 🪤 TRAP 3: Sensitive Data Dump
    @Get('api/users/dump')
    @Get('backup.sql')
    async honeypotDump(@Req() req: Request, @Ip() ip: string) {
        this.emitTrap(ip, req, 'DATA_DUMP_PROBE');
        // Slow response to waste time?
        await new Promise(r => setTimeout(r, 2000));
        return "Error: Database connection timeout.";
    }

    private emitTrap(ip: string, req: Request, trapType: string) {
        this.signalIngestion.emitSignal({
            type: 'HONEYPOT_TRIGGER',
            source: ip,
            timestamp: Date.now(),
            metadata: {
                trapType,
                method: req.method,
                url: req.url,
                headers: req.headers
            }
        });
    }

    private fakeResponse() {
        // Return believable but useless data
        return {
            status: 'error',
            code: 403,
            message: 'Access Denied: Internal IP range required.',
            trace_id: Math.random().toString(36).substring(7)
        };
    }
}
