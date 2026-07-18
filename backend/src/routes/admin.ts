import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/verify', authenticate, (req, res) => {
    res.json({ message: 'Authentication successful' });
});

export default router;
