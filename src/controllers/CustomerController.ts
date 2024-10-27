import express, {Request, Response, NextFunction} from 'express'
import { plainToClass } from 'class-transformer'
import {  validate } from 'class-validator'
import { GenerateOTP, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility'

import { CreateCustomerInputs, UserLoginInputs, EditCustomerProfileInput, OrderInputs, CartItem } from '../dto'
import { Customer, DeliveryUser, Food, Offer, Order, Transaction, Vandor } from '../models'


/********************************Customer Sign up************************************************************** */
export const CustomerSingUp = async (req:Request, res:Response, next:NextFunction) => {

    const customerInputs = plainToClass(CreateCustomerInputs, req.body)

    const inputErrors = await validate(customerInputs, { validationError: {target: true}})

    if(inputErrors.length > 0){
        return res.status(400).json(inputErrors);
    }

    const { email, phone, password } = customerInputs;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const { otp, expiry } = GenerateOTP();

    // console.log(otp, expiry);
    // return res.json("Working....")

    /**********Verify is the Customer exist********************************** */
    const existingCustomer =  await Customer.findOne({ email: email});
    
    if(existingCustomer !== null){
        return res.status(400).json({message: 'Email already exist!'});
    }

    
    const result = await Customer.create({
        email: email,
        password: userPassword,
        phone: phone,
        salt: salt,
        address: '',
        firstName: '',
        lastName: '',
        otp: otp,
        otp_expiry: expiry,
        verified: false,
        lat: 0,
        lng: 0,
        orders: []
    })

    if(result){

        //send the otp to the client
        await onRequestOTP(otp, phone);

        //generate the signature
        const signature = await GenerateSignature({
            _id: result.id,
            email: result.email,
            verified: result.verified
        })

        //send the result to the client
        return res.status(201).json({ signature: signature, verified: result.verified, email: result.email })
    }

    return res.status(400).json({ message: "Problem with signup."})
}


/***********************************Login Customer***************************************************************** */
export const CustomerLogin = async (req:Request, res:Response, next:NextFunction) => {

    // const customer = req.user;

    const customerInputs = plainToClass(UserLoginInputs, req.body)

    const inputErrors = await validate(customerInputs, { validationError: {target: true}})

    if(inputErrors.length > 0){
        return res.status(400).json(inputErrors);
    }

    const { email, password } = req.body;

    const customer = await Customer.findOne({ email: email })
    if(customer){

        const validation = await ValidatePassword(password, customer.password, customer.salt)

        if(validation) {
            //generate the signature
            const signature = await GenerateSignature({
                _id: customer.id,
                email: customer.email,
                verified: customer.verified
            })

            //send the result to the client
            return res.status(201).json({
                signature: signature, 
                verified: customer.verified, 
                email: customer.email 
            })
        }
    }

    return res.status(404).json({ message: "Access NON AUTHORIZED or Login error."})
}

/*********************************Verify account with OTP*********************************************************** */
export const CustomerVerify = async (req:Request, res:Response, next:NextFunction) => {
    const { otp } = req.body;
    
    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id);

        if(profile){

            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;

                const updateCustomerReponse = await profile.save();

                //generate the new signature
                const signature = await GenerateSignature({
                    _id: updateCustomerReponse.id,
                    email: updateCustomerReponse.email,
                    verified: updateCustomerReponse.verified
                })

                
                //send the result to the client
                return res.status(200).json({ 
                    signature: signature, 
                    verified: updateCustomerReponse.verified, 
                    email: updateCustomerReponse.email 
                })
            }
        }
    }

    return res.status(400).json({ message: "Problem with OTP validation."})
}


/*************************************************Request a new OTP*************************************************** */
export const CustomerOtp = async (req:Request, res:Response, next:NextFunction) => {

    const customer = req.user;
    
    if(customer){
         const profile = await Customer.findById(customer._id)

         if(profile){
            const { otp, expiry } = GenerateOTP();
            
            profile.otp = otp;
            profile.otp_expiry = expiry;

            await profile.save();
            await onRequestOTP(otp, profile.phone)

            return res.status(200).json({ message: "new OTP sent to your registered number."})
         }
    }

    return res.status(400).json({ message: "Error with OTP validation."})

}

