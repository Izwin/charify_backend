import express from 'express';
import {  getUserDonations } from '../controllers/donationController.js';
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', authMiddleware, getUserDonations);

export default router;
