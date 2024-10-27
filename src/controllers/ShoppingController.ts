import express, {Request, Response, NextFunction} from 'express'
import { FoodDoc, Offer, Vandor } from '../models';


export const GetFoodAvailability = async (req:Request, res:Response, next:NextFunction) => {

    const pincode = req.params.pincode;

    const result = await Vandor.find({ pincode: pincode, serviceAvalaible: false })
    .sort([[ 'rating', 'descending' ]])
    .populate("foods") // rempli l'attribut foods de vandor avec son contenu

    if(result.length > 0) {
        return res.status(200).json(result)
    }

    return res.status(400).json({ "message": "Data not found!" })
}



export const GetTopRestaurants = async (req:Request, res:Response, next:NextFunction) => {

    const pincode = req.params.pincode;

    const result = await Vandor.find({ pincode: pincode, serviceAvalaible: false })
    .sort([[ 'rating', 'descending' ]])
    .limit(1) // limite le nombre de restaurant (vandors) à renvoyer à 1

    if(result.length > 0) {
        return res.status(200).json(result)
    }

    return res.status(400).json({ "message": "Data not found!" })

}


export const GetFoodsIn30Min = async (req:Request, res:Response, next:NextFunction) => {

    const pincode = req.params.pincode;

    const result = await Vandor.find({ pincode: pincode, serviceAvalaible: false })
    .populate("foods");

    if(result.length > 0) {

        let foodResult: any = []

        result.map(vandor => {
            const foods = vandor.foods as [FoodDoc] // caste cet objet au format FoodDoc

            foodResult.push(...foods.filter(food => food.readyTime <= 30) )
        })

        return res.status(200).json(foodResult)
    }

    return res.status(400).json({ "message": "Data not found!" })

}

export const SearchFoods = async (req:Request, res:Response, next:NextFunction) => {
    
    const pincode = req.params.pincode;

    const result = await Vandor.find({ pincode: pincode, serviceAvalaible: false })
    .populate("foods");

    if(result.length > 0) {

        let foodResult: any = []

        result.map(item => foodResult.push(...item.foods) )

        return res.status(200).json(foodResult)
    }

    return res.status(400).json({ "message": "Food not found!" })

}

/*******************************Get available offers  *************************************************************/
export const GetAvailableOffers = async (req:Request, res:Response, next:NextFunction) => {

    const pincode = req.params.pincode

    const offers = await Offer.find({ pincode: pincode, isActive: true });

    if(offers){
        return res.status(200).json(offers);
    }

    return res.status(400).json({ message: "Data not found !" });
}


export const RestaurantByID = async (req:Request, res:Response, next:NextFunction) => {
        
    const id = req.params.id;

    const result = await Vandor.findById(id).populate("foods");

    if(result) {

        return res.status(200).json(result)
    }

    return res.status(400).json({ "message": "Data not found!" })

}