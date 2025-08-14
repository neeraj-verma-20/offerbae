// src/lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment variables');
  throw new Error('Please add your Mongo URI to .env.local');
}

console.log('MongoDB URI found:', uri ? 'Yes' : 'No');

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
