import bcrypt from 'bcrypt'
import { Request } from 'express';

import jwt from 'jsonwebtoken';
import { APP_KEY_SECRET } from '../config';
import { AuthPayload } from '../dto/index';

export const GenerateSalt = async () => {
    return await bcrypt.genSalt();
}

export const GeneratePassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt);
}

export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {
    return await GeneratePassword(enteredPassword, salt) === savedPassword;
}

//generate token

export const GenerateSignature = async (payload: AuthPayload) => {
    
    return jwt.sign(payload, APP_KEY_SECRET, { expiresIn : '1d' } );
}

//fonction qui permet de décoder notre token/signature et l'assimile l'objet user de la requête qui est de type payload
//cette fonction est appellée dan notre middleware et qui est passée à notre route
export const ValidateSignature = async(req: Request) => {

    const signature = req.get('Authorization');
    
    if(signature) {
        const payload = await jwt.verify(signature.split(' ')[1], APP_KEY_SECRET) as AuthPayload;

        req.user = payload;

        return true;
    }

    return false;
}