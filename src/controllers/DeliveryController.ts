import express, {Request, Response, NextFunction} from 'express'
import { plainToClass } from 'class-transformer'
import {  validate } from 'class-validator'
import { GenerateOTP, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility'

import { UserLoginInputs, EditCustomerProfileInput, OrderInputs, CartItem, CreateDeliveryUserInput } from '../dto'
import { Customer, DeliveryUser, Food, Offer, Order, Transaction, Vandor } from '../models'


/********************************Customer Sign up************************************************************** */
export const DeliveryUserSingUp = async (req:Request, res:Response, next:NextFunction) => {

    const deliveryUserInputs = plainToClass(CreateDeliveryUserInput, req.body)

    const inputErrors = await validate(deliveryUserInputs, { validationError: {target: true}})

    if(inputErrors.length > 0){
        return res.status(400).json(inputErrors);
    }

    const { email, phone, password, address, firstName, lastName, pincode } = deliveryUserInputs;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const existingDeliveryUser =  await DeliveryUser.findOne({ email: email});

    if(existingDeliveryUser !== null){
        return res.status(400).json({message: 'A Delivery User exist with the provided email ID!'});
    }

    const result = await DeliveryUser.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        address: address,
        pincode: pincode,
        verified: false,
        lat: 0,
        lng: 0,
        isAvailable: false,
    })

    if(result){

        //generate the signature
        const signature = await GenerateSignature({
            _id: result.id,
            email: result.email,
            verified: result.verified
        })

        //send the result to the client
        return res.status(201).json({ signature: signature, verified: result.verified, email: result.email })
    }

    return res.status(400).json({ message: "Error while creating Delivery user."})
}


/***********************************Login Customer***************************************************************** */
export const DeliveryUserLogin = async (req:Request, res:Response, next:NextFunction) => {

    // const customer = req.user;

    const deliveryUserInputs = plainToClass(UserLoginInputs, req.body)

    const inputErrors = await validate(deliveryUserInputs, { validationError: {target: true}})

    if(inputErrors.length > 0){
        return res.status(400).json(inputErrors);
    }

    const { email, password } = req.body;

    const deliveryUser = await DeliveryUser.findOne({ email: email })

    if(deliveryUser){

        const validation = await ValidatePassword(password, deliveryUser.password, deliveryUser.salt)

        if(validation) {
            //generate the signature
            const signature = await GenerateSignature({
                _id: deliveryUser.id,
                email: deliveryUser.email,
                verified: deliveryUser.verified
            })

            //send the result to the client
            return res.status(201).json({
                signature: signature, 
                verified: deliveryUser.verified, 
                email: deliveryUser.email 
            })
        }
    }

    return res.status(404).json({ message: "Access NON AUTHORIZED or Login error."})
}



/*****************************************Get Profile Customer**************************************************** */
export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;

    if(deliveryUser){

        const profile =  await DeliveryUser.findById(deliveryUser._id);

        if(profile){

            return res.status(201).json(profile);
        }

    }
    return res.status(400).json({ msg: 'Error while Fetching Profile'});

}

export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {


    const deliveryUser = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(profileInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { firstName, lastName, address } = profileInputs;

    if(deliveryUser){

        const profile =  await DeliveryUser.findById(deliveryUser._id);

        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = await profile.save()

            return res.status(201).json(result);
        }

    }
    return res.status(400).json({ msg: 'Error while Updating Profile'});

}

/* ------------------- Delivery Notification --------------------- */


/*************************************Edit profile Delivery******************************************************************* */
export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;
    
    if(deliveryUser){
        
        const { lat, lng } = req.body;

        const profile = await DeliveryUser.findById(deliveryUser._id);

        if(profile){
            
            if(lat && lng){
                profile.lat = lat;
                profile.lng = lng;
            }

            profile.isAvailable = !profile.isAvailable;

            const result = await profile.save();

            return res.status(201).json(result);
        }

    }
    return res.status(400).json({ msg: 'Error while Updating Profile'});

}


