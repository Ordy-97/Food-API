import express, {Request, Response, NextFunction} from 'express'
import { GetAvailableOffers, GetFoodAvailability, GetFoodsIn30Min, GetTopRestaurants, RestaurantByID, SearchFoods } from '../controllers';


const router = express.Router();

/*************************** Food Availability ********************* */
router.get('/:pincode', GetFoodAvailability);

/*************************** Top restaurants ********************* */
router.get('/top-restaurants/:pincode', GetTopRestaurants);

/*************************** Foods Available in 30 minutes ********************* */
router.get('/foods-in-30-min/:pincode', GetFoodsIn30Min);

/*************************** Search Foods ********************* */
router.get('/search/:pincode', SearchFoods);

/*************************** Search Offers ********************* */
router.get('/offers/:pincode', GetAvailableOffers);

/*************************** Find Restaurants by ID ********************* */
router.get('/restaurant/:id', RestaurantByID);



export {router as ShoppingRoute}