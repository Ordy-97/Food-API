import express, {Request, Response, NextFunction} from 'express'
import { CreateOrder, CreatePayment, CustomerLogin, CustomerOtp, CustomerSingUp, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderById, GetOrders, VerifyOffer, addToCart } from '../controllers/CustomerController';
import { Authenticate } from '../middlewares';


const router = express.Router();

/*************************** Signup | create customer ********************* */
router.post('/signup', CustomerSingUp);


/*************************** Login ********************* */
router.post('/login', CustomerLogin);


//authentification
router.use(Authenticate);

/*************************** Verify customer account ********************* */
router.patch('/verify', CustomerVerify);


/*************************** OTP | Requesting OTP ********************* */
router.get('/otp', CustomerOtp);


/*************************** Profile ********************* */
router.get('/profile', GetCustomerProfile);


router.patch('/profile', EditCustomerProfile);


//Cart
router.post('/cart', addToCart);

router.get('/cart', GetCart);

router.delete('/cart', DeleteCart);


//Apply for offers
router.get('/offer/verify/:id', VerifyOffer);


//Payment
router.post('/create-payment', CreatePayment)


//Order
router.post('/create-order', CreateOrder);

router.get('/orders', GetOrders);

router.get('/order/:id', GetOrderById);


//Payment

export {router as CustomerRoute}