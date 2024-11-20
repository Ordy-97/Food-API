import express, {Request, Response, NextFunction} from 'express'
import { CreateVandor, GetDeliveryUsers, GetTransactionById, GetTransactions, GetVandorById, GetVandors, VerifyDeliveryUser } from '../controllers';
import path from 'path'
const router = express.Router();


router.post('/vandor', CreateVandor);
router.get('/vandors', GetVandors);
router.get('/vandor/:id', GetVandorById);

router.put('/delivery/verify', VerifyDeliveryUser);
router.get('/delivery/', GetDeliveryUsers);

router.get('/transactions', GetTransactions);
router.get('/transaction/:id', GetTransactionById);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
     res.json({ message: 'Hello from admin!' });
});



export {router as AdminRoute}