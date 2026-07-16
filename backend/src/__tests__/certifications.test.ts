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

describe('Certifications Route', () => {
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

    describe('GET /api/certifications', () => {
        it('should return list of certifications', async () => {
            const mockCerts = [
                { id: '1', name: 'AWS Cloud Practitioner', issuer: 'AWS', issueDate: '2026-01-01' }
            ];
            mockRepo.find.mockResolvedValue(mockCerts);

            const response = await request(app).get('/api/certifications');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCerts);
            expect(mockRepo.find).toHaveBeenCalledWith({
                order: {
                    issueDate: 'DESC'
                }
            });
        });

        it('should return 500 on db failure', async () => {
            mockRepo.find.mockRejectedValue(new Error('DB Error'));
            const response = await request(app).get('/api/certifications');
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Failed to fetch certifications');
        });
    });

    describe('GET /api/certifications/:id', () => {
        it('should return certification by ID', async () => {
            const cert = { id: 'uuid-1', name: 'AWS Cloud Practitioner', issuer: 'AWS', issueDate: '2026-01-01' };
            mockRepo.findOneBy.mockResolvedValue(cert);

            const response = await request(app).get('/api/certifications/uuid-1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(cert);
        });

        it('should return 404 if not found', async () => {
            mockRepo.findOneBy.mockResolvedValue(null);
            const response = await request(app).get('/api/certifications/uuid-none');
            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/certifications', () => {
        it('should create certification successfully', async () => {
            const payload = { name: 'AWS Cloud Practitioner', issuer: 'AWS', issueDate: '2026-01-01' };
            const created = { id: 'uuid', ...payload };
            mockRepo.create.mockReturnValue(created);
            mockRepo.save.mockResolvedValue(created);

            const response = await request(app).post('/api/certifications').send(payload);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(created);
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app).post('/api/certifications').send({ name: 'Only Name' });
            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /api/certifications/:id', () => {
        it('should update certification successfully', async () => {
            const cert = { id: 'uuid-1', name: 'AWS Cloud Practitioner', issuer: 'AWS', issueDate: '2026-01-01' };
            mockRepo.findOneBy.mockResolvedValue(cert);
            mockRepo.save.mockResolvedValue({ ...cert, name: 'AWS Solutions Architect' });

            const response = await request(app).patch('/api/certifications/uuid-1').send({ name: 'AWS Solutions Architect' });
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('AWS Solutions Architect');
        });
    });

    describe('DELETE /api/certifications/:id', () => {
        it('should delete certification successfully', async () => {
            const cert = { id: 'uuid-1', name: 'AWS' };
            mockRepo.findOneBy.mockResolvedValue(cert);
            mockRepo.remove.mockResolvedValue(cert);

            const response = await request(app).delete('/api/certifications/uuid-1');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Certification deleted successfully');
        });
    });
});
