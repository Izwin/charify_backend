import express from 'express';
import { createApplication, getApplications, getApplicationById } from '../controllers/applicationController.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import multer from 'multer';
import * as path from 'node:path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'src/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

router.post('/', upload.array('images'), createApplication);
router.get('/', getApplications);
router.get('/:id', authenticateToken, getApplicationById);

export default router;
