import express, {Request, Response, NextFunction} from 'express'
import { CreateVandorInput } from '../dto'
import { DeliveryUser, Transaction, Vandor } from '../models';
import { GeneratePassword, GenerateSalt } from '../utility';

export const FindVandor = async (id: string | undefined, email?: string) => {
    if(email) {
        return await Vandor.findOne({ email: email });
    } else {
        return await Vandor.findById(id);
    }
}

export const CreateVandor = async (req:Request, res:Response, next:NextFunction) => {
    const {name, address, pincode, foodType, email, password, ownerName, phone} = <CreateVandorInput> req.body;

    const existingVandor = await FindVandor('', email);

    if(existingVandor !== null){
        return res.status(301).json({ message : "The vandor already exit with email ID"});
    }

    //generate salt
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);
    //encrypt password with this salt

    const createdVandor = await Vandor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        salt: salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvalaible: false,
        coverImages: [],
        foods: [],
        lat: 0,
        lng: 0
    })

    res.status(201).json({ createdVandor });

}

export const GetVandors = async (req:Request, res:Response, next:NextFunction) => {

    const vandors = await Vandor.find();

    if(vandors !== null){
        return res.json({ vandors });
    }
    
     res.status(200).json({message: "There's no vandor registred !"});
}

export const GetVandorById = async (req:Request, res:Response, next:NextFunction) => {
    const vandorId = req.params.id;

    const vandorFound = await FindVandor(vandorId);
    if( vandorFound !== null ){
        return res.status(200).json({ vandorFound });
    }

    res.status(401).json({message: "This vandor doesn't exist !"});
}


/*****************************Get Transactions ****************** **********************************/
export const GetTransactions = async (req:Request, res:Response, next:NextFunction) => {

    const transactions = await Transaction.find();

    if(transactions !== null){
        return res.json({ transactions });
    }
    
     res.status(200).json({message: "Transactions not available !"});
}

export const GetTransactionById = async (req:Request, res:Response, next:NextFunction) => {
    const transactionId = req.params.id;

    const transactionFound = await Transaction.findById(transactionId);
    if( transactionFound !== null ){
        return res.status(200).json({ transactionFound });
    }

    res.status(401).json({message: "Transaction not available !"});
}

export const DeleteVandor = async (req:Request, res:Response, next:NextFunction) => {

}

/*************************Delivery section ******************************************************/


/*************************Delivery verifying ******************************************************/
export const VerifyDeliveryUser = async (req: Request, res: Response, next: NextFunction) => {

    const { _id, status } = req.body;

    if(_id){

        const profile = await DeliveryUser.findById(_id);

        if(profile){
            profile.verified = status;
            const result = await profile.save();

            return res.status(200).json(result);
        }
    }

    return res.json({ message: 'Unable to verify Delivery User'});
}

/************************* Get Users Delivery ******************************************************/
export const GetDeliveryUsers = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUsers = await DeliveryUser.find();

    if(deliveryUsers){
        return res.status(200).json(deliveryUsers);
    }
    
    return res.json({ message: 'Unable to get Delivery Users'});
}