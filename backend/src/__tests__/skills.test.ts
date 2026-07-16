import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../data-source';

jest.mock('../data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

jest.mock('../middleware/auth', () => ({
    authenticate: (req: any, res: any, next: any) => next()
}));

jest.mock('../middleware/rateLimiter', () => ({
    mutationLimiter: (req: any, res: any, next: any) => next()
}));

describe('Skills Route', () => {
    let mockRepo: any;

    beforeEach(() => {
        mockRepo = {
            find: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/skills', () => {
        it('should return list of skills', async () => {
            const mockSkills = [
                { id: '1', name: 'React', category: 'Frontend', level: 'Expert', order: 1 }
            ];
            mockRepo.find.mockResolvedValue(mockSkills);

            const response = await request(app).get('/api/skills');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSkills);
            expect(mockRepo.find).toHaveBeenCalledWith({
                order: {
                    order: 'ASC',
                    name: 'ASC'
                }
            });
        });

        it('should return 500 on db failure', async () => {
            mockRepo.find.mockRejectedValue(new Error('DB Error'));
            const response = await request(app).get('/api/skills');
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Failed to fetch skills');
        });
    });

    describe('GET /api/skills/:id', () => {
        it('should return skill by ID', async () => {
            const skill = { id: 'uuid-1', name: 'TS', category: 'Frontend', level: 'Expert' };
            mockRepo.findOneBy.mockResolvedValue(skill);

            const response = await request(app).get('/api/skills/uuid-1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(skill);
        });

        it('should return 404 if not found', async () => {
            mockRepo.findOneBy.mockResolvedValue(null);
            const response = await request(app).get('/api/skills/uuid-none');
            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/skills', () => {
        it('should create skill successfully', async () => {
            const payload = { name: 'Node.js', category: 'Backend', level: 'Expert' };
            const created = { id: 'uuid', ...payload, order: 0 };
            mockRepo.create.mockReturnValue(created);
            mockRepo.save.mockResolvedValue(created);

            const response = await request(app).post('/api/skills').send(payload);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(created);
        });

        it('should return 400 if fields are missing', async () => {
            const response = await request(app).post('/api/skills').send({ name: 'Only Name' });
            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /api/skills/:id', () => {
        it('should update skill successfully', async () => {
            const skill = { id: 'uuid-1', name: 'TS', category: 'Frontend', level: 'Expert' };
            mockRepo.findOneBy.mockResolvedValue(skill);
            mockRepo.save.mockResolvedValue({ ...skill, level: 'Learning' });

            const response = await request(app).patch('/api/skills/uuid-1').send({ level: 'Learning' });
            expect(response.status).toBe(200);
            expect(response.body.level).toBe('Learning');
        });
    });

    describe('DELETE /api/skills/:id', () => {
        it('should delete skill successfully', async () => {
            const skill = { id: 'uuid-1', name: 'TS' };
            mockRepo.findOneBy.mockResolvedValue(skill);
            mockRepo.remove.mockResolvedValue(skill);

            const response = await request(app).delete('/api/skills/uuid-1');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Skill deleted successfully');
        });
    });
});
