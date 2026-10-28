import { Router } from 'express';
import { allRouteDocs } from '../controllers/allRouteDocs.js';
import auth from './auth.js';
import categories from './categories.js';
import dashboard from './dashboard.js';
import orders from './orders.js';
import products from './products.js';
import reports from './reports.js';
import roles from './roles.js';
import settings from './settings.js';
import uploads from './uploads.js';
import users from './users.js';

const router = Router();
router.get("/", allRouteDocs);
router.use('/auth', auth);
router.use('/dashboard', dashboard);
router.use('/products', products);
router.use('/categories', categories);
router.use('/orders', orders);
router.use('/users', users);
router.use('/roles', roles);
router.use('/reports', reports);
router.use('/settings', settings);
router.use('/uploads', uploads);


export default router;
