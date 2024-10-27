import express, {Request, Response, NextFunction, application} from 'express'
import { AddFood, AddOffer, EditOffer, GetCurrentOrders, GetFoods, GetOffers, GetOrderDetail, GetVandorProfile, ProcessOrder,
      UpdateVandorCoverImage, UpdateVandorProfile, UpdateVandorService, VandorLogin 
     } from '../controllers';
import { Authenticate } from '../middlewares';

import multer from 'multer';
import { Images } from '../middlewares';

const router = express.Router();


// const imageStorage = multer.diskStorage({

//      destination: (req, file, cb) => {
//           cb(null, 'images');
//      },
//      filename: (req, file, cb) => {
//           cb(null, new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname)
//      }
// })

// const images = multer({ storage: imageStorage }).array('images', 10)

router.post('/login', VandorLogin);

router.use(Authenticate);
router.get('/profile', GetVandorProfile);
router.patch('/profile', UpdateVandorProfile);
router.patch('/service', UpdateVandorService);
router.patch('/coverimage', Images, UpdateVandorCoverImage);

router.post('/food', Images, AddFood);
router.get('/foods', GetFoods);


//Orders

router.get('/orders', GetCurrentOrders);
router.put('/order/:id/process', ProcessOrder);
router.get('/order/:id', GetOrderDetail);


//Offers
router.get('/offers', GetOffers);
router.post('/offer', AddOffer);
router.put('/offer/:id',EditOffer);


router.get('/',(req:Request, res:Response, next:NextFunction) => {
     res.json({message : "Hello from Vandor !"});
})


export {router as VandorRoute}