//Email

//Notification

//OTP
export const GenerateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date();
    expiry.setTime( new Date().getTime() + (30 * 60 * 1000));

    return { otp, expiry }
}

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {

    const accountSID = process.env.NODE_FOOD_API_ACCOUNTSID;
    const authTOken = process.env.NODE_FOOD_API_AUTHTOKEN;
    const client = require('twilio')(accountSID, authTOken)

    const response = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from:'+12073833965',
        to: `+237 ${toPhoneNumber}`,
    })

    return response;
}

//Payment notification or email