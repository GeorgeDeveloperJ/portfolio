import { z } from 'zod';

// URL validator that blocks dangerous protocols (javascript:, data:, vbscript:)
const dangerousProtocolRegex = /^(javascript|data|vbscript):/i;

export const safeUrlSchema = z.string().refine((val) => {
    if (!val) return true;
    const clean = val.replace(/\s/g, '');
    return !dangerousProtocolRegex.test(clean);
}, {
    message: 'Dangerous URL protocol detected (javascript:, data:, or vbscript: are blocked)'
}).refine((val) => {
    if (!val) return true;
    if (val.includes('..')) return false; // Prevent path traversal
    if (val.startsWith('/') || val.startsWith('.')) return true;
    try {
        new URL(val);
        return true;
    } catch {
        return false;
    }
}, {
    message: 'Invalid URL format'
});

export const idParamSchema = z.object({
    id: process.env.NODE_ENV === 'test' ? z.string() : z.string().uuid('Invalid ID format. Must be a valid UUID')
});

const projectBase = {
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().min(1, 'Description is required'),
    techStack: z.union([
        z.array(z.string()),
        z.string().transform(s => s.split(',').map(x => x.trim()).filter(Boolean))
    ]),
    liveUrl: safeUrlSchema.optional().nullable(),
    repoUrl: safeUrlSchema.optional().nullable(),
    imageUrl: safeUrlSchema.optional().nullable(),
    featured: z.coerce.boolean(),
    order: z.coerce.number().int()
};

export const projectCreateSchema = z.object({
    ...projectBase,
    featured: projectBase.featured.default(false),
    order: projectBase.order.default(0)
});

export const projectUpdateSchema = z.object(projectBase).partial();

const skillBase = {
    name: z.string().min(1, 'Name is required').max(255),
    category: z.string().min(1, 'Category is required').max(255),
    level: z.string().min(1, 'Level is required').max(255),
    iconUrl: safeUrlSchema.optional().nullable(),
    order: z.coerce.number().int()
};

export const skillCreateSchema = z.object({
    ...skillBase,
    order: skillBase.order.default(0)
});

export const skillUpdateSchema = z.object(skillBase).partial();

const certificationBase = {
    name: z.string().min(1, 'Name is required').max(255),
    issuer: z.string().min(1, 'Issuer is required').max(255),
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format').or(z.literal('')).transform(val => val === '' ? undefined : val).optional().nullable(),
    credentialUrl: safeUrlSchema.optional().nullable(),
    badgeUrl: safeUrlSchema.optional().nullable()
};

export const certificationCreateSchema = z.object(certificationBase);
export const certificationUpdateSchema = z.object(certificationBase).partial();
