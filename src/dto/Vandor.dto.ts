export interface CreateVandorInput {
    name: string;
    ownerName: string;
    foodType: [string];
    pincode: string;
    address: string;
    phone : string;
    email: string;
    password: string;
}

export interface VandorLoginInputs {
    email: string;
    password: string;
}

export interface EditVandorInputs {
    address: string;
    phone: string;
    name: string;
    foodType: [string];
}

//interface ou objet json utilisé pour créer le token
export interface VandorPayLoad {
    _id: string;
    email: string;
    name: string;
    // foodType: [string];
}


// interface json pour l'objet Offer
export interface CreateOfferInputs {
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