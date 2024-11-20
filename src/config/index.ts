
export const MONGO_URI = `mongodb+srv://${process.env.NODE_FOOD_API_USER}:${process.env.NODE_FOOD_API_PASSWORD_SECRET}@cluster0.c8hs5ga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

export const APP_KEY_SECRET = process.env.NODE_FOOD_API_APP_KEY_SECRET;

export const PORT = process.env.PORT || 8000;