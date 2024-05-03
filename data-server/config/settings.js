import dotenv from 'dotenv';

dotenv.config({ path: './data-server/.env' });

export const mongoConfig = {
  serverUrl: process.env.MONGO_SERVER_URL,
  database: "VeilChatMongoDB",
};