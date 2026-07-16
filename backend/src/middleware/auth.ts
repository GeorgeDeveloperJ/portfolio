import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
        console.error('FATAL: ADMIN_TOKEN is not set.');
        res.status(500).json({ error: 'Server misconfiguration' });
        return;
    }

    let token = '';
    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            token = authHeader;
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const tokenBuffer = Buffer.from(token);
    const adminTokenBuffer = Buffer.from(adminToken);

    if (tokenBuffer.length !== adminTokenBuffer.length || !crypto.timingSafeEqual(tokenBuffer, adminTokenBuffer)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    next();
}
