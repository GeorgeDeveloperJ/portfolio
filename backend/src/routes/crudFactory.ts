import { Router, Request, Response } from 'express';
import { EntityTarget, FindOptionsOrder } from 'typeorm';
import { ZodSchema } from 'zod';
import { AppDataSource } from '../data-source';
import { authenticate } from '../middleware/auth';
import { mutationLimiter } from '../middleware/rateLimiter';
import { idParamSchema } from '../schemas/validation';

interface CrudRouterOptions<T> {
    entityName: string;
    order: FindOptionsOrder<T>;
    createSchema: ZodSchema;
    updateSchema: ZodSchema;
}

export function createCrudRouter<T extends { id: string }>(
    entityClass: EntityTarget<T>,
    options: CrudRouterOptions<T>
): Router {
    const router = Router();
    const { entityName, order, createSchema, updateSchema } = options;

    // GET all entities
    router.get('/', async (req: Request, res: Response) => {
        try {
            const repo = AppDataSource.getRepository(entityClass);
            const items = await repo.find({ order });
            res.json(items);
        } catch (error) {
            const err = error as Error;
            console.error(`[ERROR] GET /api/${entityName.toLowerCase()}s failed:`, err.message);
            res.status(500).json({ error: `Failed to fetch ${entityName.toLowerCase()}s` });
        }
    });

    // GET single entity by ID
    router.get('/:id', async (req: Request, res: Response) => {
        try {
            const paramResult = idParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                res.status(400).json({ error: paramResult.error.issues[0].message });
                return;
            }

            const repo = AppDataSource.getRepository(entityClass);
            const item = await repo.findOneBy({ id: req.params.id } as any);
            if (!item) {
                res.status(404).json({ error: `${entityName} not found` });
                return;
            }
            res.json(item);
        } catch (error) {
            const err = error as Error;
            console.error(`[ERROR] GET /api/${entityName.toLowerCase()}s/${req.params.id} failed:`, err.message);
            res.status(500).json({ error: `Failed to fetch ${entityName.toLowerCase()}` });
        }
    });

    // POST create entity
    router.post('/', authenticate, mutationLimiter, async (req: Request, res: Response) => {
        try {
            const bodyResult = createSchema.safeParse(req.body);
            if (!bodyResult.success) {
                res.status(400).json({ error: bodyResult.error.issues.map(e => e.message).join(', ') });
                return;
            }

            const repo = AppDataSource.getRepository(entityClass);
            const newItem = repo.create(bodyResult.data as any);
            await repo.save(newItem);
            res.status(201).json(newItem);
        } catch (error) {
            const err = error as Error;
            console.error(`[ERROR] POST /api/${entityName.toLowerCase()}s failed:`, err.message);
            res.status(500).json({ error: `Failed to create ${entityName.toLowerCase()}` });
        }
    });

    // PATCH update entity
    router.patch('/:id', authenticate, mutationLimiter, async (req: Request, res: Response) => {
        try {
            const paramResult = idParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                res.status(400).json({ error: paramResult.error.issues[0].message });
                return;
            }

            const bodyResult = updateSchema.safeParse(req.body);
            if (!bodyResult.success) {
                res.status(400).json({ error: bodyResult.error.issues.map(e => e.message).join(', ') });
                return;
            }

            const repo = AppDataSource.getRepository(entityClass);
            const item = await repo.findOneBy({ id: req.params.id } as any);
            if (!item) {
                res.status(404).json({ error: `${entityName} not found` });
                return;
            }

            // Merge updated fields safely
            const updates = bodyResult.data as Record<string, any>;
            for (const key of Object.keys(updates)) {
                if (updates[key] !== undefined) {
                    (item as any)[key] = updates[key];
                }
            }

            await repo.save(item);
            res.json(item);
        } catch (error) {
            const err = error as Error;
            console.error(`[ERROR] PATCH /api/${entityName.toLowerCase()}s/${req.params.id} failed:`, err.message);
            res.status(500).json({ error: `Failed to update ${entityName.toLowerCase()}` });
        }
    });

    // DELETE entity
    router.delete('/:id', authenticate, mutationLimiter, async (req: Request, res: Response) => {
        try {
            const paramResult = idParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                res.status(400).json({ error: paramResult.error.issues[0].message });
                return;
            }

            const repo = AppDataSource.getRepository(entityClass);
            const item = await repo.findOneBy({ id: req.params.id } as any);
            if (!item) {
                res.status(404).json({ error: `${entityName} not found` });
                return;
            }

            await repo.remove(item);
            res.json({ message: `${entityName} deleted successfully` });
        } catch (error) {
            const err = error as Error;
            console.error(`[ERROR] DELETE /api/${entityName.toLowerCase()}s/${req.params.id} failed:`, err.message);
            res.status(500).json({ error: `Failed to delete ${entityName.toLowerCase()}` });
        }
    });

    return router;
}
