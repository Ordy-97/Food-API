import mongoose, {Schema, Document, Model} from "mongoose";

export interface OfferDoc extends Document {

    offerType: string; //VANDOR //GENERIC
    vandors: [any];
    title: string; // INR 200 off on week days
    description: string; // any description with terms and conditions
    minValue: number; // minimum order amount should 300
    offerAmount: number; //200
    startValidity: Date;
    endValidity: Date;
    promoCode: string; // WEEK200
    promoType: string; // USER // ALL // BANK // CARD
    bank: [any];
    bins: [any];
    pincode: string;
    isActive: boolean;
}

const OfferSchema = new Schema({

    offerType: {type: String, require: true},
    vandors: [
        {type: Schema.Types.ObjectId, ref: 'vandor'},
    ],
    title: {type: String, require: true},
    description: {type: String},
    minValue: {type: Number, require: true},
    offerAmount: {type: Number, require: true},
    startValidity: Date,
    endValidity: Date,
    promoCode: {type: String, require: true},
    promoType: {type: String, require: true},
    bank: [{ type: String}],
    bins: [{ type: Number}],
    pincode: {type: String, require: true},
    isActive: {type: Boolean},
  
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;

        }
    },
    timestamps: true
});


const Offer = mongoose.model<OfferDoc>('offer', OfferSchema)

export { Offer };