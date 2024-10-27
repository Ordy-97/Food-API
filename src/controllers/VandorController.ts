import express, {Request, Response, NextFunction} from 'express'
import { CreateOfferInputs, EditVandorInputs, VandorLoginInputs } from '../dto'
import { FindVandor } from './AdminController'
import { GenerateSignature, ValidatePassword } from '../utility'
import { CreateFoodInputs } from '../dto/Food.dto'
import { Food, Offer, Order } from '../models'

export const VandorLogin = async (req:Request, res:Response, next:NextFunction) => {
    const { email, password } = <VandorLoginInputs>req.body

    const existingVandor = await FindVandor('', email);
    //if vandor exist then we compare the paswword
    if(existingVandor != null){
        const validation = await ValidatePassword(password, existingVandor.password, existingVandor.salt);
        //signature or token
        if(validation){
            const signature = await GenerateSignature({
                _id: existingVandor.id,
                email: existingVandor.email,
                name: existingVandor.name,
                // foodType: existingVandor.foodType, 
            })

            return res.status(200).json(signature);
        } else {
            return res.status(401).json({ message : "Password incorrect !"});
        }
    }

    res.json({ message: "Incorrect Email / password."})

}

export const GetVandorProfile = async (req:Request, res:Response, next:NextFunction) => {

    const user = req.user;

    if(user){
        const existingVandor = await FindVandor(user._id);
        return res.json(existingVandor);
    }

    return res.json({message: "Vandor information not found."});
}

export const UpdateVandorProfile = async (req:Request, res:Response, next:NextFunction) => {
   
    const {foodType, name, address, phone } = <EditVandorInputs>req.body

    const user = req.user;

    if(user){
        const existingVandor = await FindVandor(user._id);
        if(existingVandor){
            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.phone = phone;
            existingVandor.foodType = foodType;

            const savedResult = await existingVandor.save();

           return res.json(savedResult);
        }
        return res.json(existingVandor);
    }

    return res.json({message: "Vandor information not found."});

}

export const UpdateVandorService = async (req:Request, res:Response, next:NextFunction) => {

    const user = req.user;

    const { lat, lng } = req.body;

    if(user){
        const existingVandor = await FindVandor(user._id);
        if(existingVandor !== null){

            existingVandor.serviceAvalaible = !existingVandor.serviceAvalaible;

            if(lat && lng){
                existingVandor.lat = lat;
                existingVandor.lng = lng; 
            }

            const savedResult = await existingVandor.save();
            
            return res.json(savedResult);
        }
        return res.json(existingVandor);
    }

    return res.json({"message": "Vandor information not found."});
}


export const UpdateVandorCoverImage = async (req:Request, res:Response, next:NextFunction) => {
    
    const user = req.user; // c'est notre token

    if(user){
        const vandor = await FindVandor(user._id);

        if(vandor !== null){

            const files = req.files as Express.Multer.File[];

            const images = files.map((file: Express.Multer.File) => file.filename);

           vandor.coverImages.push(...images); //ajoute les objets food créé dans l'attribut 'coverImage' de 'vandor'
           const result = await vandor.save();

           return res.json(result)

        }
        return res.status(403).json({"message": "None Authorized"});
    }

    return res.json({"message": "Something went wrong with add food."});

}



export const AddFood = async (req:Request, res:Response, next:NextFunction) => {

    const user = req.user; // c'est notre token
    const { name, description, category, foodType, readyTime, price } = <CreateFoodInputs>req.body

    if(user){
        const vandor = await FindVandor(user._id);

        if(vandor !== null){

            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            const createdFood = await Food.create({
                vandorId: vandor._id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                images: images,
                readyTime: readyTime,
                price: price,
                rating: 0
            })

           vandor.foods.push(createdFood); //ajoute l'objet food créé dans l'attribut 'foods' de 'vandor'
           const result = await vandor.save();

           return res.json(result)

        }
        return res.status(403).json({"message": "None Authorized"});
    }

    return res.json({"message": "Something went wrong with add food."});
}