/*****************************************Get Profile Customer**************************************************** */
export const GetCustomerProfile = async (req:Request, res:Response, next:NextFunction) => {

    const customer = req.user;
    
    if(customer){
         const profile = await Customer.findById(customer._id)

         if(profile){

            return res.status(200).json(profile)

         }
    }

    return res.status(400).json({ message: "Error with fetch profile."})


}

/*************************************Edit profile Customer******************************************************************* */
export const EditCustomerProfile = async (req:Request, res:Response, next:NextFunction) => {

    const customer = req.user;
        // const customer = req.user;

        const profileInputs = plainToClass(EditCustomerProfileInput, req.body)

        const profileErrors = await validate(profileInputs, { validationError: {target: true}})
    
        if(profileErrors.length > 0){
            return res.status(400).json(profileErrors);
        }
    
        const { firstName, lastName, address } = req.body;
    
    if(customer){
         const profile = await Customer.findById(customer._id)

         if(profile){
            
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;

            await profile.save();

            return res.status(200).json(profile)
         }
    }

    return res.status(400).json({ message: "Error with edit profile."})

}




/*************************************add food to a cart || ajout d'un nouveau produit au panier******************************************************************* */
export const addToCart = async (req:Request, res:Response, next:NextFunction) => {

    const customer = req.user;

    if(customer){

        const profile = await Customer.findById(customer._id).populate("cart.food");
        let cartItems = Array();

        const { _id, unit } = <CartItem>req.body; //nouveaux produits à ajouter

        const food = await Food.findById(_id);

        if(food){

            if(profile != null){

                //check for cart items
                cartItems = profile.cart; //cartItems || panier

                if(cartItems.length > 0){
                    //check an update unit || on recherche s'il y'a des id "food" contenus dans cartItems et dans cart({food, unit})
                    let existFoodItem = cartItems.filter(item => item.food._id.toString() === _id);

                    if(existFoodItem.length > 0){ // si c'est le cas

                        const index = cartItems.indexOf(existFoodItem[0]); // on recupère l'index de cet objet cart contenu dans cartItems

                        if(unit > 0){ // si l'attribut unit du nouveau food à ajouter est >0, alors on remplace l'ancien unit de cartItems[index] par lui
                            cartItems[index] = { food, unit }
                        } else { //unit =0 on retire l'objet cart dans cartItems
                            cartItems.splice(index, 1)
                        }

                    } else {
                        cartItems.push({ food, unit })
                    }

                } else {

                    cartItems.push({ food, unit })

                }

                //sauvegarde de cartItems dans l'attribut cart de Customer
                if(cartItems){
                    profile.cart = cartItems as any;
                    const cartResult = await profile.save();
                    return res.status(200).json(cartResult);
                }
            }

        }
        
    }
    return res.status(400).json("Unable to add to a cart .");

}


/*************************************Get cart******************************************************************* */
export const GetCart = async (req:Request, res:Response, next:NextFunction) => {

    const customer = req.user;

    if(customer){

        const profile = await Customer.findById(customer._id).populate("cart.food");

        if(profile){
            return res.status(200).json(profile.cart);
        }
    }

    return res.status(400).json("Cart is empty .");

}

/*************************************delete cart******************************************************************* */
export const DeleteCart = async (req:Request, res:Response, next:NextFunction) => {

    const customer = req.user;

    if(customer){

        const profile = await Customer.findById(customer._id).populate("cart.food");

        if(profile != null){
            profile.cart = [] as any;
            const cartResult = await profile.save();
            return res.status(200).json(cartResult.cart);
        }
    }

    return res.status(400).json("Cart is already empty .");
}




/***************************Create Payment ****************************************************************************/
export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const { amount, paymentMode, offerId} = req.body;

    let payableAmount = Number(amount);

    //500 - 200 = 300

    if(offerId){

        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer.isActive){
            payableAmount = (payableAmount - appliedOffer.offerAmount);
        }
    }
    // perform payment gateway charge api

    // create record on transaction
    const transaction = await Transaction.create({
        customer: customer._id,
        vandorId: '',
        orderId: '',
        orderValue: payableAmount,
        offerUsed: offerId || 'NA',
        status: 'OPEN', // Failed // Success
        paymentMode: paymentMode,
        paymentResponse: 'Payment is cash on Delivery'
    })


    //return transaction
    return res.status(200).json(transaction);

}

