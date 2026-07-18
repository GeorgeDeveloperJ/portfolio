import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Project } from './entities/Project';
import { Skill } from './entities/Skill';
import { Certification } from './entities/Certification';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    entities: [Project, Skill, Certification],
    subscribers: [],
    migrations: [__dirname + "/migrations/*.ts"],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});
