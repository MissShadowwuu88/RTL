import { Router } from 'express';
import { isAuthenticated } from '../../utils/authCheck.js';
import { getInfo } from '../../controllers/c-lightning/getInfo.js';

const router = Router();

router.get('/', isAuthenticated, getInfo);

export default router;
