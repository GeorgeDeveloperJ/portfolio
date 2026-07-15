import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false,
    entities: [],
    subscribers: [],
    migrations: [],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } : false
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

if (process.env.NODE_ENV !== 'test') {
    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!");
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err);
        });
}

export default app;
