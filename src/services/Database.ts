import mongoose from "mongoose";
import { MONGO_URI } from "../config";

//connexio à mongodb atlas

export default async() => {

   await mongoose.connect(MONGO_URI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

}