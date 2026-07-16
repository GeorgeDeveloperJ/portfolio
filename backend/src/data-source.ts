import { DataSource } from 'typeorm';
import { Project } from './entities/Project';
import { Skill } from './entities/Skill';
import { Certification } from './entities/Certification';

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test',
    logging: false,
    entities: [Project, Skill, Certification],
    subscribers: [],
    migrations: [],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});