export const GetFoods = async (req:Request, res:Response, next:NextFunction) => {

    const user = req.user;

    if(user){
        const foods = await Food.find({ vandorId: user._id}) //recupère tous les foods de la table Food où l'id du user "vandorId" est égal à l'id de notre token user (user._id)

        if(foods !== null){
            return res.json(foods);
        }

    }

    return res.json({"message": "Foods information not found."});
}



/*************************************Manage Order/Commande By the Vandor/Restaurant****************************** */

/*********************************** Get Current Orders ************************************************************** */
export const GetCurrentOrders = async (req:Request, res:Response, next:NextFunction) => {

    const user = req.user;
    console.log({user});

    if(user){
        const orders = await Order.find({ vandorId: user._id }).populate('items.food');

        if(orders != null){
            return res.status(200).json(orders);
        }
    }

    return res.status(400).json({"message": "Order not found."});
}



/*********************************** Get Detail for some Order ************************************************************** */
export const GetOrderDetail = async (req:Request, res:Response, next:NextFunction) => {

    const orderId = req.params.id;

    if(orderId){
        const order = await Order.findById(orderId).populate("items.food");

        if(order){
            return res.status(200).json(order);
        }
    }

    return res.json({"message": "Foods information not found."});
}


/*********************************** Process of order ************************************************************** */
export const ProcessOrder = async (req:Request, res:Response, next:NextFunction) => {

    const orderId = req.params.id;

    const {status, remarks, time } = req.body // ACCEPT // REJECT // UNDER-PROCESS // READY

    if(orderId){

        const order = await Order.findById(orderId).populate("items.food");

        order.orderStatus = status;
        order.remarks = remarks;
        if(time){
            order.readyTime = time;
        }

        const orderResult = await order.save();
        if(orderResult != null){
            return res.status(200).json(orderResult);
        }
    }
    return res.json({"message": "Unable to process Order."});
}




/***************************************** Offers *********************************************************/

/*********************************** Get offers ***************************************************/
export const GetOffers = async (req:Request, res:Response, next:NextFunction) => {

    const user = req.user;

    if(user){
        let currentOffer = Array();

        const offers = await Offer.find().populate('vandors');

        if(offers){


            offers.map(item => {

                if(item.vandors){
                    item.vandors.map(vandor => {
                        if(vandor._id.toString() === user._id){
                            currentOffer.push(item);
                        }
                    })
                }

                if(item.offerType === "GENERIC"){
                    currentOffer.push(item)
                }

            })

        }

        return res.status(200).json(currentOffer);

    }

    return res.json({ message: 'Offers Not available'});

}




/************************************ Create offer ***************************************************/
export const AddOffer = async (req:Request, res:Response, next:NextFunction) => {

    const user = req.user;

    if(user){
        const { title, description, offerType, offerAmount, pincode,
        promoCode, promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

        const vandor = await FindVandor(user._id);

        if(vandor){

            const offer = await Offer.create({
                title,
                description,
                offerType,
                offerAmount,
                pincode,
                promoType,
                startValidity,
                endValidity,
                bank,
                isActive,
                minValue,
                vandors:[vandor]
            })

            console.log(offer);

            return res.status(200).json(offer);

        }

    }

    return res.json({ message: 'Unable to add Offer!'});


}





/************************************ Edit offer ******************************************************/
export const EditOffer = async (req:Request, res:Response, next:NextFunction) => {

    const user = req.user;
    const offerId = req.params.id;

    if(user){
        const { title, description, offerType, offerAmount, pincode,
        promoCode, promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

        const currentOffer = await Offer.findById(offerId);

        if(currentOffer){

            const vandor = await FindVandor(user._id);
    
            if(vandor){

                    currentOffer.title =  title,
                    currentOffer.description = description,
                    currentOffer.offerType = offerType,
                    currentOffer.offerAmount = offerAmount,
                    currentOffer.pincode = pincode,
                    currentOffer.promoType = promoType,
                    currentOffer.startValidity = startValidity,
                    currentOffer.endValidity = endValidity,
                    currentOffer.bank = bank,
                    currentOffer.isActive = isActive,
                    currentOffer.minValue = minValue
                

                const result = await currentOffer.save();
                return res.status(200).json(result);
    
            }
        }

    }

    return res.json({ message: 'Edit failed !'});


}