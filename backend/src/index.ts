import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import projectsRouter from './routes/projects';
import skillsRouter from './routes/skills';
import certificationsRouter from './routes/certifications';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();

app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50kb' }));

const PORT = parseInt(process.env.PORT || '5000', 10);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/projects', projectsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/certifications', certificationsRouter);
app.use('/api/admin', adminRouter);

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
            process.exit(1);
        });
}

export { AppDataSource };
export default app;
