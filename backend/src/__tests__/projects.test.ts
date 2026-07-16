import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../data-source';
import { Project } from '../entities/Project';

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

describe('Projects Route', () => {
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

    describe('GET /api/projects', () => {
        it('should return list of projects', async () => {
            const mockProjects = [
                { id: '1', title: 'Proj 1', description: 'Desc 1', techStack: ['React'] }
            ];
            mockRepo.find.mockResolvedValue(mockProjects);

            const response = await request(app).get('/api/projects');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProjects);
            expect(mockRepo.find).toHaveBeenCalledWith({
                order: {
                    order: 'ASC',
                    createdAt: 'DESC'
                }
            });
        });

        it('should return 500 when database find fails', async () => {
            mockRepo.find.mockRejectedValue(new Error('DB error'));
            const response = await request(app).get('/api/projects');
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Failed to fetch projects');
        });
    });

    describe('GET /api/projects/:id', () => {
        it('should return project if found', async () => {
            const mockProject = { id: 'uuid-1', title: 'Proj 1', description: 'Desc 1', techStack: ['React'] };
            mockRepo.findOneBy.mockResolvedValue(mockProject);

            const response = await request(app).get('/api/projects/uuid-1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProject);
            expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
        });

        it('should return 404 if project not found', async () => {
            mockRepo.findOneBy.mockResolvedValue(null);

            const response = await request(app).get('/api/projects/non-existent');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Project not found');
        });
    });

    describe('POST /api/projects', () => {
        it('should create a project successfully', async () => {
            const payload = {
                title: 'New Proj',
                description: 'New Desc',
                techStack: ['Node', 'TypeScript']
            };
            const createdProject = { id: 'uuid-123', ...payload, featured: false, order: 0 };
            mockRepo.create.mockReturnValue(createdProject);
            mockRepo.save.mockResolvedValue(createdProject);

            const response = await request(app)
                .post('/api/projects')
                .send(payload);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(createdProject);
            expect(mockRepo.create).toHaveBeenCalledWith({
                title: payload.title,
                description: payload.description,
                techStack: payload.techStack,
                featured: false,
                order: 0,
                liveUrl: undefined,
                repoUrl: undefined,
                imageUrl: undefined
            });
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/projects')
                .send({ title: 'Missing Desc' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Title, description, and techStack are required');
        });
    });

    describe('PATCH /api/projects/:id', () => {
        it('should update project successfully', async () => {
            const originalProject = {
                id: 'uuid-1',
                title: 'Old Title',
                description: 'Old Desc',
                techStack: ['React']
            };
            mockRepo.findOneBy.mockResolvedValue(originalProject);
            mockRepo.save.mockResolvedValue({ ...originalProject, title: 'New Title' });

            const response = await request(app)
                .patch('/api/projects/uuid-1')
                .send({ title: 'New Title' });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('New Title');
        });
    });

    describe('DELETE /api/projects/:id', () => {
        it('should delete project successfully', async () => {
            const project = { id: 'uuid-1', title: 'Proj' };
            mockRepo.findOneBy.mockResolvedValue(project);
            mockRepo.remove.mockResolvedValue(project);

            const response = await request(app).delete('/api/projects/uuid-1');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Project deleted successfully');
        });
    });
});
