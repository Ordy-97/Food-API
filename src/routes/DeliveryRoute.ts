import express, { Request, Response, NextFunction } from 'express';
import { DeliveryUserLogin, DeliveryUserSingUp, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus } from '../controllers';

import { Offer } from '../models/Offer';
import { Authenticate } from '../middlewares';


const router = express.Router();


/* ------------------- Signup / Create Delivery --------------------- */
router.post('/signup', DeliveryUserSingUp)

/* ------------------- Login --------------------- */
router.post('/login', DeliveryUserLogin)

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Change Service Status --------------------- */
router.put('/change-status', UpdateDeliveryUserStatus);

/* ------------------- Profile --------------------- */
router.get('/profile', GetDeliveryUserProfile)
router.patch('/profile', EditDeliveryUserProfile)


export { router as DeliveryRoute}