/**********************************************Delivery Section ****************************************************************/
const assignOderForDelivery = async (orderId: string, vandorId: string) => {

    //find the vandor
    const vandor = await Vandor.findById(orderId);

    if(vandor){
        const areaCode = vandor.pincode;
        const vandorLat = vandor.lat;
        const vandorLng = vandor.lng;

        //find the available Delivery person
        const deliveryPerson = await DeliveryUser.find({ pincode: areaCode, verified: true, isAvailable: true });

        if(deliveryPerson){
            // Check the nearest delivery person and assign the order

            const currentOrder = await Order.findById(orderId);
            if(currentOrder){
                //update Delivery ID
                currentOrder.deliveryId = deliveryPerson[0].id; 
                const response = await currentOrder.save();

                console.log(response);

                //Notify to vendor for received new order firebase push notification
            }

        }

    }


}

/*************************************Create Order Customer******************************************************************* */
 const validateTransaction = async(transactionId: string) =>{

    const currentTransaction =await Transaction.findById(transactionId);

    if(currentTransaction){
        if(currentTransaction.status.toLowerCase() !== "failed"){
            return { status: true, currentTransaction }
        }
    }
    return { status: false, currentTransaction }
}




// ----------------------------------------------------------------------------------------------------------//



export const CreateOrder = async (req:Request, res:Response, next:NextFunction) => {

    //grab current login customer
    const customer = req.user;

    const { transactionId, amount, items } = <OrderInputs>req.body
    //items // [ {id: XX, unit: XX}]

    if(customer){

        const { status, currentTransaction } = await validateTransaction(transactionId)

        if(!status){
            return res.status(400).json({ message: "Error with create transaction !"})
        }

        const profile = await Customer.findById(customer._id);

        //create an order ID
        const orderID = `${Math.floor(Math.random() * 89999) + 1000}`;


        let cartItems = Array(); //cartItems || panier

        let netAmount = 0.0;

        let vandorID;

        //Calculate order amount
        const foods = await Food.find().where('_id').in(items.map(item => item._id)).exec();

        //mapping des deux tableaux retrouver la quantité ou unit exacte de chaque food
        foods.map(food => {

            items.map(({ _id, unit }) => {

                if(food._id == _id){
                    vandorID = food.vandorId;
                    netAmount += (food.price * unit);
                    cartItems.push({ food , unit });
                }
            })
        })

        //Create order with item description
        if(cartItems){

            const currentOrder = await Order.create({
                orderID: orderID,
                vandorId: vandorID,
                items: cartItems,
                totalAmount: netAmount,
                paidAmount: amount, //amount paid before offer
                orderDate: new Date(),
                orderStatus: 'Waiting',
                remarks: '',
                deliveryId: '',
                readyTime: 45,
            })

            profile.cart = [] as any;
            profile.orders.push(currentOrder);

            currentTransaction.vandorId = vandorID;
            currentTransaction.orderId = orderID;
            currentTransaction.status = 'CONFIRMED'

            await currentTransaction.save();

            assignOderForDelivery(currentOrder.id, vandorID)

            const profileSaveResponse = await profile.save();

            return res.status(200).json({ currentOrder });
        
        } else {
            
            return res.status(400).json({ message: "Error with Create Order !"});
        }
        
    }

}

/*************************************Get Orders Customer******************************************************************* */
export const GetOrders = async (req:Request, res:Response, next:NextFunction) => {
    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id).populate("orders");

        if(profile){
            return res.status(200).json(profile.orders);
        }
    }

}

/*************************************Get Order by IDr******************************************************************* */
export const GetOrderById = async (req:Request, res:Response, next:NextFunction) => {
    const customer = req.user;

    if(customer){
        const orderId = req.params.id;

        const order = await Order.findById(orderId).populate("items.food");

        if(order){
            return res.status(200).json(order);
        }
    }
    return res.status(404).json({ message: "Acces denied !"});
}


/**************************Verify Offer *****************************************************************************/
export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {

    const offerId = req.params.id;
    const customer = req.user;
    
    if(customer){

        const appliedOffer = await Offer.findById(offerId);
        
        if(appliedOffer){
            if(appliedOffer.isActive){
                return res.status(200).json({ message: 'Offer is Valid', offer: appliedOffer});
            }
        }

    }

    return res.status(400).json({ msg: 'Offer is Not Valid'});
}


