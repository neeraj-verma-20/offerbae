// src/lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI not defined. Check your environment variables on Vercel.");
  throw new Error("❌ MONGODB_URI not defined in environment variables.");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
