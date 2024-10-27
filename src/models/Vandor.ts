import mongoose, {Schema, Document, Model} from "mongoose";

interface VandorDoc extends Document {
    name: string;
    ownerName: string;
    foodType: [string];
    pincode: string;
    address: string;
    phone : string;
    email: string;
    password: string;
    salt: string;
    serviceAvalaible: boolean;
    coverImages : [string];
    rating: number;
    foods: any;
    lat: number; //latitude
    lng: number //longitude
}

const VandorSchema = new Schema ({
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    foodType: { type: [String] },
    pincode: { type: String, required: true },
    address: { type: String, required: true },
    phone : { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    serviceAvalaible: { type: Boolean, },
    coverImages : { type: [String] },
    rating: { type: Number, required: true },
    foods: [{ //ajoute automatiquement un objet Food à ce champ lorsqu'il est créé
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'food'
    }],
    lat: { type: Number },
    lng: { type: Number }
},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true
})

const Vandor = mongoose.model<VandorDoc>('vandor', VandorSchema)

export { Vandor }