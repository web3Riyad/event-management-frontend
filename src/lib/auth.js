import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URL);
const db = client.db("EventManagement");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: { 
    enabled: true, 
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID?.trim() || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID?.trim() || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() || "",
    },
  },
  plugins: [
        jwt(), 
    ]
});